"""Extract tyre markdown links from a raw WebFetch .md file."""
import pathlib
import re
import sys

link_re = re.compile(
    r"(?m)^\[Falken[^\]]+\]\(https://www\.eghamtyres\.co\.uk/tyresearch/details/\d+/[^)]+\)\s*$"
)


def main() -> None:
    src = pathlib.Path(sys.argv[1])
    dst = pathlib.Path(sys.argv[2])
    body = src.read_text(encoding="utf-8")
    lines = [m.group(0).rstrip() for m in link_re.finditer(body)]
    dst.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(dst.name, len(lines))


if __name__ == "__main__":
    main()
