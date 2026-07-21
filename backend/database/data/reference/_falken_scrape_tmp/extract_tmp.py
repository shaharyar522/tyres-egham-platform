import re
from pathlib import Path

d = Path(__file__).resolve().parent
for p in d.glob("_tmp_*.txt"):
    slug = p.name[len("_tmp_") : -4]
    t = p.read_text(encoding="utf-8")
    lines = re.findall(r"(?m)^\[Falken[^\n]+", t)
    (d / f"{slug}.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(slug, len(lines))
