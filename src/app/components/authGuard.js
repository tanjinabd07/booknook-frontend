"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

// Login na korei jei page gulo dekha jabe
const PUBLIC_PATHS = ["/", "/books", "/login", "/register"];

const TOKEN_KEY = "booknook-token";

// Token thakle ota-i, na thakle notun toiri kore sessionStorage-e rakhe
const ensureToken = async () => {
  if (sessionStorage.getItem(TOKEN_KEY)) return true;

  try {
    const response = await fetch("/api/token", { method: "POST" });
    const data = await response.json();

    if (response.ok && data?.token) {
      sessionStorage.setItem(TOKEN_KEY, data.token);
      return true;
    }
  } catch {
    // niche false return hobe
  }

  return false;
};

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();

  // "checking" | "ready" | "failed"
  const [tokenState, setTokenState] = useState("checking");

  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Session thakle JWT ready kori, na thakle purono token muche felbo
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      sessionStorage.removeItem(TOKEN_KEY);
      return;
    }

    let ignore = false;

    ensureToken().then((ok) => {
      if (!ignore) {
        setTokenState(ok ? "ready" : "failed");
      }
    });

    return () => {
      ignore = true;
    };
  }, [session, isPending]);

  // Private page-e login na thakle login page-e pathao
  // (session load hoye shesh na howa porjonto kichu korbo na, tai reload-e redirect hobe na)
  useEffect(() => {
    if (isPublic || isPending || session) return;

    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isPublic, isPending, session, pathname, router]);

  // Public page: sathe sathe dekhao
  if (isPublic) return children;

  // Token toiri hote parlo na
  if (session && tokenState === "failed") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-gray-600">
          We could not verify your login. Please login again.
        </p>

        <Link
          href={`/login?redirect=${encodeURIComponent(pathname)}`}
          className="rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Private page: session ar token check hocche
  if (isPending || !session || tokenState !== "ready") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-700" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return children;
}
