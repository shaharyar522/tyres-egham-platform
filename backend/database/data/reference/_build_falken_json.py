"""Build falken.json by fetching model pages (via r.jina.ai markdown proxy) and parsing tyresearch links."""
import json
import re
import time
import urllib.request
from pathlib import Path

BASE_PAGE = "http://www.eghamtyres.co.uk/tyre/details/falken"
JINA_PREFIX = "https://r.jina.ai/"

MODELS_META = [
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

RX_PRIMARY = re.compile(r"\d{3}/\d{2}R\d{2}\s+\d{2,3}[A-Z]{1,2}")
RX_DUAL = re.compile(r"\d{3}/\d{2}R\d{2}\s+\d{2,3}/\d{2,3}[A-Z]{1,2}")
RX_FLOAT = re.compile(r"\d{2}/\d{2}\.\d{2}R\d{2}\s+\d{2,3}[A-Z]{1,2}")

LINK_RX = re.compile(
    r"\[([^\]]+)\]\(\s*(?:https?://www\.eghamtyres\.co\.uk)?(/tyresearch/details/(\d+)/([^)\s]+))\)",
    re.I,
)


def extract_size(label: str) -> str | None:
    m = RX_PRIMARY.search(label)
    if m:
        return m.group(0)
    m = RX_DUAL.search(label)
    if m:
        return m.group(0)
    m = RX_FLOAT.search(label)
    if m:
        return m.group(0)
    return None


def fetch_markdown(slug: str) -> str:
    target = f"{BASE_PAGE}/{slug}"
    url = f"{JINA_PREFIX}{target}"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/plain,*/*",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read().decode("utf-8", errors="replace")


def variants_from_markdown(md: str) -> dict[int, dict]:
    out: dict[int, dict] = {}
    for label, _path, rid_s, slug in LINK_RX.findall(md):
        label = re.sub(r"\s+", " ", label.replace("\r", "").strip())
        if label.lower() == "view":
            continue
        size = extract_size(label)
        if size is None:
            continue
        rid = int(rid_s)
        slug = slug.rstrip(").")
        out[rid] = {
            "reference_id": rid,
            "reference_slug": slug,
            "label": label,
            "size_load_speed": size,
        }
    return out


def main() -> None:
    global_seen: set[int] = set()
    models_out: list[dict] = []
    for idx, (slug, name, price) in enumerate(MODELS_META):
        md = fetch_markdown(slug)
        vmap = variants_from_markdown(md)
        row_vars = []
        for rid in sorted(vmap.keys()):
            if rid in global_seen:
                continue
            global_seen.add(rid)
            row_vars.append(vmap[rid])
        models_out.append(
            {
                "model_slug": slug,
                "model_name": name,
                "price_from": float(price),
                "variants": row_vars,
            }
        )
        if idx < len(MODELS_META) - 1:
            time.sleep(0.35)

    doc = {"brand_slug": "falken", "models": models_out}
    out_path = Path(__file__).resolve().parent / "falken.json"
    out_path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    variant_count = sum(len(m["variants"]) for m in models_out)
    print("models:", len(models_out))
    print("variants:", variant_count)
    print("path:", out_path)


if __name__ == "__main__":
    main()
