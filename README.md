# 青空文庫の作品をClaudeとベクトル検索を用いて自動選書

## 概要
青空文庫に収録されている作品のテキストファイルでベクトルDBを作成してLLMを用いて自動選書を行うアプリケーション  
今回はポートフォリオ用に再構築したため、芥川龍之介、太宰治、梶井基次郎の三者の著書のうち1万字未満の短編に絞ってDBを構築している。


### 使用技術
- 青空文庫のテキストファイルを置いているリポジトリ：[aozorahack/aozorabunko_text](https://github.com/aozorahack/aozorabunko_text)
- テキストファイルをクリーニングするライブラリ：[hppRC/aozorabunko-extractor](https://github.com/hppRC/aozorabunko-extractor)
- 日本語EMbettingモデル：[cl-nagoya/ruri-v3-310m](https://huggingface.co/cl-nagoya/ruri-v3-310m)
- Claude Console

### 基本機能
- 季節、時間帯、天候、現在の気分を選択して短編作品を選書

## 利用方法

### 共通の準備

`backend/.env.example` を `backend/.env` にコピーし、Anthropic の API キーを設定すれば使用できます。

```bash
cp backend/.env.example backend/.env
# backend/.env を編集して ANTHROPIC_API_KEY を設定
```

### Dockerを使う場合

```bash
docker compose up
```

- フロントエンド: http://localhost:5173
- バックエンド (API): http://localhost:8000

### Dockerを使わない場合

バックエンドとフロントエンドをそれぞれ別のターミナルで起動。

**バックエンド (FastAPI, [uv](https://docs.astral.sh/uv/) を使用)**

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

**フロントエンド (React + Vite)**

```bash
cd frontend
npm install
npm run dev
```

- フロントエンド: http://localhost:5173
- バックエンド (API): http://localhost:8000

## 制作プロセス

### ベクトルDBの構築

`backend/data/aozora.db` はリポジトリにコミット済みなので、通常利用時は再構築不要。以下は作成時のパイプラインの記録である。

1. 青空文庫の生データをクローン[aozorahack/aozorabunko_text](https://github.com/aozorahack/aozorabunko_text)
2. 青空文庫の生データを [aozorabunko-extractor](https://pypi.org/project/aozorabunko-extractor/)（`backend/pyproject.toml` の依存に含む）でクレンジングし、`cleaned/` に作家・作品ごとのテキストとして出力
3. `backend/scripts/build_index.py` で `cleaned/` のテキストをチャンク分割・埋め込み化し、sqlite-vec の `aozora.db` として保存
   ```bash
   cd backend
   uv run python scripts/build_index.py
   ```

`cleaned/` は中間生成物のためリポジトリには含めていない（`.gitignore` で除外）。

```python
#著者を変更する際にはcleaned/でテキストファイルを置いているフォルダをAUTHORSに含めて実行。
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
```
## 制作の意図
現在青空文庫には18000作近い作品が収録されており、近代文学の名作に対して高い網羅性を有しているが、青空文庫のホームページ内で公開されてるアクセスランキング上位の顔ぶれは長年変わらず、また近代文学の作家は短編を多く執筆している関係から、有用なデータセットを有しているにも関わらずその中には多くの作品が埋もれていると考えられた。  
そこでできるだけシンプルな形でマイナー作品を知る機会を作る試みとして、このようなシステムを構築するに至った。  

## 技術選定
今回はClaudeを使い具体的な小説の一節を生成し、ruri-v3でベクトル化したテキストファイルにベクトル検索をかけるという手法を使うため、言語とフレームワークには`python(FastAPI)`を使った。(動作確認用のフロントUIには`react`を使用している。)  
日本語に特化した埋め込みモデルruri-v3については[RAGを自分で実装したくなったらまずこれ見て【ruri-v3 × Faiss】](https://zenn.dev/genshi_ai/articles/b273cdfc07c55c)を参照。  
日本語性能が高くローカルで動作するため外部APIとの接続設定などを最小にできるので採用した。