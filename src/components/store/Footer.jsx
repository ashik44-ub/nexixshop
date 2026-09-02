export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="text-white font-bold text-lg mb-3">ShopNow</h4>
          <p>Your one-stop shop for everything you need, delivered fast.</p>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3">Company</h5>
          <ul className="space-y-2">
            <li>About</li>
            <li>Contact</li>
            <li>Careers</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3">Support</h5>
          <ul className="space-y-2">
            <li>Help Center</li>
            <li>Returns</li>
            <li>Shipping Info</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ShopNow. All rights reserved.
      </div>
    </footer>
  );
}
