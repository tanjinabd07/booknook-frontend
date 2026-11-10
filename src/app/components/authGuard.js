"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

// Login na korei jei page gulo dekha jabe
const PUBLIC_PATHS = ["/", "/books", "/login", "/register"];

const TOKEN_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/token`;

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = useSession();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  // JWT sync:
  // - Google login ba notun tab-e sessionStorage-e token thake na, tai session thakle token anbo
  // - Logout hole purono token muche felbo
  useEffect(() => {
    if (isPending) return;

    if (!session) {
      sessionStorage.removeItem("booknook-token");
      return;
    }

    if (sessionStorage.getItem("booknook-token")) return;

    fetch(TOKEN_URL, { method: "POST", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.token) {
          sessionStorage.setItem("booknook-token", data.token);
        }
      })
      .catch(() => {});
  }, [session, isPending]);

  // Private page-e login na thakle login page-e pathao
  // (session load hoye shesh na howa porjonto kichu korbo na, tai reload-e redirect hobe na)
  useEffect(() => {
    if (isPublic || isPending || session) return;

    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isPublic, isPending, session, pathname, router]);

  // Public page: sathe sathe dekhao
  if (isPublic) return children;

  // Private page: session check hocche ba redirect hocche
  if (isPending || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-700" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return children;
}
