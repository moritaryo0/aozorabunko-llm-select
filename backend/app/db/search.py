import random
import sqlite3
import sqlite_vec
from sentence_transformers import SentenceTransformer
from typing import TypedDict
from pathlib import Path

class SearchResult(TypedDict):
    author: str
    title: str
    chunk: str
    distance: float

class VectorDB:
    def __init__(self, db_path: str = None):
        if db_path is None:
            # backend/ からの実行を想定
            db_path = Path(__file__).resolve().parents[2] / "data" / "aozora.db"
        self.model = SentenceTransformer("cl-nagoya/ruri-v3-310m")
        self.db = sqlite3.connect(db_path)
        self.db.enable_load_extension(True)
        sqlite_vec.load(self.db)
        self.db.enable_load_extension(False)

    def search(
        self,
        query_text: str,
        k: int = 5,
        exclude_titles: list[str] | None = None,
        pool_size: int = 8,
    ) -> list[SearchResult]:
        # 1. generator.py から受け取ったテキストを埋め込み
        query_embedding = self.model.encode(
            f"検索クエリ: {query_text}"
        )

        exclude_titles = exclude_titles or []
        # 除外対象・重複作品を弾いてもpool_size件確保できるよう、多めに候補を取得する
        fetch_k = max(pool_size, k) + len(exclude_titles)

        # 2. KNN 検索（k = ? が必須）
        rows = self.db.execute(
            """
            SELECT c.author, c.title, c.text, v.distance
            FROM vec_chunks v
            JOIN chunks c ON c.id = v.rowid
            WHERE embedding MATCH ? AND k = ?
            ORDER BY distance
            """,
            (sqlite_vec.serialize_float32(query_embedding.tolist()), fetch_k)
        ).fetchall()

        # 3. 除外リストと同一作品の重複チャンクを弾く（1作品1チャンクまで）
        seen_titles = set(exclude_titles)
        candidates: list[SearchResult] = []
        for author, title, chunk, distance in rows:
            if title in seen_titles:
                continue
            seen_titles.add(title)
            candidates.append(
                SearchResult(
                    author=author, title=title, chunk=chunk, distance=float(distance)
                )
            )

        # 4. 常に最近傍だけを選ぶと似た一節ばかりが同じ作品に収束しがちなので、
        #    近い候補のプールから距離の近さで重み付けしたランダム抽選を行う
        pool = candidates[:pool_size]
        if len(pool) <= k:
            return pool

        chosen: list[SearchResult] = []
        remaining = list(pool)
        weights = [1 / (c["distance"] + 1e-6) for c in remaining]
        for _ in range(k):
            picked = random.choices(remaining, weights=weights, k=1)[0]
            idx = remaining.index(picked)
            chosen.append(remaining.pop(idx))
            weights.pop(idx)

        return chosen

    def search_titles(self, query: str, limit: int = 20) -> list[dict]:
        rows = self.db.execute(
            "SELECT DISTINCT author, title FROM chunks WHERE title LIKE ? ORDER BY title LIMIT ?",
            (f"%{query}%", limit),
        ).fetchall()
        return [{"author": author, "title": title} for author, title in rows]

    def get_full_text(self, title: str, overlap: int = 50) -> str | None:
        # build_index.py のチャンク分割はoverlap文字分を重複させて並べているので、
        # chunk_index順に繋げつつ重複分を差し引けば元の本文を復元できる
        rows = self.db.execute(
            "SELECT text FROM chunks WHERE title = ? ORDER BY chunk_index",
            (title,),
        ).fetchall()

        if not rows:
            return None

        full_text = rows[0][0]
        for (chunk,) in rows[1:]:
            full_text += chunk[overlap:]
        return full_text
