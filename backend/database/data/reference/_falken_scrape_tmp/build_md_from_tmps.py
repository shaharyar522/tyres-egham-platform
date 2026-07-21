"""Build {slug}.md from _tmp_{slug}.txt using the same link regex as compile_falken."""
import importlib.util
import pathlib
import re

SCRAPE = pathlib.Path(__file__).resolve().parent
REFERENCE = SCRAPE.parent

spec = importlib.util.spec_from_file_location("compile_falken", REFERENCE / "compile_falken.py")
cf = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(cf)

LINK = re.compile(
    r"(?m)^\[Falken[^\]]+\]\(https://www\.eghamtyres\.co\.uk/tyresearch/details/\d+/[^)]+\)\s*$"
)

for slug, _, _ in cf.MODELS:
    p = SCRAPE / f"_tmp_{slug}.txt"
    if not p.exists():
        raise SystemExit(f"Missing {p.name}")
    body = p.read_text(encoding="utf-8")
    lines = [m.group(0).rstrip() for m in LINK.finditer(body)]
    (SCRAPE / f"{slug}.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(slug, len(lines))
