import { STEPS } from '../constants'

function StepWizard({
  stepIndex,
  setStepIndex,
  renderChoices,
  advance,
  loading,
  canGenerate,
  handleGenerate,
}) {
  const step = STEPS[stepIndex]
  const isLastStep = stepIndex === STEPS.length - 1

  return (
    <section className="step-section">
      <div className="step-dots">
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`step-dot${i === stepIndex ? ' active' : ''}${
              i < stepIndex ? ' done' : ''
            }`}
          />
        ))}
      </div>

      <h2 className="step-title">
        {step.title}
        {!step.required && <span className="step-optional">任意</span>}
      </h2>

      {renderChoices(step.key)}

      <div className="step-nav">
        {stepIndex > 0 && (
          <button
            type="button"
            className="ghost-btn"
            onClick={() => setStepIndex((prev) => prev - 1)}
          >
            戻る
          </button>
        )}
        {!step.required && !isLastStep && (
          <button type="button" className="ghost-btn" onClick={advance}>
            スキップ
          </button>
        )}
        {isLastStep && (
          <button
            type="button"
            className={`generate-btn${loading ? ' loading' : ''}`}
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {loading && <span className="spinner" />}
            {loading ? '選書中...' : '選書する'}
          </button>
        )}
      </div>
    </section>
  )
}

export default StepWizard
