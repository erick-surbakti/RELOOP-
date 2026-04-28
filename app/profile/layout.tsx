import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BuyerNavbar from "@/components/buyer/BuyerNavbar";
import SellerSidebar from "@/components/seller/SellerSidebar";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSeller = profile?.role === "seller";

  return (
    <div className={`min-h-screen ${isSeller ? "bg-stone-950 flex" : "bg-ivory-100 pb-16"}`}>
      {isSeller ? (
        <>
          <SellerSidebar />
          <main className="flex-1 ml-0 lg:ml-64 min-h-screen bg-stone-50">
            {children}
          </main>
        </>
      ) : (
        <>
          <BuyerNavbar />
          <main>{children}</main>
        </>
      )}
    </div>
  );
}
