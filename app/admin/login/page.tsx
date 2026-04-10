"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CookieIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { fadeInUp } from "@/presentation/lib/animations";
import { loginAdmin } from "../actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = React.useState("admin@crumbleivable.com");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await loginAdmin(email, password);

      if (result.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C1810] flex items-center justify-center p-4">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F4538A] rounded-2xl mb-4">
            <CookieIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl text-white">crumbleivable!</h1>
          <p className="text-white/70 mt-2">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(44,24,16,0.16)]">
          <h2 className="font-bold text-xl text-[#2C1810] mb-6">
            Sign In
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-600 text-sm">
              <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-2 cursor-pointer"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-[#A07850] mt-4">
            Default: admin@crumbleivable.com / admin123
          </p>
        </div>

        <p className="text-center text-white/50 text-sm mt-8">
          © {new Date().getFullYear()} Crumbleivable!
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#2C1810] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
