export function ResumeBanner({ onContinue, onFresh }: { onContinue: () => void; onFresh: () => void }) {
  return <div className="resume-banner" role="dialog" aria-labelledby="resume-title">
    <div className="resume-card">
      <span className="resume-icon" aria-hidden="true">🏘️</span>
      <h2 id="resume-title">Continue your town?</h2>
      <p>We found a saved meadow from your last visit.</p>
      <div className="resume-actions">
        <button type="button" className="resume-primary" onClick={onContinue}>Continue town</button>
        <button type="button" className="resume-secondary" onClick={onFresh}>Start fresh</button>
      </div>
    </div>
  </div>
}
