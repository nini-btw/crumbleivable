"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { CookieIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { fadeInUp } from "@/presentation/lib/animations";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@example.com");
  const [password, setPassword] = React.useState("password");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brown-900 flex items-center justify-center p-4">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500 rounded-2xl mb-4">
            <CookieIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl text-white">crumbleivable!</h1>
          <p className="text-white/70 mt-2">Admin Dashboard</p>
          <p className="text-pink-400 text-sm mt-2">
            (Mock: any email/password works)
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(44,24,16,0.16)]">
          <h2 className="font-bold text-xl text-brown-900 mb-6">
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
        </div>

        <p className="text-center text-white/50 text-sm mt-8">
          © {new Date().getFullYear()} Crumbleivable!
        </p>
      </motion.div>
    </div>
  );
}
