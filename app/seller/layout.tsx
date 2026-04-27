import SellerSidebar from "@/components/seller/SellerSidebar";
import Chatbot from "@/components/Chatbot";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F5F3EF" }}>
      <SellerSidebar />
      <main style={{ flex: 1, marginLeft: 0 }} className="lg:ml-[240px]">
        {children}
      </main>
      <Chatbot />
    </div>
  );
}
