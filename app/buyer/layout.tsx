import BuyerNavbar from "@/components/buyer/BuyerNavbar";
import Chatbot from "@/components/Chatbot";
import BottomNav from "@/components/buyer/BottomNav";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory-100 pb-16">
      <BuyerNavbar />
      <main>{children}</main>
      <Chatbot />
      <BottomNav />
    </div>
  );
}
