export function aozoraSearchUrl(title) {
  return `https://www.google.com/search?q=${encodeURIComponent(`site:aozora.gr.jp ${title}`)}`
}
