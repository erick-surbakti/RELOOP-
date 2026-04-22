import BuyerNavbar from "@/components/buyer/BuyerNavbar";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory-100">
      <BuyerNavbar />
      <main>{children}</main>
    </div>
  );
}
