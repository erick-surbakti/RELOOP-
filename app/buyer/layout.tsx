import BuyerNavbar from "@/components/buyer/BuyerNavbar";
import Chatbot from "@/components/Chatbot";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <BuyerNavbar />
      <main>{children}</main>
      <Chatbot />
    </div>
  );
}
