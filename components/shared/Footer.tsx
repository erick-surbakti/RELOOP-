import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#111009", color: "#6B665E" }}>
      <div className="section-container py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand */}
          <div className="lg:col-span-5">
            <span className="font-display text-[2.5rem] text-white/90 font-light tracking-[0.15em] uppercase block mb-5">
              Reloop
            </span>
            <p className="text-sm font-light leading-relaxed max-w-xs" style={{ color: "#4A4540" }}>
              Indonesia's premier secondhand fashion marketplace. Curated pieces, trusted sellers, sustainable choices.
            </p>
            <div className="flex items-center gap-2 mt-8">
              <div className="w-1.5 h-1.5 rounded-full bg-sage-400" style={{ animation: "pulse 2s infinite" }} />
              <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "#3A3530" }}>
                Sustainable · Circular · Conscious
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-8">
            {[
              {
                title: "Shop",
                links: [
                  { label: "New Arrivals", href: "/buyer/homepage" },
                  { label: "Tops", href: "/buyer/homepage" },
                  { label: "Dresses", href: "/buyer/homepage" },
                  { label: "Shoes", href: "/buyer/homepage" },
                  { label: "Bags", href: "/buyer/homepage" },
                ],
              },
              {
                title: "Account",
                links: [
                  { label: "Profile", href: "/buyer/profile" },
                  { label: "My Orders", href: "/buyer/orders" },
                  { label: "Wishlist", href: "/buyer/wishlist" },
                  { label: "Cart", href: "/buyer/cart" },
                ],
              },
              {
                title: "Sellers",
                links: [
                  { label: "Dashboard", href: "/seller/dashboard" },
                  { label: "Add Product", href: "/seller/add-product" },
                  { label: "My Products", href: "/seller/manage-products" },
                  { label: "Orders", href: "/seller/orders" },
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: "#3A3530" }}>{title}</h4>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href}
                        className="text-sm font-light hover-underline transition-colors duration-300 hover:text-white/70"
                        style={{ color: "#4A4540" }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[11px] tracking-wider" style={{ color: "#2E2A26" }}>
            © 2024 Reloop. All rights reserved.
          </span>
          <span className="text-[11px] tracking-wider" style={{ color: "#2E2A26" }}>
            Made with care in Indonesia
          </span>
        </div>
      </div>
    </footer>
  );
}
