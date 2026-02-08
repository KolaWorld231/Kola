"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { X } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
      } else {
        // Automatically sign in the user after successful signup
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          // If auto-login fails, redirect to signin page
          router.push("/auth/signin?registered=true");
        } else {
          // Successfully logged in, redirect to onboarding assessment
          router.push("/onboarding");
          router.refresh();
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <Link href="/">
            <button className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </Link>
        </div>

        {/* Sign In Button */}
        <div className="flex justify-end mb-6">
          <Link href="/auth/signin">
            <Button variant="ghost" className="text-liberian-blue hover:text-liberian-blue/80">
              LOG IN
            </Button>
          </Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Form */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-center text-gray-900">Sign up</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Input
                id="name"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-14 text-lg border-gray-300 rounded-lg focus:border-liberian-red focus:ring-liberian-red"
              />
            </div>

            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 text-lg border-gray-300 rounded-lg focus:border-liberian-red focus:ring-liberian-red"
              />
            </div>

            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-14 text-lg border-gray-300 rounded-lg focus:border-liberian-red focus:ring-liberian-red"
              />
            </div>

            <div className="space-y-2">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="h-14 text-lg border-gray-300 rounded-lg focus:border-liberian-red focus:ring-liberian-red"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-liberian-red hover:bg-liberian-red/90 text-white rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "CREATE ACCOUNT"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-4 text-gray-500">OR</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-base border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50"
              onClick={() => router.push("/auth/signin")}
              disabled={isLoading}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              GOOGLE
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-base border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50"
              onClick={() => router.push("/auth/signin")}
              disabled={isLoading}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              FACEBOOK
            </Button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 space-y-2 text-xs text-gray-500 text-center">
          <p>
            By signing up to Kola, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-liberian-red">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-liberian-red">
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            This site is protected by reCAPTCHA Enterprise and the Google{" "}
            <Link href="/privacy" className="underline hover:text-liberian-red">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline hover:text-liberian-red">
              Terms of Service
            </Link>{" "}
            apply.
          </p>
        </div>
      </div>
    </div>
  );
}
