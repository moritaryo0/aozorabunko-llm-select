export const SEASON_TAGS = [
  { label: '春', icon: '🌸' },
  { label: '夏', icon: '🌻' },
  { label: '秋', icon: '🍁' },
  { label: '冬', icon: '⛄' },
]

export const TIME_TAGS = [
  { label: '早朝', icon: '🌅' },
  { label: '昼間', icon: '🌞' },
  { label: '夕方', icon: '🌇' },
  { label: '深夜', icon: '🌌' },
]

export const WEATHER_TAGS = [
  { label: '晴れ', icon: '☀️' },
  { label: '曇り', icon: '☁️' },
  { label: '雨', icon: '🌧️' },
  { label: '雪', icon: '❄️' },
  { label: '雷雨', icon: '⛈️' },
]

export const MOOD_TAGS = [
  { label: '嬉しい', icon: '😊' },
  { label: '哀しい', icon: '😢' },
  { label: '穏やか', icon: '😌' },
  { label: '苛立ち', icon: '😠' },
  { label: '疲れ', icon: '😴' },
  { label: '懐かしい', icon: '🌙' },
  { label: '不安', icon: '😨' },
  { label: '物思い', icon: '🤔' },
]

export const STEPS = [
  { key: 'season', title: '季節を選ぶ', required: true },
  { key: 'time', title: '時間帯を選ぶ', required: true },
  { key: 'weather', title: '天気を選ぶ', required: false },
  { key: 'mood', title: '今の気分を選ぶ', required: false },
]
