import { useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { isAdminAuthenticated, setAdminSession } from "@/lib/admin/auth";
import { SiteLogo } from "@/components/domain/site-logo";
import { adminLogin } from "@/lib/admin/queries";

function createCaptcha() {
  return {
    a: Math.floor(Math.random() * 9) + 1,
    b: Math.floor(Math.random() * 9) + 1,
  };
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(createCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetCaptcha = useCallback(() => {
    setCaptcha(createCaptcha());
    setCaptchaAnswer("");
  }, []);

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const answer = Number.parseInt(captchaAnswer.trim(), 10);
    if (!Number.isFinite(answer) || captcha.a + captcha.b !== answer) {
      setError("Incorrect security check answer.");
      resetCaptcha();
      return;
    }

    setLoading(true);
    try {
      const result = await adminLogin(email.trim(), password, {
        a: captcha.a,
        b: captcha.b,
        answer,
      });
      setAdminSession(result.token, result.user);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <SiteLogo className="mb-4 justify-center" imageClassName="h-12 max-w-[14rem]" />
          <h1 className="font-display text-2xl font-extrabold">Admin sign in</h1>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="captcha">Security check</Label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-md border bg-muted px-3 py-2 text-sm font-medium tabular-nums">
                  {captcha.a} + {captcha.b} =
                </span>
                <Input
                  id="captcha"
                  type="number"
                  inputMode="numeric"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                  placeholder="Answer"
                  className="flex-1"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Solve the sum to continue.</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
