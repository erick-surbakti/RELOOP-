"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Save, User, ShoppingBag, Store, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Profile, UserRole } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: "", phone: "", address: "", city: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
        });
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
      full_name: form.full_name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);
    
    if (error) { 
      toast.error("Failed to save"); 
    } else { 
      toast.success("Profile updated");
      // Refresh profile data
      const { data } = await supabase.from("profiles").select("*").eq("id", profile.id).single();
      if (data) setProfile(data);
    }
    setSaving(false);
  };

  const handleSwitchRole = async (newRole: UserRole) => {
    if (!profile || profile.role === newRole) return;
    setSwitching(true);
    const supabase = createClient();
    
    const { error } = await supabase.from("profiles").update({
      role: newRole,
      updated_at: new Date().toISOString(),
    }).eq("id", profile.id);

    if (error) {
      toast.error("Failed to switch role");
      setSwitching(false);
      return;
    }

    toast.success(`Switched to ${newRole} account`);
    if (newRole === "seller") {
      router.push("/seller/dashboard");
    } else {
      router.push("/buyer/homepage");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `avatars/${profile.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed"); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);
    setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
    toast.success("Avatar updated");
    setUploadingAvatar(false);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen section-container py-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="skeleton h-32 rounded-full w-32 mx-auto" />
          {[1,2,3,4].map((i) => <div key={i} className="skeleton h-14 rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <span className="text-xs tracking-widest uppercase text-stone-400 block mb-1">My</span>
            <h1 className="font-display text-4xl text-stone-900 font-light">Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Account Type Switcher */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-stone-100 p-6">
                <h3 className="text-xs tracking-widest uppercase text-stone-500 mb-4">Account Type</h3>
                <div className="space-y-3">
                  {[
                    { role: "buyer" as UserRole, label: "Buyer Account", icon: ShoppingBag, desc: "Shop curated fashion" },
                    { role: "seller" as UserRole, label: "Seller Account", icon: Store, desc: "Sell your pre-loved items" },
                  ].map((item) => (
                    <button
                      key={item.role}
                      onClick={() => handleSwitchRole(item.role)}
                      disabled={switching || profile?.role === item.role}
                      className={`w-full p-4 text-left border transition-all duration-300 flex items-start gap-3 ${
                        profile?.role === item.role
                          ? "border-stone-800 bg-stone-900 text-ivory-100"
                          : "border-stone-100 bg-stone-50/50 text-stone-600 hover:border-stone-300"
                      } ${switching ? "opacity-50 cursor-wait" : ""}`}
                    >
                      <item.icon className={`w-5 h-5 mt-0.5 ${profile?.role === item.role ? "text-warm-300" : "text-stone-400"}`} />
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className={`text-[11px] mt-0.5 ${profile?.role === item.role ? "text-stone-400" : "text-stone-500"}`}>
                          {item.desc}
                        </div>
                      </div>
                      {profile?.role === item.role && (
                        <div className="ml-auto">
                          <div className="w-1.5 h-1.5 rounded-full bg-warm-300" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <p className="mt-4 text-[11px] text-stone-400 leading-relaxed italic">
                  * Switching accounts will redirect you to the respective dashboard.
                </p>
              </div>

              {/* Quick links or info could go here */}
            </div>

            {/* Right: Profile Details */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-stone-100 p-8"
              >
                {/* Avatar */}
                <div className="flex justify-center mb-10">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-stone-100 overflow-hidden flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-stone-300" />
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center rounded-full">
                          <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-0 right-0 w-9 h-9 bg-stone-900 text-ivory-100 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors shadow-elegant"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {[
                    { label: "Full Name", key: "full_name", placeholder: "Your full name", type: "text" },
                    { label: "Phone Number", key: "phone", placeholder: "+62 xxx xxxx xxxx", type: "tel" },
                    { label: "Address", key: "address", placeholder: "Street address", type: "text" },
                    { label: "City / Regency", key: "city", placeholder: "Jakarta, Bandung, etc.", type: "text" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">{label}</label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="input-elegant"
                      />
                    </div>
                  ))}

                  {/* Email (read only) */}
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="input-elegant opacity-50 cursor-not-allowed bg-stone-50"
                    />
                  </div>

                  <div className="pt-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                      {saving ? (
                        <span className="w-4 h-4 border-2 border-ivory-300/40 border-t-ivory-300 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Role badge */}
              <div className="mt-4 flex items-center gap-2 text-stone-400 text-xs">
                <span className="bg-stone-100 text-stone-600 px-3 py-1 text-[11px] tracking-widest uppercase">
                  {profile?.role}
                </span>
                <span>account · {profile?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
