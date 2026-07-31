import { STEPS } from '../constants'

function SettingsPanel({
  panelOpen,
  setPanelOpen,
  summaryOf,
  renderChoices,
  loading,
  canGenerate,
  handleGenerate,
}) {
  return (
    <section className="menu-section menu-section-compact">
      <div className="menu-bar">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setPanelOpen((prev) => !prev)}
          aria-expanded={panelOpen}
        >
          <span className="menu-summary">
            {STEPS.map((s) => summaryOf(s.key)).join(' ・ ')}
          </span>
          <span className="menu-caret">{panelOpen ? '▲' : '▼'}</span>
        </button>

        <button
          type="button"
          className={`generate-btn generate-btn-compact${loading ? ' loading' : ''}`}
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {loading && <span className="spinner" />}
          {loading ? '選書中...' : '再生成'}
        </button>
      </div>

      {panelOpen && (
        <div className="menu-panel">
          {STEPS.map((s) => (
            <div key={s.key} className="menu-panel-group">
              <h3 className="menu-panel-title">
                {s.title.replace('を選ぶ', '')}
                {!s.required && <span className="step-optional">任意</span>}
              </h3>
              {renderChoices(s.key)}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default SettingsPanel
