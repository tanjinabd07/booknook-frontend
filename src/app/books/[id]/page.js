"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";

const API_URL = "http://localhost:5000/api/books";
const BORROW_API_URL = "http://localhost:5000/api/borrows";

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

function BookDetailsContent() {
  const { id } = useParams();
  const router = useRouter();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [borrowing, setBorrowing] = useState(false);
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Logged in user-er name ar email (modal-e read-only dekhabo)
  const { data: session } = useSession();
  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";

  // Fetch Single Book
  useEffect(() => {
    if (!id) return;

    let ignore = false;

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
          throw new Error("Book not found!");
        }

        const data = await response.json();

        if (!ignore) {
          setBook(data.book);
        }
      } catch (err) {
        // console.warn use kora hoyeche, console.error dev overlay dekhay
        console.warn("Book Details Error:", err);

        if (!ignore) {
          setError("Book details পাওয়া যাচ্ছে না।");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchBook();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Borrow Book
  const handleBorrow = async () => {
    if (!book || borrowing || alreadyBorrowed) return;

    try {
      setBorrowing(true);

      const response = await fetch(BORROW_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          bookId: book._id,
        }),
      });

      const data = await response.json();

      // Error hole throw na kore sorasori toast dekhao
      if (!response.ok) {
        const message = data.message || "Failed to borrow this book.";

        if (message.toLowerCase().includes("already borrowed")) {
          setAlreadyBorrowed(true);
        }

        toast.error(message);
        setShowModal(false);
        return;
      }

      setAlreadyBorrowed(true);
      setShowModal(false);
      toast.success(`"${book.title}" borrowed successfully!`);

      // Refresh book availability
      const bookResponse = await fetch(`${API_URL}/${id}`);

      if (bookResponse.ok) {
        const updatedData = await bookResponse.json();
        setBook(updatedData.book);
      }
    } catch (err) {
      // Network error ba login token na thakle ekhane ashbe
      toast.error(err.message || "Something went wrong.");
    } finally {
      setBorrowing(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-700" />
        <p className="text-gray-500">Loading book details...</p>
      </div>
    );
  }

  // Error State
  if (error || !book) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-red-500">{error || "Book not found!"}</p>

        <Link
          href="/books"
          className="rounded-full bg-emerald-700 px-6 py-3 text-white"
        >
          Back to All Books
        </Link>
      </div>
    );
  }

  const availableCopies = Number(book.availableCopies ?? 0);
  const isAvailable = availableCopies > 0;
  const canBorrow = isAvailable && !alreadyBorrowed;

  return (
    <main className="min-h-screen bg-[#FAFAF7] px-5 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Go Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-900"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>

        <div className="grid gap-10 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
          {/* Book Cover */}
          <div className="min-h-[400px] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-300">
            {book.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.image}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="h-full min-h-[400px] w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center">
                <BookOpen size={120} className="text-emerald-800" />
              </div>
            )}
          </div>

          {/* Book Information */}
          <div className="flex flex-col justify-center">
            <span className="mb-5 w-fit rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {book.category}
            </span>

            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {book.title}
            </h1>

            <p className="mt-4 text-lg text-gray-500">by {book.author}</p>

            {/* Description */}
            {book.description && (
              <p className="mt-5 leading-7 text-gray-600">{book.description}</p>
            )}

            <div className="my-8 border-t border-gray-100" />

            {/* Price */}
            <div>
              <p className="text-sm text-gray-500">Book Price</p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                ৳{book.price}
              </p>
            </div>

            {/* Availability */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">Availability</p>

              <span
                className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                  isAvailable
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {isAvailable ? "Available" : "Not Available"}
              </span>

              {book.totalCopies !== undefined && (
                <p className="mt-3 text-sm text-gray-500">
                  {availableCopies} of {book.totalCopies} copies available
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              {/* Borrow Book */}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={!canBorrow || borrowing}
                style={{
                  backgroundColor: canBorrow ? "#047857" : "#9ca3af",
                  color: "#ffffff",
                  padding: "12px 28px",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  border: "none",
                  cursor: canBorrow ? "pointer" : "not-allowed",
                }}
              >
                {borrowing
                  ? "Borrowing..."
                  : alreadyBorrowed
                    ? "Already Borrowed"
                    : isAvailable
                      ? "Borrow This Book"
                      : "Not Available"}
              </button>

              {/* Explore More Books */}
              <Link
                href="/books"
                className="rounded-full border border-emerald-700 px-7 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Explore More Books
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Borrow Book</h2>

            <p className="mt-2 text-sm text-gray-500">
              You are borrowing{" "}
              <span className="font-semibold text-gray-800">{book.title}</span>
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBorrow();
              }}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={userName}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={borrowing}
                  className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={borrowing}
                  className="flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                >
                  {borrowing && <Loader2 size={16} className="animate-spin" />}
                  {borrowing ? "Borrowing..." : "Confirm Borrow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// Suspense Boundary
export default function BookDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center gap-3">
          <Loader2 className="animate-spin text-emerald-700" />
          <p className="text-gray-500">Loading book details...</p>
        </div>
      }
    >
      <BookDetailsContent />
    </Suspense>
  );
}
