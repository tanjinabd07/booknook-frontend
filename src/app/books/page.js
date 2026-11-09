"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:5000/api/books";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Page load হলে বা Refresh চাপলে API থেকে সব Books নিয়ে আসা
  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;

    // 8 second এ response না এলে timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);

    fetch(API_URL, { signal: controller.signal, cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch books (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setBooks(Array.isArray(data) ? data : data.books || []);
        setError("");
      })
      .catch((err) => {
        // Cleanup এর সময় abort হলে (timeout না) error দেখানোর দরকার নেই
        if (err.name === "AbortError" && !timedOut) return;

        console.error("Fetch Books Error:", err);
        setError(
          timedOut
            ? "Server response দিচ্ছে না। Backend বা Database চেক করো।"
            : "Books load করা যাচ্ছে না। Backend Server চালু আছে কি না দেখো.",
        );
      })
      .finally(() => {
        clearTimeout(timeoutId);

        // Cleanup এ abort হলে loading বন্ধ করা হবে না (নতুন fetch চলছে)
        if (controller.signal.aborted && !timedOut) return;

        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [reloadKey]);

  // Database থেকে পাওয়া Category
  const categories = [
    "All",
    ...new Set(books.map((book) => book.category).filter(Boolean)),
  ];

  // Search এবং Category Filter
  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      book.title?.toLowerCase().includes(searchText) ||
      book.author?.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Refresh Books
  const handleRefresh = () => {
    setLoading(true);
    setError("");
    setReloadKey((k) => k + 1);
  };

  return (
    <main className="min-h-screen bg-[#fafaf7] px-5 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="mb-10 text-center">
          <p className="font-semibold text-emerald-700">
            Discover Your Next Read
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-gray-900">
            All Books
          </h1>

          <p className="mt-3 text-gray-500">
            Explore our collection and find your favourite books.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by book title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-gray-700 outline-none transition focus:border-emerald-600"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 outline-none focus:border-emerald-600"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Book Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-semibold text-gray-700">
            {loading
              ? "Loading books..."
              : `${filteredBooks.length} Books Found`}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700"></div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-8 text-center text-red-600">
            <p>{error}</p>

            <button
              onClick={handleRefresh}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Books Grid */}
        {!loading && !error && filteredBooks.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Book Cover */}
                <div className="h-72 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-300">
                  {book.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.image}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6">
                      <div className="flex h-44 w-32 flex-col items-center justify-center rounded-md border-l-4 border-emerald-900/30 bg-white p-4 text-center shadow-xl transition group-hover:scale-105">
                        <BookOpen size={35} className="text-emerald-700" />

                        <h2 className="mt-4 text-sm font-extrabold text-gray-800">
                          {book.title}
                        </h2>

                        <p className="mt-2 text-xs text-gray-500">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Book Information */}
                <div className="p-5">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {book.category}
                  </span>

                  <h2 className="mt-4 text-lg font-bold text-gray-900">
                    {book.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">By {book.author}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xl font-extrabold text-emerald-700">
                      ৳{book.price}
                    </p>

                    <Link
                      href={`/books/${book._id}`}
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Details
                    </Link>
                  </div>

                  <p
                    className={`mt-3 text-xs font-semibold ${
                      book.available ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {book.available ? "Available" : "Not Available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Books Found */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="rounded-2xl bg-white py-20 text-center shadow-sm">
            <BookOpen size={45} className="mx-auto text-gray-300" />

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              No Books Found
            </h2>

            <p className="mt-2 text-gray-500">
              Try another search or category.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
