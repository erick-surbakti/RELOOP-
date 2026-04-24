"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Save, User, ShoppingBag, Store, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Profile, UserRole } from "@/types";

export default function SellerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", city: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setForm({ full_name: data.full_name || "", phone: data.phone || "", address: data.address || "", city: data.city || "" });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({
      ...form, updated_at: new Date().toISOString(),
    }).eq("id", profile.id);
    if (error) toast.error("Gagal menyimpan");
    else { toast.success("Profil diperbarui"); setProfile((p) => p ? { ...p, ...form } : p); }
    setSaving(false);
  };

  const handleSwitchRole = async (newRole: UserRole) => {
    if (!profile || newRole === profile.role) return;
    setSwitchingRole(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", profile.id);
    if (error) { toast.error("Gagal switch role"); setSwitchingRole(false); return; }
    toast.success(`Beralih ke mode ${newRole}! Mengalihkan...`);
    setProfile((p) => p ? { ...p, role: newRole } : p);
    await new Promise((r) => setTimeout(r, 800));
    router.push(newRole === "seller" ? "/seller/dashboard" : "/buyer/homepage");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `avatars/${profile.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Upload gagal"); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);
    setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
    toast.success("Avatar diperbarui");
    setUploadingAvatar(false);
  };

  if (loading) return (
    <div className="pt-14 lg:pt-0 min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="space-y-4 w-full max-w-xl px-8">
        <div className="skeleton h-32 rounded-full w-32 mx-auto" />
        {[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded" />)}
      </div>
    </div>
  );

  return (
    <div className="pt-14 lg:pt-0 min-h-screen bg-stone-50">
      <div className="p-6 lg:p-10">
        <div className="max-w-2xl">
          <div className="mb-10">
            <p className="text-stone-400 text-xs tracking-widest uppercase mb-1">Seller Studio</p>
            <h1 className="font-display text-3xl text-stone-900 font-light">Profile & Switch Mode</h1>
          </div>

          {/* ── ROLE SWITCHER ── */}
          <div className="bg-white border border-stone-100 p-6 mb-5">
            <p className="text-xs tracking-widest uppercase text-stone-400 mb-4">Account Mode</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { role: "buyer" as UserRole, label: "Buyer Mode", icon: ShoppingBag, desc: "Browse & purchase items" },
                { role: "seller" as UserRole, label: "Seller Mode", icon: Store, desc: "List & manage products" },
              ]).map(({ role, label, icon: Icon, desc }) => (
                <button key={role} onClick={() => handleSwitchRole(role)}
                  disabled={switchingRole || profile?.role === role}
                  className={`relative p-4 text-left border transition-all duration-300 ${
                    profile?.role === role
                      ? "border-stone-800 bg-stone-900 text-ivory-100 cursor-default"
                      : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-500 hover:bg-white"
                  }`}>
                  <Icon className={`w-5 h-5 mb-2 ${profile?.role === role ? "text-warm-300" : "text-stone-400"}`} />
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs mt-0.5 text-stone-400">{desc}</div>
                  {profile?.role === role && (
                    <span className="absolute top-3 right-3 text-[10px] tracking-widest uppercase text-warm-300">Active</span>
                  )}
                  {profile?.role !== role && !switchingRole && (
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-stone-400">
                      <ArrowRight className="w-3 h-3" /> Switch
                    </div>
                  )}
                  {switchingRole && profile?.role !== role && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400 mt-3">Switching ke Buyer Mode akan redirect ke homepage buyer.</p>
          </div>

          {/* ── PROFILE FORM ── */}
          <div className="bg-white border border-stone-100 p-8">
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center">
                  {profile?.avatar_url
                    ? <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                    : <User className="w-9 h-9 text-stone-300" />}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center rounded-full">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-stone-900 text-ivory-100 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
            </div>

            <div className="space-y-5">
              {[
                { label: "Full Name", key: "full_name", placeholder: "Your full name", type: "text" },
                { label: "Phone", key: "phone", placeholder: "+62 xxx xxxx xxxx", type: "tel" },
                { label: "Address", key: "address", placeholder: "Street address", type: "text" },
                { label: "City", key: "city", placeholder: "Jakarta, Bandung, etc.", type: "text" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">{label}</label>
                  <input type={type} value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className="input-elegant" />
                </div>
              ))}
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Email</label>
                <input type="email" value={profile?.email || ""} disabled
                  className="input-elegant opacity-50 cursor-not-allowed bg-stone-50" />
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving
                  ? <span className="w-4 h-4 border-2 border-ivory-300/40 border-t-ivory-300 rounded-full animate-spin" />
                  : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
