"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("CUSTOMER");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Please fill in all fields", "Name, email, and password are required.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast(
        "Registration Successful",
        role === "ORGANIZER"
          ? "Your tenant workspace has been set up! Please sign in."
          : "Account created! You can now log in.",
        "success"
      );

      router.push("/login");
    } catch (err: any) {
      toast("Registration Failed", err.message || "Failed to create account.", "error");
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
            Create a new account
          </h2>
        </div>

        <Card className="border-border/60">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Register</CardTitle>
              <CardDescription>
                Sign up to buy tickets or start organizing events.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="name">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
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
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
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
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground">Account Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => !isLoading && setRole("CUSTOMER")}
                    className={`flex cursor-pointer items-center justify-center rounded-md border p-3 text-center text-sm font-medium transition-all ${
                      role === "CUSTOMER"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    Ticket Buyer
                  </div>
                  <div
                    onClick={() => !isLoading && setRole("ORGANIZER")}
                    className={`flex cursor-pointer items-center justify-center rounded-md border p-3 text-center text-sm font-medium transition-all ${
                      role === "ORGANIZER"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    Event Organizer
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
