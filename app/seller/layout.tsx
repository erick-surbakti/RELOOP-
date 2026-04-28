import SellerSidebar from "@/components/seller/SellerSidebar";
import Chatbot from "@/components/Chatbot";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-950 flex">
      <SellerSidebar />
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen bg-stone-50">
        {children}
      </main>
      <Chatbot />
    </div>
  );
}
