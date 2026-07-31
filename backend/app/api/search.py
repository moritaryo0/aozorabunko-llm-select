from fastapi import APIRouter, HTTPException
from app.db.search import VectorDB
from app.llm.generator import ClaudeAPI
db = VectorDB()
llm = ClaudeAPI()

router = APIRouter(prefix="/api", tags=["search"])

@router.post("/search")
async def search(
    season: str,
    time: str,
    weather: str = "",
    user_request: str = "",
    exclude_titles: str = "",
):
    # generator.py を呼んで短編の一節を生成（天気・気分は任意）
    pseudo_passage = llm.generate_passage(season, time, weather, user_request)

    # db/search.py でベクトル検索（カンマ区切りの除外タイトルは重複選書を避けるために使う）
    excluded = [t for t in exclude_titles.split(",") if t]
    results = db.search(pseudo_passage, k=1, exclude_titles=excluded)

    return {"passage": pseudo_passage, "results": results}


@router.get("/works/search")
async def search_titles(query: str):
    # タイトルの部分一致検索機能
    return {"results": db.search_titles(query)}


@router.get("/works/full")
async def full_text(title: str):
    # 保存済みチャンクを繋げて本文を復元する（タイトル検索）
    text = db.get_full_text(title)
    if text is None:
        raise HTTPException(status_code=404, detail="作品が見つかりません")
    return {"title": title, "text": text}
