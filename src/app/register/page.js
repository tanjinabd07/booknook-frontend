"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  BookOpen,
  UserRound,
  Mail,
  Lock,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

// Password rule check: invalid hole error message dey, valid hole khali string
const getPasswordError = (password) => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must have at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must have at least one lowercase letter.";
  }

  return "";
};

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Password likhar somoy-i error dekhao
  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);
    setPasswordError(value ? getPasswordError(value) : "");
  };

  // Email and Password Registration
  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading || googleLoading) return;

    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Invalid password hole register hobe na
    const validationError = getPasswordError(password);

    if (validationError) {
      setPasswordError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photoURL.trim() || undefined,
      });

      if (error) {
        // console.warn use kora hoyeche, console.error dev overlay dekhay
        console.warn("SignUp error:", error);

        const message =
          error.message ||
          (error.status
            ? `Error ${error.status} ${error.statusText || ""}`
            : "Registration failed");

        toast.error(message);
        return;
      }

      if (data) {
        toast.success("Registration successful! Please login.");
        router.push("/login");
      }
    } catch (error) {
      console.warn("Registration error:", error);
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Google Registration
  const handleGoogleRegister = async () => {
    if (loading || googleLoading) return;

    setGoogleLoading(true);

    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Google registration failed");
        setGoogleLoading(false);
      }
    } catch (error) {
      console.warn("Google registration error:", error);
      toast.error(error.message || "Google registration failed");
      setGoogleLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-5 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <BookOpen size={30} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Register to BookNook
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join BookNook and explore your next favorite book.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Name
            </label>

            <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-emerald-600">
              <UserRound size={18} className="shrink-0 text-gray-400" />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-emerald-600">
              <Mail size={18} className="shrink-0 text-gray-400" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Photo URL
            </label>

            <div className="flex items-center rounded-xl border border-gray-200 px-4 focus-within:border-emerald-600">
              <ImageIcon size={18} className="shrink-0 text-gray-400" />

              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-transparent px-3 py-3 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>

            <div
              className={`flex items-center rounded-xl border px-4 ${
                passwordError
                  ? "border-red-400"
                  : "border-gray-200 focus-within:border-emerald-600"
              }`}
            >
              <Lock size={18} className="shrink-0 text-gray-400" />

              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="At least 6 characters"
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
              />
            </div>

            {passwordError ? (
              <p className="mt-2 text-sm text-red-500">{passwordError}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Minimum 6 characters, including uppercase and lowercase letters.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}

            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
          )}
          Continue with Google
        </button>

        {/* Login Link */}
        <p className="mt-7 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
