"""One-off: compile falken.json from WebFetch markdown files in _falken_scrape_tmp."""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRAPE = HERE / "_falken_scrape_tmp"
OUT = HERE / "falken.json"

MODELS = [
    ("azenis-fk510", "Azenis FK510", 134.0),
    ("azenis-fk510-suv", "Azenis FK510 SUV", 143.0),
    ("azenis-fk510a", "Azenis FK510a", 135.0),
    ("azenis-fk520", "Azenis FK520", 87.0),
    ("azenis-fk520-suv", "Azenis FK520 SUV", 136.0),
    ("azenis-rs820", "Azenis RS820", 152.0),
    ("e.ziex", "E.Ziex", 84.0),
    ("euroall-season-as200", "Euroall Season AS200", 143.0),
    ("euroall-season-as210", "Euroall Season AS210", 73.0),
    ("euroall-season-as210a", "Euroall Season AS210A", 187.0),
    ("euroall-season-as220-pro", "Euroall Season AS220 PRO", 119.0),
    ("euroall-season-van11", "Euroall Season Van11", 114.0),
    ("eurowinter-hs01", "Eurowinter HS01", 131.0),
    ("eurowinter-hs01-suv", "Eurowinter HS01 SUV", 155.0),
    ("eurowinter-hs02", "Eurowinter HS02", 77.0),
    ("eurowinter-hs02-pro", "Eurowinter HS02 Pro", 123.0),
    ("eurowinter-van01", "Eurowinter VAN01", 131.0),
    ("fk090-temporary", "FK090 Temporary", 89.0),
    ("linam-van01", "Linam VAN01", 89.0),
    ("sincera-sn832a-ecorun", "Sincera SN832a Ecorun", 87.0),
    ("sincera-sn832b-ecorun", "Sincera SN832b Ecorun", 87.0),
    ("sincera-sn110", "Sincera-SN110", 72.0),
    ("wildpeak-at-at3wa", "Wildpeak A/T AT3WA", 116.0),
    ("wildpeak-at-trail", "Wildpeak A/T Trail", 126.0),
    ("wildpeak-mt", "Wildpeak M/T", 158.0),
    ("wildpeak-mt01", "Wildpeak M/T01", 187.0),
    ("wildpeak-rt01", "Wildpeak R/T01", 181.0),
    ("ziex-ze310-ecorun", "Ziex ZE310 Ecorun", 83.0),
    ("ziex-ze310a-ecorun", "Ziex ZE310a Ecorun", 88.0),
    ("ziex-ze320", "Ziex ZE320", 78.0),
    ("ziex-ze914-ecorun", "Ziex ZE914 Ecorun", 129.0),
    ("ziex-ze914a-ecorun", "Ziex ZE914a Ecorun", 113.0),
    ("ziex-ze914b-ecorun", "Ziex ZE914b Ecorun", 116.0),
    ("ziex-ze001", "Ziex-ZE001", 153.0),
]

LINK_RE = re.compile(
    r"\[([^\]]+)\]\(https://www\.eghamtyres\.co\.uk/tyresearch/details/(\d+)/([^)]+)\)"
)
SIZE_RE = re.compile(r"(\d{3}/\d{2}R\d{2}\s+\d{2,3}[A-Z]{1,2})")


def main() -> None:
    seen_ids: set[int] = set()
    models_out: list[dict] = []
    total_variants = 0

    for slug, model_name, price_from in MODELS:
        path = SCRAPE / f"{slug}.md"
        text = path.read_text(encoding="utf-8")
        variants: list[dict] = []
        for m in LINK_RE.finditer(text):
            label = m.group(1)
            ref_id = int(m.group(2))
            ref_slug = m.group(3)
            sm = SIZE_RE.search(label)
            if not sm:
                continue
            if ref_id in seen_ids:
                continue
            seen_ids.add(ref_id)
            variants.append(
                {
                    "reference_id": ref_id,
                    "reference_slug": ref_slug,
                    "label": label,
                    "size_load_speed": sm.group(1),
                }
            )
        variants.sort(key=lambda v: (v["size_load_speed"], v["reference_id"]))
        total_variants += len(variants)
        models_out.append(
            {
                "model_slug": slug,
                "model_name": model_name,
                "price_from": price_from,
                "variants": variants,
            }
        )

    data = {"brand_slug": "falken", "models": models_out}
    OUT.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print("models", len(models_out))
    print("variants", total_variants)
    print("out", OUT)


if __name__ == "__main__":
    main()
