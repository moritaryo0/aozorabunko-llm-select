function FullTextSection({ fullTexts, toggleFullText }) {
  const openEntries = Object.entries(fullTexts).filter(([, v]) => v.open)
  if (openEntries.length === 0) return null

  return (
    <section className="fulltext-section">
      <h2 className="fulltext-section-title">全文</h2>
      {openEntries.map(([title, v]) => (
        <div key={title} className="work-card fulltext-card">
          <div className="fulltext-card-header">
            <h3>
              {title} <span className="work-author">/ {v.author}</span>
            </h3>
            <button
              type="button"
              className="work-link work-fulltext-toggle"
              onClick={() => toggleFullText({ title, author: v.author })}
            >
              閉じる
            </button>
          </div>
          <div className="work-fulltext">
            {v.loading && <span className="spinner" />}
            {v.error && <p className="error">エラー: {v.error}</p>}
            {v.text && <p className="work-fulltext-body">{v.text}</p>}
          </div>
        </div>
      ))}
    </section>
  )
}

export default FullTextSection
