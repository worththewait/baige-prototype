"""Package the offline prototype using an explicit runtime allowlist."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent.parent
PACKAGE_NAME = "百舸数智平台原型"
RUNTIME_FILES = (
    "index.html",
    "styles.css",
    "README.md",
)
RUNTIME_DIRECTORIES = ("pages", "src", "assets")
RUNTIME_EXTENSIONS = {".html", ".js", ".css", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".woff2"}


def main():
    # Read all sources before replacing an existing distribution archive.
    names = list(RUNTIME_FILES)
    for directory in RUNTIME_DIRECTORIES:
        names.extend(str(path.relative_to(ROOT)) for path in sorted((ROOT / directory).rglob("*"))
                     if path.is_file() and path.suffix.lower() in RUNTIME_EXTENSIONS
                     and not any(part.startswith(".") for part in path.relative_to(ROOT).parts))
    sources = [(name, (ROOT / name).read_bytes()) for name in names]
    destination = ROOT / f"{PACKAGE_NAME}.zip"
    with ZipFile(destination, "w", compression=ZIP_DEFLATED) as archive:
        for name, data in sources:
            archive.writestr(f"{PACKAGE_NAME}/{name}", data)
    print(f"已生成：{destination}（{len(sources)} 个文件）")


if __name__ == "__main__":
    main()
