"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import {
  BookOpen,
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Sparkles,
  Library,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/books";

// Add Book form-er category gulo-r sathe mil rakha hoyeche
const categories = [
  { name: "Fiction", icon: "📖" },
  { name: "Science", icon: "🔬" },
  { name: "History", icon: "🏛️" },
  { name: "Kids", icon: "🧸" },
  { name: "Others", icon: "📚" },
];

const slides = [
  {
    tag: "Welcome to BookNook",
    title: "A World of Stories, Just for You",
    text: "Discover your next favorite book, learn something new and enjoy reading every day.",
    background: "from-emerald-50 via-white to-emerald-100",
    card: "from-emerald-600 to-emerald-900",
    emoji: "📚",
  },
  {
    tag: "Easy Borrowing",
    title: "Borrow Your Next Read in Seconds",
    text: "Pick a book, confirm your borrow and start reading. Return it when you finish so the next reader can enjoy it.",
    background: "from-amber-50 via-white to-orange-100",
    card: "from-orange-400 to-amber-600",
    emoji: "📖",
  },
  {
    tag: "Share Your Shelf",
    title: "Add Your Own Books to the Library",
    text: "Have a book others would love? Add it with a cover and a short description and let readers find it.",
    background: "from-sky-50 via-white to-emerald-100",
    card: "from-sky-500 to-indigo-700",
    emoji: "✨",
  },
];

const coverColors = [
  "from-orange-200 to-amber-500",
  "from-emerald-200 to-teal-500",
  "from-blue-200 to-indigo-500",
  "from-yellow-200 to-orange-500",
  "from-purple-200 to-violet-500",
  "from-pink-200 to-rose-500",
];

const coverEmojis = ["📚", "📖", "✨", "🧠", "🌱", "📕"];

// Boi kobe add hoyeche seta number e ber kore (newest first sort-er jonno)
const getAddedTime = (book) => {
  const date = book.createdAt || book.addedAt || book.dateAdded;

  if (date) {
    return new Date(date).getTime();
  }

  // Date field na thakle MongoDB _id-er shurur timestamp use kora hoy
  return parseInt(String(book._id).substring(0, 8), 16) * 1000;
};

// Server-e false, browser-e true (Swiper Date use kore, tai server-e render kora jabe na)
const subscribe = () => () => {};
const getMounted = () => true;
const getServerMounted = () => false;

// Book Card Component
function BookCard({ book, index }) {
  const [imageError, setImageError] = useState(false);

  const coverColor = coverColors[index % coverColors.length];
  const coverEmoji = coverEmojis[index % coverEmojis.length];

  const imageUrl = book.image || book.imageUrl || book.coverImage;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div
        className={`relative flex h-64 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br ${coverColor}`}
      >
        {imageUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={book.title || "Book cover"}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-7xl drop-shadow-lg">{coverEmoji}</span>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700">
          {book.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-gray-900 transition group-hover:text-emerald-700">
          {book.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-gray-500">
          by {book.author}
        </p>

        <Link
          href={`/books/${book._id}`}
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          View Details
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const mounted = useSyncExternalStore(subscribe, getMounted, getServerMounted);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchBooks = async () => {
      try {
        // Server sort + limit support korle ei query kaj korbe
        const response = await fetch(`${API_URL}?sort=newest&limit=6`);

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = await response.json();

        if (!ignore) {
          setBooks(data.books || []);
        }
      } catch (err) {
        // console.warn use kora hoyeche, console.error dev overlay dekhay
        console.warn("Books Fetch Error:", err);

        if (!ignore) {
          setError("Books load করা যাচ্ছে না।");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      ignore = true;
    };
  }, []);

  // Server limit na mante-o jate thik thake: newest first, maximum 6ta
  const newArrivals = [...books]
    .sort((a, b) => getAddedTime(b) - getAddedTime(a))
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Banner Slider */}
      <section
        style={{
          "--swiper-theme-color": "#047857",
          "--swiper-pagination-bullet-inactive-color": "#6b7280",
        }}
      >
        {mounted ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            loop
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.title}>
                <div className={`bg-gradient-to-br ${slide.background}`}>
                  <div className="mx-auto grid min-h-[540px] max-w-7xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-2 lg:px-8">
                    <div>
                      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
                        <Sparkles size={16} />
                        {slide.tag}
                      </div>

                      <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
                        {slide.title}
                      </h1>

                      <p className="mt-6 max-w-lg text-base leading-8 text-gray-600 sm:text-lg">
                        {slide.text}
                      </p>

                      <div className="mt-8">
                        <Link
                          href="/books"
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
                        >
                          Browse Books
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </div>

                    {/* Slide illustration */}
                    <div className="relative hidden min-h-[340px] items-center justify-center lg:flex">
                      <div className="absolute h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />

                      <div
                        className={`relative flex h-80 w-56 rotate-6 flex-col items-center justify-center rounded-xl bg-gradient-to-br ${slide.card} p-6 text-center text-white shadow-2xl`}
                      >
                        <BookOpen size={55} className="mb-6" />
                        <p className="text-3xl font-extrabold">BookNook</p>
                        <p className="mt-3 text-sm text-white/80">
                          Your next chapter starts here.
                        </p>
                        <div className="mt-8 h-1 w-16 rounded-full bg-white/60" />
                      </div>

                      <div className="absolute right-10 top-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-xl">
                        {slide.emoji}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="min-h-[540px] bg-gradient-to-br from-emerald-50 via-white to-emerald-100" />
        )}
      </section>

      {/* New Arrivals Section */}
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

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 font-semibold text-emerald-700">
            Explore Collections
          </p>

          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Top Categories
          </h2>

          <p className="mt-3 text-gray-500">
            Find books that match your interests.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <div
              key={category.name}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-4xl">
                {category.icon}
              </div>

              <h3 className="font-bold text-gray-900">{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Why BookNook */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-2 font-semibold text-emerald-700">Why BookNook?</p>

            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Your Reading Journey, Made Better
            </h2>

            <p className="mt-3 text-gray-500">
              Everything you need for a comfortable and enjoyable reading
              experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Library size={27} />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                Huge Collection
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Explore books from different genres and discover new stories.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Truck size={27} />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                Easy Borrowing
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Borrow your favorite books with a simple and easy process.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={27} />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                Secure Account
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Your account and personal information stay protected.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Headphones size={27} />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                Reader Support
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Get support whenever you need help with your reading journey.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
