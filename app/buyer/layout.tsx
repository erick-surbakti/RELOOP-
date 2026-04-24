import BuyerNavbar from "@/components/buyer/BuyerNavbar";
import Chatbot from "@/components/Chatbot";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory-100">
      <BuyerNavbar />
      <main>{children}</main>
      <Chatbot />
    </div>
  );
}
