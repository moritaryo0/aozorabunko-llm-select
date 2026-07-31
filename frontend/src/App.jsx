import { useState } from 'react'
import './App.css'
import { SEASON_TAGS, TIME_TAGS, WEATHER_TAGS, MOOD_TAGS, STEPS } from './constants'
import TagSet from './components/TagSet'
import TitleSearch from './components/TitleSearch'
import StepWizard from './components/StepWizard'
import SettingsPanel from './components/SettingsPanel'
import WorkResults from './components/WorkResults'
import FullTextSection from './components/FullTextSection'

function App() {
  const [season, setSeason] = useState(null)
  const [time, setTime] = useState(null)
  const [weather, setWeather] = useState(null)
  const [moods, setMoods] = useState([])
  const [moodText, setMoodText] = useState('')

  const [stepIndex, setStepIndex] = useState(0)
  const [generated, setGenerated] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shownTitles, setShownTitles] = useState([])
  const [fullTexts, setFullTexts] = useState({})

  const [titleQuery, setTitleQuery] = useState('')
  const [titleResults, setTitleResults] = useState(null)
  const [titleSearchLoading, setTitleSearchLoading] = useState(false)
  const [titleSearchError, setTitleSearchError] = useState(null)

  const moodSummary = [...moods, moodText.trim()].filter(Boolean).join('、')

  const summaryOf = (key) => {
    if (key === 'season') return season || '未選択'
    if (key === 'time') return time || '未選択'
    if (key === 'weather') return weather || '指定なし'
    return moodSummary || '指定なし'
  }

  const toggleMood = (label) => {
    setMoods((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    )
  }

  // 選書前のウィザードでは選択と同時に次のステップへ進める
  const advance = () => {
    if (!generated) setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const params = new URLSearchParams({
        season,
        time,
        weather: weather || '',
        user_request: moodSummary,
        exclude_titles: shownTitles.join(','),
      })
      const response = await fetch(`http://localhost:8000/api/search?${params}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      setShownTitles((prev) => [...prev, ...data.results.map((w) => w.title)])
      setGenerated(true)
      setPanelOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleFullText = async ({ title, author }) => {
    const current = fullTexts[title]
    if (current) {
      setFullTexts((prev) => ({ ...prev, [title]: { ...current, open: !current.open } }))
      return
    }

    setFullTexts((prev) => ({ ...prev, [title]: { open: true, loading: true, author } }))
    try {
      const params = new URLSearchParams({ title })
      const response = await fetch(`http://localhost:8000/api/works/full?${params}`)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      setFullTexts((prev) => ({ ...prev, [title]: { open: true, author, text: data.text } }))
    } catch (err) {
      setFullTexts((prev) => ({ ...prev, [title]: { open: true, author, error: err.message } }))
    }
  }

  const handleTitleSearch = async (e) => {
    e.preventDefault()
    if (!titleQuery.trim()) return

    setTitleSearchLoading(true)
    setTitleSearchError(null)
    try {
      const params = new URLSearchParams({ query: titleQuery.trim() })
      const response = await fetch(`http://localhost:8000/api/works/search?${params}`)
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      setTitleResults(data.results)
    } catch (err) {
      setTitleSearchError(err.message)
    } finally {
      setTitleSearchLoading(false)
    }
  }

  const renderChoices = (key) => {
    if (key === 'season') {
      return (
        <TagSet
          tags={SEASON_TAGS}
          isSelected={(l) => season === l}
          onSelect={(l) => {
            setSeason(l)
            advance()
          }}
        />
      )
    }
    if (key === 'time') {
      return (
        <TagSet
          tags={TIME_TAGS}
          isSelected={(l) => time === l}
          onSelect={(l) => {
            setTime(l)
            advance()
          }}
        />
      )
    }
    if (key === 'weather') {
      return (
        <TagSet
          tags={WEATHER_TAGS}
          isSelected={(l) => weather === l}
          onSelect={(l) => {
            setWeather((prev) => (prev === l ? null : l))
            advance()
          }}
        />
      )
    }
    return (
      <>
        <TagSet
          tags={MOOD_TAGS}
          isSelected={(l) => moods.includes(l)}
          onSelect={toggleMood}
        />
        <div className="mood-text">
          <textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="気分以外にも、今の自分が感じている悩みなどを自由に書いてみて"
            rows="2"
          />
        </div>
      </>
    )
  }

  const canGenerate = Boolean(season && time) && !loading

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>青空文庫 自動選書</h1>
      </header>

      <TitleSearch
        titleQuery={titleQuery}
        setTitleQuery={setTitleQuery}
        handleTitleSearch={handleTitleSearch}
        titleSearchLoading={titleSearchLoading}
        titleSearchError={titleSearchError}
        titleResults={titleResults}
        fullTexts={fullTexts}
        toggleFullText={toggleFullText}
      />

      {!generated ? (
        <StepWizard
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          renderChoices={renderChoices}
          advance={advance}
          loading={loading}
          canGenerate={canGenerate}
          handleGenerate={handleGenerate}
        />
      ) : (
        <>
          {error && <div className="error">エラー: {error}</div>}

          <WorkResults result={result} fullTexts={fullTexts} toggleFullText={toggleFullText} />

          <SettingsPanel
            panelOpen={panelOpen}
            setPanelOpen={setPanelOpen}
            summaryOf={summaryOf}
            renderChoices={renderChoices}
            loading={loading}
            canGenerate={canGenerate}
            handleGenerate={handleGenerate}
          />
        </>
      )}

      {!generated && error && <div className="error">エラー: {error}</div>}

      <FullTextSection fullTexts={fullTexts} toggleFullText={toggleFullText} />
    </div>
  )
}

export default App
