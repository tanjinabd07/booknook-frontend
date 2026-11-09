"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BookOpen,
  Menu,
  X,
  UserRound,
  Plus,
  Library,
  BookMarked,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

// Sobai dekhte pabe
const publicLinks = [
  { name: "Home", href: "/" },
  { name: "All Books", href: "/books" },
];

// Shudhu logged in user dekhte pabe
const privateLinks = [
  { name: "Add Book", href: "/add-book", icon: Plus },
  { name: "My Books", href: "/my-books", icon: Library },
  { name: "My Borrows", href: "/my-borrows", icon: BookMarked },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isPending } = useSession();
  const user = session?.user;

  // Logged in hole private link gulo-o dekhao
  const navLinks = user ? [...publicLinks, ...privateLinks] : publicLinks;

  // Dropdown-er baire click korle bondho koro
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await signOut();
      sessionStorage.removeItem("booknook-token");

      setIsMenuOpen(false);
      setIsDropdownOpen(false);

      toast.success("Logged out successfully");

      router.push("/");
      router.refresh();
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  // Photo thakle photo, na thakle name-er prothom okkhor
  const avatar = user?.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.image}
      alt={user.name || "User"}
      referrerPolicy="no-referrer"
      className="h-10 w-10 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
      {user?.name?.charAt(0).toUpperCase() || "U"}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-700 p-2 text-white">
            <BookOpen size={25} />
          </div>

          <span className="text-2xl font-extrabold tracking-tight">
            Book<span className="text-emerald-700">Nook</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 transition hover:text-emerald-700 ${
                  isActive(link.href) ? "text-emerald-700" : "text-gray-600"
                }`}
              >
                {Icon && <Icon size={16} />}
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Auth Area (Desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((open) => !open)}
                aria-label="Open user menu"
                aria-expanded={isDropdownOpen}
                className="flex items-center rounded-full ring-2 ring-transparent transition hover:ring-emerald-200 focus:outline-none focus:ring-emerald-300"
              >
                {avatar}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <UserRound size={16} />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:border-emerald-700 hover:text-emerald-700"
              >
                <UserRound size={17} />
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-5 py-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium text-gray-700">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 hover:text-emerald-700 ${
                    isActive(link.href) ? "text-emerald-700" : ""
                  }`}
                >
                  {Icon && <Icon size={17} />}
                  {link.name}
                </Link>
              );
            })}

            <div className="border-t border-gray-100 pt-4" />

            {isPending ? null : user ? (
              <>
                <div className="flex items-center gap-3">
                  {avatar}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-emerald-700"
                >
                  <UserRound size={17} />
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-left hover:text-red-600"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-emerald-700"
                >
                  <UserRound size={17} />
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full bg-emerald-700 px-5 py-2.5 text-center font-semibold text-white hover:bg-emerald-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
