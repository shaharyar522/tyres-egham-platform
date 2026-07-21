"""Append manual_links/*.txt sections to falken_extracted_bundle.md -> falken_complete_bundle.md"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent

MISSING = [
    "azenis-rs820",
    "euroall-season-as210",
    "euroall-season-as220-pro",
    "euroall-season-van11",
    "eurowinter-hs01",
    "eurowinter-hs02",
    "eurowinter-hs02-pro",
    "eurowinter-van01",
    "fk090-temporary",
    "linam-van01",
    "sincera-sn832a-ecorun",
    "sincera-sn832b-ecorun",
    "sincera-sn110",
    "wildpeak-at-at3wa",
    "wildpeak-at-trail",
    "wildpeak-mt",
    "wildpeak-mt01",
    "wildpeak-rt01",
    "ziex-ze310-ecorun",
    "ziex-ze310a-ecorun",
    "ziex-ze320",
    "ziex-ze914-ecorun",
    "ziex-ze914a-ecorun",
    "ziex-ze914b-ecorun",
    "ziex-ze001",
]

base = (ROOT / "falken_extracted_bundle.md").read_text(encoding="utf-8").rstrip()
parts: list[str] = [base]
for slug in MISSING:
    p = ROOT / "manual_links" / f"{slug}.txt"
    if not p.exists():
        raise SystemExit(f"Missing manual link file: {p}")
    lines = [ln.strip() for ln in p.read_text(encoding="utf-8").splitlines() if ln.strip()]
    parts.append(f"<<<{slug}>>>")
    parts.extend(lines)
    parts.append("")

(ROOT / "falken_complete_bundle.md").write_text("\n".join(parts) + "\n", encoding="utf-8")
print("wrote falken_complete_bundle.md")
