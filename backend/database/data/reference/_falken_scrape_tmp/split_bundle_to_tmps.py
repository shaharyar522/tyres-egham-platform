"""Split <<<slug>>> bundle into _tmp_{slug}.txt (link lines only)."""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent
text = (root / "falken_complete_bundle.md").read_text(encoding="utf-8")
parts = re.split(r"(?m)^<<<([^>]+)>>>\s*$", text)
if parts[0].strip():
    raise SystemExit(f"Unexpected preamble: {parts[0]!r}")
for slug, body in zip(parts[1::2], parts[2::2]):
    slug = slug.strip()
    lines = [ln.strip() for ln in body.splitlines() if ln.strip()]
    (root / f"_tmp_{slug}.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(slug, len(lines))
