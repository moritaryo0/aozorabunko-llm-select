from dotenv import load_dotenv
import os
import random
from anthropic import Anthropic, APIError, APIConnectionError, RateLimitError

load_dotenv()

# 生成のたびに書き出し方をランダムに変え、似た雰囲気描写に収束するのを防ぐ
NARRATIVE_HINTS = [
    "情景描写ではなく、人物の心の声や独白から書き出してください。",
    "一人称の語りで書いてください。",
    "誰かとの短い会話文から書き出してください。",
    "視覚よりも、音や匂い、肌触りなど別の感覚を中心に描写してください。",
    "回想（過去の出来事）を挟む構成にしてください。",
    "物や風景ではなく、身体の感覚（呼吸、鼓動、疲労など）から書き出してください。",
]

class ClaudeAPI:
    def __init__(self, api_key=None, model="claude-haiku-4-5-20251001", max_tokens=1024):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("APIキーが設定されていません")
        self.client = Anthropic(api_key=self.api_key)
        self.model = model
        self.max_tokens = max_tokens

    def generate_passage(self, season, time, weather=None, user_request=None):
        try:
            # 天気・気分は任意入力なので、指定があるときだけ状況に足す
            situation = f"季節は{season}、時間帯は{time}"
            if weather:
                situation += f"で、天気は{weather}"
            situation += "。"
            style_hint = random.choice(NARRATIVE_HINTS)

            if user_request:
                prompt = (
                    f"{situation}"
                    f"それに加えてユーザーからのリクエストは{user_request}です。"
                    "あなたはこの状況に合うような近代純文学的な小説の一節を生成してください。"
                    "特にユーザーからのリクエストから考えられる背景をシチュエーションに色濃く反映したものにしてください。"
                    f"{style_hint}"
                    "出力は本文のみで1000字以内で生成して。"
                )
            else:
                prompt = (
                    f"{situation}"
                    "あなたはこの状況に合うような近代純文学的な小説の一節を生成してください。"
                    f"{style_hint}"
                    "出力は本文のみで1000字以内で生成して。"
                )

            message = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )
            return message.content[0].text
        except RateLimitError:
            raise ValueError("レート制限に達しました。少し待ってから再試行してください。")
        except APIConnectionError:
            raise ValueError("APIへの接続に失敗しました。ネットワークを確認してください。")
        except APIError as e:
            raise ValueError(f"APIエラー: {e}")
