import { Truck, BadgePoundSterling, MapPin, Sparkles } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Next day fitting" },
  { icon: BadgePoundSterling, label: "Book now, pay when fitted" },
  { icon: MapPin, label: "Local tyre experts" },
  { icon: Sparkles, label: "Best brands available" },
];

export function ValuePropStrip() {
  return (
    <div className="border-y bg-muted/40">
      <div className="container">
        <ul className="flex flex-nowrap items-center justify-between gap-4 overflow-x-auto py-2.5 text-xs scrollbar-hide sm:text-sm md:justify-around">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex shrink-0 items-center gap-2 font-medium text-foreground">
              <Icon className="h-4 w-4 text-primary" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
