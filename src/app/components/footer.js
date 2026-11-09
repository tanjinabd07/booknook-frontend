"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

// Brand icon gulo inline SVG, jate lucide-react version-er upor nirbhor na kore
const socialLinks = [
  {
    name: "X",
    href: "https://x.com",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    name: "GitHub",
    href: "https://github.com",
    path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
];

// Server-e khali, browser-e current year (new Date() render-e use korle Next.js warning dey)
const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();
const getServerYear = () => "";

export default function Footer() {
  const year = useSyncExternalStore(subscribe, getYear, getServerYear);

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Logo + short line */}
        <div>
          <Link href="/" className="mb-5 flex items-center gap-2">
            <div className="rounded-xl bg-emerald-700 p-2 text-white">
              <BookOpen size={25} />
            </div>

            <span className="text-2xl font-extrabold tracking-tight text-white">
              Book<span className="text-emerald-500">Nook</span>
            </span>
          </Link>

          <p className="max-w-xs text-sm leading-7 text-gray-400">
            A small online library where you can add a book, borrow a book and
            return it when you are done.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-white">Quick Links</h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/" className="transition hover:text-emerald-400">
                Home
              </Link>
            </li>
            <li>
              <Link href="/books" className="transition hover:text-emerald-400">
                All Books
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition hover:text-emerald-400">
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="transition hover:text-emerald-400"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-white">Contact Us</h3>

          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-emerald-500" />
              support@booknook.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-emerald-500" />
              +880 1700-000000
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" />
              Dhaka, Bangladesh
            </li>
          </ul>
        </div>

        {/* Social links */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-white">Follow Us</h3>

          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition hover:bg-emerald-700 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 px-5 py-6 text-center text-sm text-gray-500">
        © {year} BookNook. All rights reserved.
      </div>
    </footer>
  );
}
