import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactEnquiry, type ContactSubject } from "@/lib/api/queries";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const SUBJECT_OPTIONS: { value: ContactSubject; label: string }[] = [
  { value: "general", label: "General enquiry" },
  { value: "tyre_quote", label: "Tyre quote" },
  { value: "booking", label: "Booking question" },
  { value: "roadside", label: "Roadside / mobile assistance" },
];

export function ContactForm({ className }: { className?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<ContactSubject>("general");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      submitContactEnquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject,
        message: message.trim(),
      }),
    onSuccess: () => {
      setName("");
      setEmail("");
      setPhone("");
      setSubject("general");
      setMessage("");
    },
  });

  if (mutation.isSuccess) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-8 text-center shadow-card",
          className,
        )}
        role="status"
      >
        <p className="font-display text-xl font-bold text-[#1c2748]">Message sent</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {mutation.data.message}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => mutation.reset()}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      className={cn("space-y-5", className)}
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="contact-name">Your name</Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone (optional)</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={40}
            autoComplete="tel"
            placeholder="Best number to reach you"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Select value={subject} onValueChange={(v) => setSubject(v as ContactSubject)}>
          <SelectTrigger id="contact-subject" aria-label="Enquiry subject">
            <SelectValue placeholder="Choose a subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Tell us about your vehicle, tyre size, or how we can help…"
          className="resize-y min-h-[140px]"
        />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive" role="alert">
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : "Something went wrong. Please try again or call us directly."}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        variant="cta"
        className="w-full gap-2 rounded-lg sm:w-auto"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4" aria-hidden="true" />
        )}
        Send message
      </Button>
    </form>
  );
}
