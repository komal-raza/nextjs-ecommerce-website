"use client";

import { useState } from "react";
import { ArrowRight, CheckIcon } from "./Icons";

/** Newsletter strip — UI only, nothing is sent anywhere. */
export default function Newsletter() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <section className="newsletter">
      <div className="container newsletter__inner">
        <div>
          <p className="micro">The VELOUR letter</p>
          <h2 className="h3">Early access, in your inbox.</h2>
        </div>
        {done ? (
          <p className="newsletter__done"><CheckIcon /> Thank you — you&apos;re on the list.</p>
        ) : (
          <form
            className="newsletter__form"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setDone(true);
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" aria-label="Subscribe"><ArrowRight /></button>
          </form>
        )}
      </div>
    </section>
  );
}

