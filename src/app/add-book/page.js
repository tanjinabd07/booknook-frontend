"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, Plus, Loader2 } from "lucide-react";

const API_URL = "http://localhost:5000/api/books/add";

const initialForm = {
  title: "",
  author: "",
  category: "",
  price: "",
  totalCopies: "",
  image: "",
  description: "",
};

export default function AddBookPage() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Get JWT token
      const token = sessionStorage.getItem("booknook-token");

      if (!token) {
        throw new Error("JWT token not found. Please login again.");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          totalCopies: Number(formData.totalCopies),
          availableCopies: Number(formData.totalCopies),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add book.");
      }

      setMessage("Book added successfully!");
      setFormData(initialForm);
    } catch (err) {
      console.error("Add Book Error:", err);
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafaf7] px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/books"
          className="mb-8 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft size={18} />
          Back to All Books
        </Link>

        <div className="rounded-3xl bg-white p-6 shadow-lg md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
              <BookOpen size={32} className="text-emerald-700" />
            </div>

            <h1 className="mt-5 text-3xl font-extrabold text-gray-900">
              Add a New Book
            </h1>

            <p className="mt-2 text-gray-500">
              Add a new book to the BookNook library.
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-xl bg-green-50 p-4 text-center font-medium text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 p-4 text-center font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Book Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter book title"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Author Name
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author name"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select a category</option>
                <option value="Fiction">Fiction</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Kids">Kids</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Book Cover Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Paste book cover image URL"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="mt-2 text-sm text-gray-400">
                Provide a direct URL of the book cover image.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Book Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description about this book..."
                rows={5}
                required
                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Book Price (৳)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter book price"
                min="0"
                step="0.01"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Total Copies
              </label>
              <input
                type="number"
                name="totalCopies"
                value={formData.totalCopies}
                onChange={handleChange}
                placeholder="Enter total number of copies"
                min="1"
                step="1"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Adding Book...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Book
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
