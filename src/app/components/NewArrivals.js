import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewArrivals({ loading, error, newArrivals, BookCard }) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 font-semibold text-emerald-700">
            Fresh On The Shelf
          </p>

          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            New Arrivals
          </h2>

          <p className="mt-3 text-gray-500">
            The latest books added to BookNook.
          </p>
        </div>

        {loading && (
          <p className="py-10 text-center text-gray-500">Loading books...</p>
        )}

        {!loading && error && (
          <p className="py-10 text-center text-red-500">{error}</p>
        )}

        {!loading && !error && newArrivals.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            No books available yet.
          </p>
        )}

        {!loading && !error && newArrivals.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {newArrivals.map((book, index) => (
                <BookCard key={book._id} book={book} index={index} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
              >
                See All Books
                <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
