import pathlib
import re

root = pathlib.Path(__file__).resolve().parent
text = (root / "ingest_links_only.md").read_text(encoding="utf-8")
parts = re.split(r"(?m)^# SLUG (.+)$", text)
if parts[0].strip():
    raise SystemExit("ingest_links_only.md must start with # SLUG")
for slug, body in zip(parts[1::2], parts[2::2]):
    slug = slug.strip()
    (root / f"_tmp_{slug}.txt").write_text(body.strip() + "\n", encoding="utf-8")
    print(slug)
