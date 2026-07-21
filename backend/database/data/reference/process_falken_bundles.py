"""Split bundled WebFetch markdown dumps into per-model link-only .md files."""

import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRAPE = HERE / "_falken_scrape_tmp"


def _extract_falken_links(body: str) -> str:
    lines = re.findall(r"^\[Falken[^\n]+", body, re.M)
    return "\n".join(lines) + ("\n" if lines else "")


def _process_bundle(text: str) -> None:
    parts = re.split(r"^---SLUG (.+)---\s*\n", text, flags=re.M)
    if not parts or parts[0].strip():
        raise ValueError("Bundle must start with ---SLUG <slug>---")
    for slug, body in zip(parts[1::2], parts[2::2]):
        slug = slug.strip()
        (SCRAPE / f"{slug}.md").write_text(_extract_falken_links(body), encoding="utf-8")


def main() -> None:
    SCRAPE.mkdir(parents=True, exist_ok=True)
    for p in sorted(HERE.glob("falken_bundle*.txt")):
        _process_bundle(p.read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
