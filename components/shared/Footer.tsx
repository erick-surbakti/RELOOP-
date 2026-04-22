import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-ivory-200">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="font-display text-2xl tracking-[0.3em] text-ivory-100 uppercase block mb-4">
              Reloop
            </span>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              Indonesia's premier secondhand fashion marketplace. Curated pieces, trusted sellers, sustainable choices.
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase text-stone-500 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {["New Arrivals", "Tops", "Bottoms", "Dresses", "Shoes", "Bags"].map((item) => (
                <li key={item}>
                  <Link href="/buyer/homepage" className="text-stone-400 text-sm hover:text-ivory-100 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase text-stone-500 mb-4">Account</h4>
            <ul className="space-y-2.5">
              {["My Profile", "My Orders", "Wishlist", "Cart"].map((item) => (
                <li key={item}>
                  <Link href="/buyer/profile" className="text-stone-400 text-sm hover:text-ivory-100 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-stone-600 text-xs tracking-wider">
            © 2024 Reloop. All rights reserved.
          </span>
          <span className="text-stone-600 text-xs tracking-wider">
            Sustainable Fashion · Made in Indonesia
          </span>
        </div>
      </div>
    </footer>
  );
}
