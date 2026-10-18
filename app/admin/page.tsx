"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { money } from "@/lib/format";
import { getClientAuthToken, insforge } from "@/lib/insforge";

interface ProductRecord {
  id: string;
  name: string;
  category: "women" | "men";
  subcategory: string;
  price: number;
  compare_at_price?: number | null;
  description: string;
  sizes: string[];
  images: string[];
  featured: boolean;
  is_new: boolean;
  trending: boolean;
  created_at?: string;
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modal / Editing state
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<"women" | "men">("women");
  const [formSubcategory, setFormSubcategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formComparePrice, setFormComparePrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSizes, setFormSizes] = useState<string[]>(["XS", "S", "M", "L", "XL"]);
  const [formImages, setFormImages] = useState<string[]>([""]);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formTrending, setFormTrending] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getClientAuthToken();
      const res = await fetch("/api/admin/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsCreating(true);
    setFormError(null);
    setFormSuccess(null);
    setFormName("");
    setFormCategory("women");
    setFormSubcategory("coats");
    setFormPrice("");
    setFormComparePrice("");
    setFormDescription("");
    setFormSizes(["XS", "S", "M", "L", "XL"]);
    setFormImages(["", ""]);
    setFormFeatured(false);
    setFormIsNew(true);
    setFormTrending(false);
  };

  const openEditModal = (p: ProductRecord) => {
    setIsCreating(false);
    setEditingProduct(p);
    setFormError(null);
    setFormSuccess(null);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory);
    setFormPrice(String(p.price));
    setFormComparePrice(p.compare_at_price ? String(p.compare_at_price) : "");
    setFormDescription(p.description || "");
    setFormSizes(p.sizes || ["XS", "S", "M", "L", "XL"]);
    setFormImages(p.images && p.images.length > 0 ? [...p.images] : ["", ""]);
    setFormFeatured(Boolean(p.featured));
    setFormIsNew(Boolean(p.is_new));
    setFormTrending(Boolean(p.trending));
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsCreating(false);
    setFormError(null);
    setFormSuccess(null);
    setUploadingIndex(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIndex(index);
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `admin-upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

      const { data, error } = await insforge.storage
        .from("product-images")
        .upload(filename, file);

      if (error) {
        throw new Error(error.message);
      }

      const { data: urlData } = insforge.storage
        .from("product-images")
        .getPublicUrl(filename);

      const publicUrl = urlData?.publicUrl || data?.url || filename;
      const nextImages = [...formImages];
      nextImages[index] = publicUrl;
      setFormImages(nextImages);
    } catch (err: unknown) {
      alert("Failed to upload image: " + ((err as Error).message || "Unknown error"));
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  const addImageField = () => {
    setFormImages((prev) => [...prev, ""]);
  };

  const removeImageField = (idxToRemove: number) => {
    if (formImages.length <= 1) {
      alert("At least one image must be present for a product.");
      return;
    }
    setFormImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    if (uploadingIndex === idxToRemove) {
      setUploadingIndex(null);
    } else if (uploadingIndex !== null && uploadingIndex > idxToRemove) {
      setUploadingIndex(uploadingIndex - 1);
    }
  };

  const moveImageField = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= formImages.length || fromIndex === toIndex) return;
    setFormImages((prev) => {
      const next = [...prev];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverImageIndex !== index) {
      setDragOverImageIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedImageIndex !== null && draggedImageIndex !== targetIndex) {
      moveImageField(draggedImageIndex, targetIndex);
    }
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  };

  const toggleSize = (size: string) => {
    if (formSizes.includes(size)) {
      if (formSizes.length > 1) {
        setFormSizes(formSizes.filter((s) => s !== size));
      }
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Client Validation
    if (!formName.trim()) {
      setFormError("Product title is required.");
      return;
    }
    if (!formSubcategory.trim()) {
      setFormError("Subcategory is required.");
      return;
    }
    const priceNum = Number(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Price must be a valid number greater than 0.");
      return;
    }

    const filteredImages = formImages.map((i) => i.trim()).filter(Boolean);
    if (filteredImages.length === 0) {
      setFormError("At least one product image URL is required.");
      return;
    }

    setSaving(true);
    const token = getClientAuthToken();

    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        subcategory: formSubcategory.trim().toLowerCase(),
        price: priceNum,
        compare_at_price: formComparePrice ? Number(formComparePrice) : null,
        description: formDescription.trim(),
        sizes: formSizes,
        images: filteredImages,
        featured: formFeatured,
        is_new: formIsNew,
        trending: formTrending,
      };

      let res;
      if (isCreating) {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else if (editingProduct) {
        res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res) return;
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save product.");
      }

      setFormSuccess(isCreating ? "Product created successfully!" : "Product updated successfully!");
      fetchProducts();
      setTimeout(() => {
        closeModal();
      }, 700);
    } catch (err: unknown) {
      setFormError((err as Error).message || "Error saving product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    const token = getClientAuthToken();
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete product.");
      } else {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <p className="micro" style={{ letterSpacing: "0.15em", color: "var(--ink-soft)" }}>
            CATALOG MANAGEMENT
          </p>
          <h1 className="h2" style={{ marginBlock: "0.25rem 0.5rem" }}>
            Products ({products.length})
          </h1>
          <p style={{ fontSize: "14px", color: "var(--ink-soft)", margin: 0 }}>
            View, edit, or add products, prices, images, and descriptions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn--dark"
          style={{ padding: "0.75rem 1.4rem" }}
        >
          + Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search by title or subcategory…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.6rem 1rem",
            border: "1px solid var(--line)",
            background: "var(--white)",
            fontSize: "13px",
            minWidth: "260px",
            flexGrow: 1,
          }}
        />

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["all", "women", "men"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "0.55rem 1rem",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                border: "1px solid var(--line)",
                background: categoryFilter === cat ? "var(--ink)" : "var(--white)",
                color: categoryFilter === cat ? "var(--bg)" : "var(--ink)",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--ink-soft)" }}>
          <p className="micro">Loading products catalog…</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            background: "var(--white)",
            border: "1px solid var(--line)",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px", color: "var(--ink-soft)" }}>
            No products found matching your search.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--line)",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--bg-alt)", borderBottom: "1px solid var(--line)" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Image</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Product Title</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Category</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Price</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>Badges</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const primaryImage = p.images?.[0] || "";
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "0.75rem 1rem", width: "64px" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "60px",
                          position: "relative",
                          background: "var(--bg-alt)",
                          overflow: "hidden",
                        }}
                      >
                        {primaryImage ? (
                          <SafeImage src={primaryImage} alt="" sizes="48px" />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: "10px", color: "var(--stone)" }}>
                            No img
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--stone)", fontFamily: "monospace" }}>{p.id}</div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textTransform: "capitalize" }}>
                      {p.category} <span style={{ color: "var(--stone)" }}>/ {p.subcategory}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ fontWeight: 600 }}>{money(Number(p.price))}</span>
                      {p.compare_at_price && (
                        <span style={{ textDecoration: "line-through", color: "var(--stone)", marginLeft: "0.4rem", fontSize: "11px" }}>
                          {money(Number(p.compare_at_price))}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        {p.featured && (
                          <span style={{ fontSize: "10px", background: "#fef3c7", color: "#b45309", padding: "0.15rem 0.4rem", borderRadius: "2px", fontWeight: 600 }}>
                            Featured
                          </span>
                        )}
                        {p.is_new && (
                          <span style={{ fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "0.15rem 0.4rem", borderRadius: "2px", fontWeight: 600 }}>
                            New
                          </span>
                        )}
                        {p.trending && (
                          <span style={{ fontSize: "10px", background: "#f1f5f9", color: "#334155", padding: "0.15rem 0.4rem", borderRadius: "2px", fontWeight: 600 }}>
                            Trending
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => openEditModal(p)}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--line)",
                          padding: "0.35rem 0.75rem",
                          fontSize: "12px",
                          cursor: "pointer",
                          marginRight: "0.5rem",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        disabled={deletingId === p.id}
                        style={{
                          background: "transparent",
                          border: "1px solid #fecaca",
                          color: "#b91c1c",
                          padding: "0.35rem 0.75rem",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        {deletingId === p.id ? "…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Modal */}
      {(isCreating || editingProduct) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: "1rem",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            style={{
              background: "var(--white)",
              maxWidth: "680px",
              width: "100%",
              padding: "2rem",
              borderRadius: "2px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="h3" style={{ margin: 0 }}>
                {isCreating ? "Add New Product" : `Edit Product: ${editingProduct?.name}`}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            {formError && (
              <div style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", padding: "0.75rem 1rem", fontSize: "13px", marginBottom: "1.2rem" }}>
                {formError}
              </div>
            )}

            {formSuccess && (
              <div style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", fontSize: "13px", marginBottom: "1.2rem" }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProduct} style={{ display: "grid", gap: "1.2rem" }}>
              <div className="field">
                <label>Product Title *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Cashmere Blend Overcoat"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field">
                  <label>Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as "women" | "men")}
                    style={{
                      padding: "0.65rem",
                      border: "1px solid var(--line)",
                      background: "var(--white)",
                      fontSize: "13px",
                      width: "100%",
                    }}
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>
                </div>

                <div className="field">
                  <label>Subcategory *</label>
                  <input
                    type="text"
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    placeholder="coats, knitwear, dresses, etc."
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="189.00"
                    required
                  />
                </div>

                <div className="field">
                  <label>Compare at Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(e.target.value)}
                    placeholder="250.00 (optional)"
                  />
                </div>
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Considered craft, natural wool blend, relaxed fit…"
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    border: "1px solid var(--line)",
                    fontSize: "13px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Sizes Selection */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>
                  Available Sizes
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {ALL_SIZES.map((sz) => {
                    const active = formSizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        style={{
                          width: "42px",
                          height: "36px",
                          border: active ? "2px solid var(--ink)" : "1px solid var(--line)",
                          background: active ? "var(--ink)" : "var(--white)",
                          color: active ? "var(--bg)" : "var(--ink)",
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Images */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600 }}>
                    Product Images (At least 1 required) *
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--ink-soft)" }}>
                    Drag rows or use arrows to change position
                  </span>
                </div>
                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {formImages.map((imgUrl, idx) => {
                    const isUploadingThis = uploadingIndex === idx;
                    const isUploadingAny = uploadingIndex !== null;
                    const isDragging = draggedImageIndex === idx;
                    const isDragOver = dragOverImageIndex === idx;

                    return (
                      <div
                        key={idx}
                        draggable={!isUploadingAny}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          padding: "0.5rem",
                          background: isDragOver ? "#f1f5f9" : isDragging ? "rgba(0,0,0,0.03)" : "var(--white)",
                          border: isDragOver ? "2px dashed var(--ink)" : "1px solid var(--line)",
                          borderRadius: "3px",
                          opacity: isDragging ? 0.45 : 1,
                          transition: "background 0.15s ease, border-color 0.15s ease",
                        }}
                      >
                        {/* Drag Handle */}
                        <div
                          title="Drag up or down to reorder"
                          style={{
                            cursor: isUploadingAny ? "not-allowed" : "grab",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 0.2rem",
                            color: "var(--stone)",
                            userSelect: "none",
                          }}
                        >
                          <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor">
                            <circle cx="4" cy="4" r="1.5" />
                            <circle cx="10" cy="4" r="1.5" />
                            <circle cx="4" cy="9" r="1.5" />
                            <circle cx="10" cy="9" r="1.5" />
                            <circle cx="4" cy="14" r="1.5" />
                            <circle cx="10" cy="14" r="1.5" />
                          </svg>
                        </div>

                        {/* Position Badge */}
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "0.2rem 0.45rem",
                            borderRadius: "2px",
                            background: idx === 0 ? "var(--ink)" : idx === 1 ? "var(--bg-alt)" : "#f8fafc",
                            color: idx === 0 ? "var(--bg)" : "var(--ink)",
                            border: "1px solid var(--line)",
                            whiteSpace: "nowrap",
                            minWidth: "60px",
                            textAlign: "center",
                          }}
                        >
                          {idx === 0 ? "Primary" : idx === 1 ? "Hover" : `#${idx + 1}`}
                        </span>

                        {/* Mini Thumbnail Preview */}
                        <div
                          style={{
                            width: "36px",
                            height: "44px",
                            background: "var(--bg-alt)",
                            border: "1px solid var(--line)",
                            borderRadius: "2px",
                            overflow: "hidden",
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: "9px", color: "var(--stone)" }}>Empty</span>
                          )}
                        </div>

                        {/* URL Input field */}
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const next = [...formImages];
                            next[idx] = e.target.value;
                            setFormImages(next);
                          }}
                          placeholder={
                            idx === 0
                              ? "Primary cover image URL"
                              : idx === 1
                              ? "Secondary hover image URL"
                              : `Gallery image #${idx + 1} URL`
                          }
                          style={{
                            flex: 1,
                            padding: "0.55rem 0.65rem",
                            border: "1px solid var(--line)",
                            fontSize: "13px",
                            minWidth: 0,
                          }}
                        />

                        {/* Upload Button */}
                        <label
                          style={{
                            background: "var(--bg-alt)",
                            border: "1px solid var(--line)",
                            padding: "0.5rem 0.75rem",
                            fontSize: "12px",
                            cursor: isUploadingAny ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            opacity: isUploadingAny && !isUploadingThis ? 0.6 : 1,
                            borderRadius: "2px",
                          }}
                        >
                          {isUploadingThis ? "Uploading…" : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            disabled={isUploadingAny}
                            onChange={(e) => handleImageUpload(e, idx)}
                          />
                        </label>

                        {/* Move Up/Down Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <button
                            type="button"
                            disabled={idx === 0 || isUploadingAny}
                            onClick={() => moveImageField(idx, idx - 1)}
                            title="Move Up"
                            style={{
                              border: "1px solid var(--line)",
                              background: "var(--white)",
                              fontSize: "9px",
                              width: "22px",
                              height: "16px",
                              display: "grid",
                              placeItems: "center",
                              cursor: idx === 0 || isUploadingAny ? "not-allowed" : "pointer",
                              opacity: idx === 0 ? 0.3 : 1,
                              borderRadius: "2px",
                            }}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === formImages.length - 1 || isUploadingAny}
                            onClick={() => moveImageField(idx, idx + 1)}
                            title="Move Down"
                            style={{
                              border: "1px solid var(--line)",
                              background: "var(--white)",
                              fontSize: "9px",
                              width: "22px",
                              height: "16px",
                              display: "grid",
                              placeItems: "center",
                              cursor: idx === formImages.length - 1 || isUploadingAny ? "not-allowed" : "pointer",
                              opacity: idx === formImages.length - 1 ? 0.3 : 1,
                              borderRadius: "2px",
                            }}
                          >
                            ▼
                          </button>
                        </div>

                        {/* Delete Button Icon */}
                        <button
                          type="button"
                          disabled={formImages.length <= 1 || isUploadingAny}
                          onClick={() => removeImageField(idx)}
                          title={formImages.length <= 1 ? "At least one image must be present for a product" : "Remove this image"}
                          style={{
                            border: "1px solid #fecaca",
                            background: formImages.length <= 1 ? "#f9fafb" : "#fef2f2",
                            color: formImages.length <= 1 ? "var(--stone)" : "#b91c1c",
                            width: "32px",
                            height: "32px",
                            display: "grid",
                            placeItems: "center",
                            cursor: formImages.length <= 1 || isUploadingAny ? "not-allowed" : "pointer",
                            opacity: formImages.length <= 1 ? 0.35 : 1,
                            borderRadius: "2px",
                            flexShrink: 0,
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addImageField}
                    disabled={uploadingIndex !== null}
                    style={{
                      background: "transparent",
                      border: "1px dashed var(--line)",
                      padding: "0.55rem",
                      fontSize: "12px",
                      cursor: uploadingIndex !== null ? "not-allowed" : "pointer",
                      color: "var(--ink-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      borderRadius: "2px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>+</span> Add Another Image ({formImages.length} {formImages.length === 1 ? "image" : "images"})
                  </button>
                </div>
              </div>

              {/* Status checkboxes */}
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                  />
                  Featured Piece
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formIsNew}
                    onChange={(e) => setFormIsNew(e.target.checked)}
                  />
                  New Arrival
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "13px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formTrending}
                    onChange={(e) => setFormTrending(e.target.checked)}
                  />
                  Trending
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn--outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--dark"
                  disabled={saving || uploadingIndex !== null}
                  style={{
                    opacity: saving || uploadingIndex !== null ? 0.6 : 1,
                    cursor: saving || uploadingIndex !== null ? "not-allowed" : "pointer",
                  }}
                >
                  {uploadingIndex !== null
                    ? "Uploading Image…"
                    : saving
                    ? "Saving…"
                    : isCreating
                    ? "Create Product"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

