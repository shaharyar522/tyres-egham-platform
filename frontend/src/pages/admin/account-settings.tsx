import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { getAdminUser } from "@/lib/admin/auth";
import { useAdminUpdatePasswordMutation } from "@/lib/admin/queries";

export default function AdminAccountSettingsPage() {
  const user = getAdminUser();
  const updatePasswordMutation = useAdminUpdatePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await updatePasswordMutation.mutateAsync({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update password.");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Account</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Update your admin sign-in password.
      </p>

      <Card className="mt-6 max-w-2xl">
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-sm font-medium">Signed in as</p>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email ?? "—"}</p>
          </div>

          <form className="space-y-4 border-t pt-4" onSubmit={save}>
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {message && <p className="text-sm text-emerald-600">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={updatePasswordMutation.isPending}>
              {updatePasswordMutation.isPending ? "Saving…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
