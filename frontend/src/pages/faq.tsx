import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = [
  { q: "Do I have to pay when I book?", a: "No. We hold the tyres for you and you settle the invoice at the workshop on the day of fitting. Card, contactless and cash are all accepted." },
  { q: "Can I get a same-day fitting?", a: "If you book before our daily cut-off (usually 4pm) we can typically arrange next-day fitting. Same-day fittings are subject to bay availability - call us on 01784 436000 to check." },
  { q: "How long does fitting take?", a: "A standard set of 4 tyres takes 45-60 minutes. A single tyre or pair takes 20-30 minutes. Add 30-45 minutes if you've also booked a wheel alignment." },
  { q: "Do you fit run-flat tyres?", a: "Yes, we fit run-flat tyres (RFT, ROF, MOE, *) on suitable wheels. Note that run-flat tyres cannot be repaired - they must be replaced if punctured." },
  { q: "What if my tyres aren't in stock?", a: "We can usually source any size within 24 hours from our supplier network. Use our search to check current stock or call us if you need something obscure." },
  { q: "Can I reschedule or cancel?", a: "Yes. Use the magic-link in your booking confirmation email to reschedule or cancel up to 2 hours before your slot. After that, please call us." },
  { q: "Do you do mobile fitting?", a: "Not at present - all fittings are at our Egham workshop. We are conveniently located 2 minutes from the M25 and have free parking on site." },
  { q: "Do you do wheel alignments?", a: "Yes - we offer 4-wheel laser alignment to manufacturer geometry. We recommend it after kerbing, after fitting new tyres, or every 10,000 miles." },
];

export default function FaqPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-3xl font-extrabold sm:text-display-lg">Booking FAQ</h1>
      <p className="mt-2 text-muted-foreground">Quick answers to the most common questions.</p>

      <div className="mt-6 rounded-xl border bg-card p-2 sm:p-4">
        <Accordion type="multiple" className="px-2 sm:px-4">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`f-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
