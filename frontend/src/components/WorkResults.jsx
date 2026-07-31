import { aozoraSearchUrl } from '../utils'

function WorkResults({ result, fullTexts, toggleFullText }) {
  if (!result) return null

  return (
    <section className="result-section">
      {result.results.map((work, idx) => {
        const fullText = fullTexts[work.title]
        return (
          <div key={idx} className="work-card">
            <h3>
              {work.title} <span className="work-author">/ {work.author}</span>
            </h3>
            <p className="work-overview">{work.chunk}</p>
            <div className="work-links">
              <a
                className="work-link"
                href={aozoraSearchUrl(work.title)}
                target="_blank"
                rel="noopener noreferrer"
              >
                青空文庫{work.title}
              </a>
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
    </section>
  )
}

export default WorkResults
