"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  BookOpen,
  Search,
  RefreshCw,
  Plus,
  Eye,
  AlertCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/books";

const initialForm = {
  title: "",
  author: "",
  category: "",
  image: "",
  description: "",
  price: "",
  totalCopies: "",
};

// Book Cover Component
function BookCover({ book }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = book.image || book.imageUrl || book.coverImage || "";

  return (
    <div className="flex h-52 items-center justify-center overflow-hidden bg-emerald-50">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={book.title || "Book cover"}
          onError={() => setImageError(true)}
          className=" w-full m-auto object-fit-cover"
        />
      ) : (
        <BookOpen size={64} className="text-emerald-300" />
      )}
    </div>
  );
}

// Get JWT Token
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("booknook-token");

  if (!token) {
    throw new Error("JWT token not found. Please login again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export default function MyBooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingBook, setDeletingBook] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch My Books
  const fetchMyBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const authHeaders = getAuthHeaders();

      const response = await fetch(`${API_URL}/my-books`, {
        method: "GET",
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch your books.");
      }

      setBooks(data.books || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load books when page opens
  useEffect(() => {
    let ignore = false;

    const loadBooks = async () => {
      try {
        const authHeaders = getAuthHeaders();

        const response = await fetch(`${API_URL}/my-books`, {
          method: "GET",
          headers: authHeaders,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch your books.");
        }

        if (!ignore) {
          setBooks(data.books || []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      ignore = true;
    };
  }, []);

  // Search Filter
  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    return (
      book.title?.toLowerCase().includes(searchText) ||
      book.author?.toLowerCase().includes(searchText) ||
      book.category?.toLowerCase().includes(searchText)
    );
  });

  // Open Edit Modal
  const handleEdit = (book) => {
    setEditingBook(book);

    setEditForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      image: book.image || book.imageUrl || book.coverImage || "",
      description: book.description || "",
      price: book.price ?? "",
      totalCopies: book.totalCopies ?? "",
    });

    setMessage("");
  };

  // Handle Edit Form Input
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Update Book
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const authHeaders = getAuthHeaders();

      const response = await fetch(`${API_URL}/${editingBook._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          ...editForm,
          price: Number(editForm.price),
          totalCopies: Number(editForm.totalCopies),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update book.");
      }

      setEditingBook(null);
      setMessage("Book updated successfully!");
      await fetchMyBooks();
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Book
  const handleDelete = async () => {
    if (!deletingBook) return;

    try {
      setDeleting(true);

      const authHeaders = getAuthHeaders();

      const response = await fetch(`${API_URL}/${deletingBook._id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete book.");
      }

      setDeletingBook(null);
      setMessage("Book deleted successfully!");
      await fetchMyBooks();
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Your Collection
            </p>

            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              My Books
            </h1>

            <p className="mt-2 text-gray-500">
              Manage and explore the books you have added.
            </p>
          </div>

          <Link
            href="/add-book"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus size={20} />
            Add New Book
          </Link>
        </div>

        {/* Success Message */}
        {message && !editingBook && (
          <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-emerald-700">
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BookOpen size={28} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Books Added</p>
              <h2 className="text-3xl font-bold text-gray-900">
                {books.length}
              </h2>
            </div>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search by title, author or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-700 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={fetchMyBooks}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />

            <p className="font-medium text-red-700">{error}</p>

            <button
              onClick={fetchMyBooks}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
            <BookOpen className="mx-auto mb-4 text-emerald-500" size={48} />

            <h2 className="mb-2 text-xl font-bold text-gray-800">
              {search ? "No Books Found" : "No Books Added Yet"}
            </h2>

            <p className="mb-6 text-gray-500">
              {search
                ? "Try searching with another keyword."
                : "Start building your personal book collection."}
            </p>

            {!search && (
              <Link
                href="/add-book"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                <Plus size={18} />
                Add Your First Book
              </Link>
            )}
          </div>
        )}

        {/* Book Cards */}
        {!loading && !error && filteredBooks.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Your Collection
              </h2>

              <p className="text-sm text-gray-500">
                {filteredBooks.length} books found
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <BookCover book={book} />

                  <div className="p-5">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {book.category}
                    </span>

                    <h3 className="mt-4 line-clamp-1 text-xl font-bold text-gray-900">
                      {book.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      By {book.author}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                      {book.description || "No description available."}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-lg font-bold text-emerald-700">
                        ৳{book.price}
                      </p>

                      <span className="text-xs text-gray-500">
                        {book.availableCopies ?? book.totalCopies ?? 0} copies
                        available
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <Link
                        href={`/books/${book._id}`}
                        className="flex items-center justify-center gap-1 rounded-lg border border-emerald-600 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                      >
                        <Eye size={16} />
                        View
                      </Link>

                      <button
                        onClick={() => handleEdit(book)}
                        className="flex items-center justify-center gap-1 rounded-lg border border-blue-500 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-500 hover:text-white"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => setDeletingBook(book)}
                        className="flex items-center justify-center gap-1 rounded-lg border border-red-500 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Book</h2>

              <button
                onClick={() => setEditingBook(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Book title"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="author"
                  value={editForm.author}
                  onChange={handleEditChange}
                  placeholder="Author name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">Select category</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Kids">Kids</option>
                  <option value="Others">Others</option>
                </select>

                <input
                  name="image"
                  type="url"
                  value={editForm.image}
                  onChange={handleEditChange}
                  placeholder="Book cover image URL"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.price}
                  onChange={handleEditChange}
                  placeholder="Price"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="totalCopies"
                  type="number"
                  min="1"
                  value={editForm.totalCopies}
                  onChange={handleEditChange}
                  placeholder="Total copies"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>

              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Book description"
                rows={4}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              />

              {message && <p className="text-sm text-red-600">{message}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={24} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Delete this book?
            </h2>

            <p className="mt-2 text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deletingBook.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingBook(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
