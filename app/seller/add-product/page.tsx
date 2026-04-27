"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const CATEGORIES = ["tops","bottoms","dresses","outerwear","shoes","bags","accessories","activewear","formal"];
const CONDITIONS = [
  { value: "new",      label: "New",      desc: "Never worn, with tags" },
  { value: "like_new", label: "Like New", desc: "Worn once or twice" },
  { value: "good",     label: "Good",     desc: "Gently used" },
  { value: "fair",     label: "Fair",     desc: "Visible wear" },
];
const SIZES = ["XS","S","M","L","XL","XXL","36","37","38","39","40","41","42","43","One Size"];

export default function AddProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "", description: "", price: "", category: "tops", size: "M", condition: "like_new", stock: "1" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) { toast.error("Upload a product image first"); return; }
    setUploading(true);
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) { toast.error("Not authenticated"); setUploading(false); return; }
    const ext = imageFile.name.split(".").pop();
    const path = `products/${user.id}/${Date.now()}.${ext}`;
    const { error: ue } = await s.storage.from("product-images").upload(path, imageFile);
    if (ue) { toast.error("Image upload failed"); setUploading(false); return; }
    const { data: { publicUrl } } = s.storage.from("product-images").getPublicUrl(path);
    const { error: ie } = await s.from("products").insert({
      seller_id: user.id, name: form.name, brand: form.brand, description: form.description,
      price: parseFloat(form.price), category: form.category, size: form.size,
      condition: form.condition, stock: parseInt(form.stock), image_url: publicUrl,
    });
    if (ie) { toast.error("Failed to add product"); setUploading(false); return; }
    toast.success("Product listed!");
    router.push("/seller/manage-products");
  };

  return (
    <div className="pt-14 lg:pt-0" style={{ minHeight: "100vh", background: "#F5F3EF" }}>
      <div style={{ padding: "40px 32px", maxWidth: 900 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <Link href="/seller/dashboard" style={{ color: "#B0A89E", display: "flex" }}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A9590", marginBottom: 4, fontFamily: "var(--font-body)" }}>Seller Studio</p>
            <h1 className="font-display font-light" style={{ fontSize: "2rem", color: "#171412" }}>List New Product</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>

          {/* Image upload */}
          <div style={{ background: "white", padding: 20 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", marginBottom: 14, fontFamily: "var(--font-body)" }}>
              Product Photo
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ aspectRatio: "3/4", position: "relative", background: "#F5F3EF", cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); setImageFile(null); }}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, background: "rgba(23,20,18,0.65)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" strokeWidth={1} style={{ color: "#C8C3BB" }} />
                  <p style={{ fontSize: 11, color: "#C8C3BB", textAlign: "center", lineHeight: 1.5, fontFamily: "var(--font-body)", fontWeight: 300 }}>
                    Click to upload<br />JPG, PNG up to 5MB
                  </p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </div>

          {/* Fields */}
          <div style={{ background: "white", padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", fontFamily: "var(--font-body)" }}>
              Product Details
            </p>

            {[
              { label: "Product Name", key: "name", placeholder: "e.g. Vintage Levi's 501 Jeans", type: "text", required: true },
              { label: "Brand", key: "brand", placeholder: "e.g. Levi's, Zara, Uniqlo", type: "text", required: true },
            ].map(({ label, key, placeholder, type, required }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", marginBottom: 10, fontFamily: "var(--font-body)" }}>
                  {label}
                </label>
                <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                  placeholder={placeholder} required={required} className="input-elegant" />
              </div>
            ))}

            {/* Category + Size */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", marginBottom: 10, fontFamily: "var(--font-body)" }}>Category</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} className="input-elegant" style={{ cursor: "pointer" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", marginBottom: 10, fontFamily: "var(--font-body)" }}>Size</label>
                <select value={form.size} onChange={e => set("size", e.target.value)} className="input-elegant" style={{ cursor: "pointer" }}>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", marginBottom: 10, fontFamily: "var(--font-body)" }}>
                Condition
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                {CONDITIONS.map(({ value, label, desc }) => {
                  const active = form.condition === value;
                  return (
                    <button key={value} type="button" onClick={() => set("condition", value)}
                      style={{ padding: "12px 14px", textAlign: "left", border: `1px solid ${active ? "#171412" : "rgba(0,0,0,0.08)"}`, background: active ? "#171412" : "transparent", cursor: "pointer", transition: "all 0.3s ease" }}>
                      <div style={{ fontSize: 12, fontWeight: 400, color: active ? "rgba(247,245,240,0.9)" : "#171412", marginBottom: 2, fontFamily: "var(--font-body)" }}>{label}</div>
                      <div style={{ fontSize: 11, color: active ? "rgba(247,245,240,0.4)" : "#B0A89E", fontFamily: "var(--font-body)", fontWeight: 300 }}>{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price + Stock */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Price (IDR)", key: "price", placeholder: "150000", type: "number" },
                { label: "Stock",       key: "stock", placeholder: "1",      type: "number" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", marginBottom: 10, fontFamily: "var(--font-body)" }}>{label}</label>
                  <input type={type} min="0" value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                    placeholder={placeholder} required className="input-elegant" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A9590", marginBottom: 10, fontFamily: "var(--font-body)" }}>
                Description
              </label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="Describe the piece — material, fit, any defects, styling notes..."
                rows={4} className="input-elegant" style={{ resize: "none", lineHeight: 1.7 }} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
              <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
                {uploading
                  ? <span className="inline-block w-4 h-4 rounded-full animate-spin" style={{ border: "1.5px solid rgba(255,255,255,0.25)", borderTopColor: "white" }} />
                  : <><Upload className="w-4 h-4" strokeWidth={1.5} /> List Product</>}
              </button>
              <Link href="/seller/dashboard" className="btn-secondary">Cancel</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
