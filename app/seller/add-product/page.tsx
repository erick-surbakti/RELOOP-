"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, X, Camera, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "shoes", "bags", "accessories", "activewear", "formal"];
const CONDITIONS = [
  { value: "new", label: "New — Never worn, with tags" },
  { value: "like_new", label: "Like New — Worn 1-2 times" },
  { value: "good", label: "Good — Gently used" },
  { value: "fair", label: "Fair — Visible signs of wear" },
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43", "One Size"];

export default function AddProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", brand: "", description: "", price: "",
    category: "tops", size: "M", condition: "like_new", stock: "1",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) { toast.error("Please upload a product image"); return; }

    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not authenticated"); setUploading(false); return; }

    // Upload image
    const ext = imageFile.name.split(".").pop();
    const imagePath = `products/${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(imagePath, imageFile);

    if (uploadError) { toast.error("Image upload failed"); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(imagePath);

    // Insert product
    const { error: insertError } = await supabase.from("products").insert({
      seller_id: user.id,
      name: form.name,
      brand: form.brand,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      size: form.size,
      condition: form.condition,
      stock: parseInt(form.stock),
      image_url: publicUrl,
    });

    if (insertError) { toast.error("Failed to add product"); setUploading(false); return; }

    toast.success("Product listed successfully!");
    router.push("/seller/manage-products");
    setUploading(false);
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="pt-14 lg:pt-0 min-h-screen bg-stone-50">
      <div className="p-6 lg:p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/seller/dashboard" className="text-stone-400 hover:text-stone-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-stone-400 text-xs tracking-widest uppercase mb-1">Seller Studio</p>
            <h1 className="font-display text-3xl text-stone-900 font-light">Add New Product</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image Upload */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-stone-100 p-6 sticky top-6">
                <p className="text-xs tracking-widest uppercase text-stone-400 mb-4">Product Image</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`relative aspect-[3/4] border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden ${
                    imagePreview ? "border-stone-200" : "border-stone-200 hover:border-stone-400 bg-stone-50"
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-stone-900/70 text-white flex items-center justify-center hover:bg-stone-900 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-stone-100 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-stone-400" />
                      </div>
                      <p className="text-xs text-stone-400 text-center px-4">Click to upload product photo</p>
                      <p className="text-[11px] text-stone-300">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-5 bg-white border border-stone-100 p-6">
              <p className="text-xs tracking-widest uppercase text-stone-400 mb-6">Product Details</p>

              {/* Name */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Product Name *</label>
                <input required value={form.name} onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Vintage Levi's 501 Jeans" className="input-elegant" />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs tracking-widets uppercase text-stone-400 mb-2">Brand *</label>
                <input required value={form.brand} onChange={(e) => update("brand", e.target.value)}
                  placeholder="e.g. Levi's, Zara, Uniqlo" className="input-elegant" />
              </div>

              {/* Category + Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Category *</label>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)}
                    className="input-elegant capitalize cursor-pointer">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Size *</label>
                  <select value={form.size} onChange={(e) => update("size", e.target.value)}
                    className="input-elegant cursor-pointer">
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Condition *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map(({ value, label }) => (
                    <button
                      key={value} type="button" onClick={() => update("condition", value)}
                      className={`p-3 text-left text-xs border transition-all duration-200 ${
                        form.condition === value
                          ? "border-stone-800 bg-stone-50 text-stone-800"
                          : "border-stone-200 text-stone-500 hover:border-stone-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Price (IDR) *</label>
                  <input required type="number" min="0" value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="e.g. 150000" className="input-elegant" />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Stock *</label>
                  <input required type="number" min="1" value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    placeholder="1" className="input-elegant" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe the piece — material, fit, any defects, styling notes..."
                  rows={4} className="input-elegant resize-none" />
              </div>

              {/* Submit */}
              <div className="pt-2 flex gap-3">
                <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-ivory-300/40 border-t-ivory-300 rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      List Product
                    </>
                  )}
                </button>
                <Link href="/seller/dashboard" className="btn-secondary">Cancel</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
