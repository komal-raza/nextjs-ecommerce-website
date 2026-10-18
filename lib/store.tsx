"use client";

/**
 * Cart state: React Context + localStorage persistence for guests,
 * synchronized with InsForge `carts` table when logged in.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { insforge } from "./insforge";

export interface CartItem {
  /** `${productId}:${size}` — one line per product/size combination. */
  key: string;
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  remove: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
}

const STORAGE_KEY = "eluara-cart-v1";
const LEGACY_STORAGE_KEY = "velour-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

interface DbCartRow {
  product_id: string;
  size: string;
  quantity: number;
  products?: {
    id: string;
    name: string;
    price: number | string;
    images: string[];
  } | null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const userRef = useRef<string | null>(null);
  userRef.current = userId;

  // 1. Initial hydration from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* corrupted storage — start fresh */
    }
    setHydrated(true);
  }, []);

  // 2. Persist items to localStorage on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / unavailable */
    }
  }, [items, hydrated]);

  // 3. Sync with InsForge user & database cart
  const syncUserCart = useCallback(async (uid: string) => {
    try {
      const { data, error } = await insforge.database
        .from("carts")
        .select("product_id, size, quantity, products(id, name, price, images)")
        .eq("user_id", uid);

      if (error) {
        console.error("Error fetching cart from database:", error);
        return;
      }

      const dbRows = (data as unknown as DbCartRow[]) || [];
      const dbItems: CartItem[] = dbRows
        .filter((r) => r.products)
        .map((r) => ({
          key: `${r.product_id}:${r.size}`,
          id: r.product_id,
          name: r.products!.name,
          price: Number(r.products!.price),
          image: r.products!.images?.[0] || "",
          size: r.size,
          qty: r.quantity,
        }));

      // Merge current local items into database if any exist
      setItems((currentItems) => {
        const merged = [...dbItems];
        for (const localItem of currentItems) {
          const idx = merged.findIndex((i) => i.key === localItem.key);
          if (idx === -1) {
            merged.push(localItem);
            // Write local item to DB
            insforge.database.from("carts").upsert([
              {
                user_id: uid,
                product_id: localItem.id,
                size: localItem.size,
                quantity: localItem.qty,
                updated_at: new Date().toISOString(),
              },
            ]).then();
          }
        }
        return merged;
      });
    } catch (err) {
      console.error("Failed to sync cart:", err);
    }
  }, []);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      const uid = data?.user?.id ?? null;
      setUserId(uid);
      if (uid) syncUserCart(uid);
    });

    const unsubscribe = insforge.auth.onAuthStateChange(() => {
      insforge.auth.getCurrentUser().then(({ data }) => {
        const uid = data?.user?.id ?? null;
        setUserId(uid);
        if (uid) syncUserCart(uid);
      });
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [syncUserCart]);

  // 4. Cart actions with write-through
  const add = useCallback<CartContextValue["add"]>((item, qty = 1) => {
    const key = `${item.id}:${item.size}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      const newQty = existing ? Math.min(99, existing.qty + qty) : qty;

      if (userRef.current) {
        insforge.database.from("carts").upsert([
          {
            user_id: userRef.current,
            product_id: item.id,
            size: item.size,
            quantity: newQty,
            updated_at: new Date().toISOString(),
          },
        ]).then();
      }

      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: newQty } : i));
      }
      return [...prev, { ...item, key, qty: newQty }];
    });
  }, []);

  const remove = useCallback((key: string) => {
    const [productId, size] = key.split(":");
    setItems((prev) => prev.filter((i) => i.key !== key));

    if (userRef.current && productId && size) {
      insforge.database
        .from("carts")
        .delete()
        .eq("user_id", userRef.current)
        .eq("product_id", productId)
        .eq("size", size)
        .then();
    }
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    const [productId, size] = key.split(":");
    const clamped = Math.min(99, qty);

    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty: clamped } : i)),
    );

    if (userRef.current && productId && size) {
      if (qty <= 0) {
        insforge.database
          .from("carts")
          .delete()
          .eq("user_id", userRef.current)
          .eq("product_id", productId)
          .eq("size", size)
          .then();
      } else {
        insforge.database.from("carts").upsert([
          {
            user_id: userRef.current,
            product_id: productId,
            size,
            quantity: clamped,
            updated_at: new Date().toISOString(),
          },
        ]).then();
      }
    }
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    if (userRef.current) {
      insforge.database
        .from("carts")
        .delete()
        .eq("user_id", userRef.current)
        .then();
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
      add,
      remove,
      updateQty,
      clear,
    }),
    [items, hydrated, add, remove, updateQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
