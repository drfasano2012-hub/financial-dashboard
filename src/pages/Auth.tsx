import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowRight, Mail, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Surface OAuth errors that come back in the URL hash/query
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const errMatch = (hash + search).match(/error_description=([^&]+)/);
    if (errMatch) {
      toast.error(decodeURIComponent(errMatch[1].replace(/\+/g, " ")));
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (user) return <Navigate to={from} replace />;

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    // Always send users back to /auth on the current (https) origin.
    // The AuthProvider's onAuthStateChange will pick up the session
    // and ProtectedRoute / the redirect below will forward them on.
    const origin = window.location.origin.replace(/^http:\/\//, "https://");
    const redirectTo = `${origin}/auth`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEmailSent(true);
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${from}`,
    });
    if (result?.error) {
      setSubmitting(false);
      toast.error(result.error.message ?? "Couldn't sign in with Google");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-accent text-accent-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-base tracking-tight">
              Freedom<span className="text-accent">ly</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {emailSent ? (
            <div className="rounded-2xl border border-border bg-gradient-card p-8 md:p-10 shadow-md-soft text-center animate-fade-in">
              <div className="mx-auto h-12 w-12 rounded-full bg-success-soft text-success flex items-center justify-center mb-5">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
                Check your inbox
              </h1>
              <p className="text-muted-foreground mb-6">
                We sent a magic sign-in link to <span className="font-medium text-foreground">{email}</span>.
                Click it to continue — no password needed.
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-gradient-card p-8 md:p-10 shadow-md-soft animate-fade-in">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                Sign in · No passwords, ever
              </p>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Welcome to Freedom<span className="text-accent">ly</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Sign in or create an account in seconds. We'll save your checkup so it follows you across devices.
              </p>

              {/* Google */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full mt-8"
                onClick={handleGoogle}
                disabled={submitting}
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Magic link */}
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={submitting || !email}
                >
                  <Mail className="h-4 w-4" />
                  {submitting ? "Sending…" : "Email me a sign-in link"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
                By continuing you agree to our terms. We'll never ask for a password.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
