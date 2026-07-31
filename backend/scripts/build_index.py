"""
cleaned/ 以下の各作家の作品テキストをチャンク分割し、埋め込みを計算して
sqlite-vec のベクトルDBに格納する。

実行: backend/ から `uv run python scripts/build_index.py`
"""

import sqlite3
from pathlib import Path

import sqlite_vec
from sentence_transformers import SentenceTransformer

REPO_ROOT = Path(__file__).resolve().parents[2]
CLEANED_DIR = REPO_ROOT / "cleaned"
DB_PATH = REPO_ROOT / "backend" / "data" / "aozora.db"

AUTHORS = {
    "dazai": "太宰治",
    "akutagawa": "芥川龍之介",
    "kajii": "梶井基次郎",
}

CHUNK_SIZE = 400
CHUNK_OVERLAP = 50


def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    text = text.strip()
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


def main():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    model = SentenceTransformer("cl-nagoya/ruri-v3-310m")
    dim = model.get_embedding_dimension()

    db = sqlite3.connect(DB_PATH)
    db.enable_load_extension(True)
    sqlite_vec.load(db)
    db.enable_load_extension(False)

    db.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY,
            author TEXT NOT NULL,
            title TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            text TEXT NOT NULL
        )
    """)
    db.execute(f"""
        CREATE VIRTUAL TABLE IF NOT EXISTS vec_chunks USING vec0(
            embedding float[{dim}]
        )
    """)

    for author_dir, author_name in AUTHORS.items():
        works_dir = CLEANED_DIR / author_dir / "works"
        if not works_dir.exists():
            continue

        for path in sorted(works_dir.glob("*.txt")):
            title = path.stem
            text = path.read_text(encoding="utf-8")
            if len(text) > 10_000:
                continue

            chunks = chunk_text(text)

            embeddings = model.encode([f"検索文書: {c}" for c in chunks])

            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                cur = db.execute(
                    "INSERT INTO chunks (author, title, chunk_index, text) VALUES (?, ?, ?, ?)",
                    (author_name, title, i, chunk),
                )
                rowid = cur.lastrowid
                db.execute(
                    "INSERT INTO vec_chunks (rowid, embedding) VALUES (?, ?)",
                    (rowid, sqlite_vec.serialize_float32(embedding.tolist())),
                )

            print(f"{author_name} / {title}: {len(chunks)} チャンク登録")

    db.commit()
    db.close()


if __name__ == "__main__":
    main()
