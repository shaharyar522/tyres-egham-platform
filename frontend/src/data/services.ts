import type { Service } from "@/types";

export const SERVICES: Service[] = [
  {
    id: 1,
    slug: "tyre-safety-check",
    name: "Tyre Safety Check",
    shortDescription: "Comprehensive 12-point inspection covering tread, pressure, sidewalls, and alignment indicators.",
    longDescription: "Our complimentary tyre safety check is a hands-on inspection by a qualified fitter. We inspect tread depth across all four tyres against the 1.6mm legal minimum, check for sidewall damage, kerbing, bulges and uneven wear patterns, verify pressures against your manufacturer specification, examine valves and dust caps, and report any alignment indicators we observe. You receive a written summary and recommendations - and the only obligation is informed peace of mind.",
    priceFrom: "free",
    durationMinutes: 20,
    iconName: "ShieldCheck",
    upsellInBasket: true,
  },
  {
    id: 2,
    slug: "fixed-in-your-home",
    name: "Fixed in your home",
    shortDescription: "Mobile tyre fitting at your home choose a distance band for transparent pricing.",
    longDescription: "Our mobile fitter comes to your home to fit or repair tyres on your driveway. Select how far you are from our workshop: 5 miles (£50), 10 miles (£100), or 20 miles (£100+ with any extra mileage agreed with our team before your appointment).",
    priceFrom: 50,
    durationMinutes: 60,
    iconName: "Home",
    upsellInBasket: true,
    pricingOptions: {
      type: "distance",
      options: [
        { key: "5", label: "5 miles", price: 50 },
        { key: "10", label: "10 miles", price: 100 },
        {
          key: "20",
          label: "20 miles",
          price: 100,
          requiresCustomPrice: true,
          priceHint: "£100+",
          discussionMessage: "Price of extra miles will be discussed by our team. Enter the agreed amount below once confirmed.",
        },
      ],
    },
  },
  {
    id: 3,
    slug: "tyre-repair",
    name: "Tyre Repair",
    shortDescription: "BS AU 159 standard puncture repair when the damage is within repairable parameters.",
    longDescription: "Where a puncture is in the central tread area, the tyre has not been driven flat, and damage is within BS AU 159 limits, we can perform a permanent combination repair (plug + internal patch). Repairs that do not meet the standard cannot legally be carried out and we will recommend a replacement. Note: run-flat tyres cannot be repaired - they require replacement.",
    priceFrom: 25,
    durationMinutes: 30,
    iconName: "Wrench",
    upsellInBasket: false,
  },
  {
    id: 4,
    slug: "wheel-balancing",
    name: "Wheel balancing",
    shortDescription: "Computerised wheel balancing to remove vibration and even out tyre wear.",
    longDescription: "Unbalanced wheels cause vibration through the steering and seat, and accelerate uneven tyre wear. We fit weights on a computerised balancer to bring each wheel within tolerance so your car rides smoothly and your tyres last longer. Ideal after new tyres are fitted or if you notice a shake at motorway speeds.",
    priceFrom: 30,
    durationMinutes: 30,
    iconName: "CircleDot",
    upsellInBasket: true,
  },
];

export const getServiceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);
