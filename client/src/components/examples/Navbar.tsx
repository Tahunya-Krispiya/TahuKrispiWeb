import { Link } from "react-router-dom";
import ShoppingCart from "./ShoppingCart";

export default function Navbar() {
    return (
        <nav className="w-full px-6 py-4 flex items-center justify-between bg-[#FFF4DC]">
            {/* LEFT */}
            <Link to="/" className="font-extrabold text-xl text-orange-600">
                Tahunya Krispi-ya!
            </Link>

            {/* CENTER */}
            <div className="hidden md:flex gap-8 font-medium text-gray-700">
                <Link to="/">Home</Link>
                <Link to="/menu">Menu</Link>
                <Link to="/info">Info</Link>
                <Link to="/contact">Contact</Link>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                <ShoppingCart />

                {/* ADMIN BUTTON – BERBEDA */}
                <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition"
                >
                    Admin
                </Link>
            </div>
        </nav>
    );
}
