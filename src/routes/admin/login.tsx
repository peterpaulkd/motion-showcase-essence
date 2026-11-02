import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate({ to: "/admin" });
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    // Since we don't have a real password reset endpoint wired, we open
    // a mailto link to the admin email so the super-admin can reset manually.
    const subject = encodeURIComponent("PPA Admin — Password Reset Request");
    const body = encodeURIComponent(
      `Hello,\n\nI need to reset the admin password for the account: ${forgotEmail}\n\nPlease assist.\n\nThank you.`
    );
    window.open(
      `mailto:ppa@islm.ac.ke?subject=${subject}&body=${body}`,
      "_blank"
    );
    setForgotSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-sm bg-primary font-display text-sm font-extrabold text-primary-foreground">
            PP
          </span>
          <span className="leading-tight">
            <strong className="block font-display text-sm">
              Physical Planning Association
            </strong>
            <span className="text-[10px] uppercase text-foreground/50">
              Admin Panel · ISLM
            </span>
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-xl">
          {!showForgot ? (
            <>
              <div className="mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <Lock size={18} className="text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold">Admin access</h1>
                <p className="mt-1 text-sm text-foreground/55">
                  Sign in with your admin credentials to manage content.
                </p>
              </div>

              <form onSubmit={handleLogin} className="grid gap-4">
                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-foreground/50">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
                    />
                    <input
                      type="email"
                      required
                      autoComplete="username"
                      placeholder="admin@islm.ac.ke"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-foreground/50">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
                    />
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="mt-1 h-11 w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in…" : "Sign in"}
                  {!loading && <ArrowRight size={15} className="ml-1" />}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setForgotEmail(email);
                  setError("");
                }}
                className="mt-4 block w-full text-center text-xs text-foreground/45 underline-offset-2 hover:text-foreground/70 hover:underline transition-colors"
              >
                Forgot password? Contact super-admin
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10 mb-3">
                  <Mail size={18} className="text-terracotta" />
                </div>
                <h1 className="font-display text-2xl font-bold">
                  Password reset
                </h1>
                <p className="mt-1 text-sm text-foreground/55">
                  We'll open your email client so you can request a reset from
                  the super-admin.
                </p>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgotPassword} className="grid gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase text-foreground/50">
                      Your account email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                  <Button type="submit" className="h-11 w-full">
                    Open email client
                    <Mail size={14} className="ml-1.5" />
                  </Button>
                </form>
              ) : (
                <div className="rounded-md border border-sage/30 bg-sage/5 px-4 py-3 text-sm text-foreground/70">
                  Your email client has been opened. Send the message to{" "}
                  <strong>ppa@islm.ac.ke</strong> to request a reset.
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotSent(false);
                }}
                className="mt-4 block w-full text-center text-xs text-foreground/45 underline-offset-2 hover:text-foreground/70 hover:underline transition-colors"
              >
                Back to sign in
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-foreground/30">
          © {new Date().getFullYear()} Physical Planning Association · ISLM
        </p>
      </div>
    </div>
  );
}
