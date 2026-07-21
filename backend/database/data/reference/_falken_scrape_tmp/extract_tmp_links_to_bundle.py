"""Extract [Falken…](tyresearch/details…) lines from _tmp_*.txt into a <<<slug>>> bundle."""
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

chunks: list[str] = []
missing: list[str] = []
for slug, _, _ in cf.MODELS:
    p = SCRAPE / f"_tmp_{slug}.txt"
    if not p.exists():
        missing.append(slug)
        continue
    body = p.read_text(encoding="utf-8")
    lines = [m.group(0).rstrip() for m in LINK.finditer(body)]
    chunks.append(f"<<<{slug}>>>")
    chunks.extend(lines)
    chunks.append("")

(SCRAPE / "falken_extracted_bundle.md").write_text("\n".join(chunks) + "\n", encoding="utf-8")
print("missing", missing)
print("wrote falken_extracted_bundle.md")
