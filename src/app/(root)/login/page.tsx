"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please fill in all fields", "Email and password are required.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast("Login Successful", `Welcome back, ${data.user.name}!`, "success");

      // Redirect based on user role
      if (data.user.role === "SUPERADMIN") {
        router.push("/admin");
      } else if (data.user.role === "ORGANIZER") {
        router.push("/organizer");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast("Login Failed", err.message || "Invalid email or password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
            IDEvent<span className="text-foreground">.</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Sign in to your account
          </h2>
        </div>

        <Card className="border-border/60">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground" htmlFor="password">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="rounded-lg border border-border bg-card p-4 text-sm text-card-foreground">
          <p className="font-semibold text-foreground mb-1">Demo Credentials:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              <strong>Superadmin:</strong> admin@idevent.com / admin123
            </li>
            <li>
              <strong>Organizer A:</strong> organizera@idevent.com / organizer123
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
