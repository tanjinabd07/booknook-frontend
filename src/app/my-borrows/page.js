"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, RotateCcw, Loader2 } from "lucide-react";

const API_URL = "http://localhost:5000/api/borrows";

// Get JWT Authorization Header
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("booknook-token");

  if (!token) {
    throw new Error("Please login first. JWT token not found.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export default function MyBorrowsPage() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returningId, setReturningId] = useState(null);

  // Fetch borrowed books
  const fetchBorrows = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      console.log("My Borrows API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch borrowed books.");
      }

      setBorrows(data.borrows || []);
    } catch (err) {
      console.error("Fetch Borrows Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Load borrowed books when page opens
  useEffect(() => {
    let ignore = false;

    const loadBorrows = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        console.log("My Borrows API Response:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch borrowed books.");
        }

        if (!ignore) {
          setBorrows(data.borrows || []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Fetch Borrows Error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBorrows();

    return () => {
      ignore = true;
    };
  }, []);

  // Return a borrowed book
  const handleReturn = async (borrowId) => {
    const confirmed = window.confirm(
      "Are you sure you want to return this book?",
    );

    if (!confirmed) return;

    try {
      setReturningId(borrowId);

      const response = await fetch(`${API_URL}/${borrowId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to return book.");
      }

      alert("Book returned successfully!");

      await fetchBorrows();
    } catch (err) {
      alert(err.message || "Something went wrong.");
    } finally {
      setReturningId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Borrows</h1>

            <p className="mt-2 text-gray-500">
              Manage your borrowed books and return them when finished.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
          >
            <BookOpen size={18} />
            Browse Books
          </Link>
        </div>

        {/* Borrow Count */}
        <div className="mb-6 rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Borrowed Books</p>

          <h2 className="mt-2 text-3xl font-bold text-emerald-600">
            {borrows.length}
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-emerald-600" size={36} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>

            <button
              onClick={fetchBorrows}
              className="mt-4 rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && borrows.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <BookOpen className="mx-auto mb-4 text-gray-300" size={55} />

            <h2 className="text-xl font-semibold text-gray-700">
              No Borrowed Books Yet!
            </h2>

            <p className="mt-2 text-gray-500">
              You have not borrowed any books yet.
            </p>

            <Link
              href="/books"
              className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
            >
              Explore Books
            </Link>
          </div>
        )}

        {/* Borrow Table */}
        {!loading && !error && borrows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-emerald-50 text-sm text-gray-700">
                <tr>
                  <th className="px-6 py-4">Book</th>
                  <th className="px-6 py-4">Borrowed Date</th>
                  <th className="px-6 py-4">Return Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {borrows.map((borrow) => (
                  <tr key={borrow._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {borrow.bookTitle || borrow.title || "Untitled Book"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {borrow.author || "Unknown Author"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {borrow.borrowedAt
                        ? new Date(borrow.borrowedAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {borrow.returnDate
                        ? new Date(borrow.returnDate).toLocaleDateString()
                        : "Not set"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          borrow.status === "Returned"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {borrow.status || "Borrowed"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {borrow.status === "Borrowed" ? (
                        <button
                          onClick={() => handleReturn(borrow._id)}
                          disabled={returningId === borrow._id}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {returningId === borrow._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                          Return
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
