function TitleSearch({
  titleQuery,
  setTitleQuery,
  handleTitleSearch,
  titleSearchLoading,
  titleSearchError,
  titleResults,
  fullTexts,
  toggleFullText,
}) {
  return (
    <section className="title-search-section">
      <form className="title-search-form" onSubmit={handleTitleSearch}>
        <input
          type="text"
          value={titleQuery}
          onChange={(e) => setTitleQuery(e.target.value)}
          placeholder="作品タイトルで検索（例: 檸檬）"
        />
        <button type="submit" className="ghost-btn" disabled={titleSearchLoading}>
          {titleSearchLoading ? '検索中...' : '検索'}
        </button>
      </form>

      {titleSearchError && <div className="error">エラー: {titleSearchError}</div>}

      {titleResults && (
        <div className="title-search-results">
          {titleResults.length === 0 && <p className="work-author">該当する作品が見つかりません</p>}
          {titleResults.map((work) => {
            const fullText = fullTexts[work.title]
            return (
              <div key={work.title} className="work-card">
                <h3>
                  {work.title} <span className="work-author">/ {work.author}</span>
                </h3>
                <div className="work-links">
                  <button
                    type="button"
                    className="work-link work-fulltext-toggle"
                    onClick={() => toggleFullText(work)}
                  >
                    {fullText?.open ? '全文を閉じる' : '全文を読む'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default TitleSearch
