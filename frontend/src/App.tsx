import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'checking' | 'connected' | 'unavailable';
const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
  ?? (import.meta.env.DEV ? '/api' : '');

async function checkService(path: string, signal: AbortSignal): Promise<Status> {
  try {
    const response = await fetch(path, { signal });
    if (!response.ok) return 'unavailable';
    const data = await response.json();
    return data.status === 'ok' && data.service === 'AGRIS' ? 'connected' : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

export default function App() {
  const [api, setApi] = useState<Status>('checking');
  const [database, setDatabase] = useState<Status>('checking');
  const [checkedAt, setCheckedAt] = useState<string>();
  const activeRequest = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!apiBase) {
      setApi('unavailable');
      setDatabase('unavailable');
      return;
    }
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setApi('checking');
    setDatabase('checking');
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    const results = await Promise.all([
      checkService(`${apiBase}/health`, controller.signal),
      checkService(`${apiBase}/health/database`, controller.signal),
    ]);
    window.clearTimeout(timeout);
    if (activeRequest.current !== controller) return;
    setApi(results[0]);
    setDatabase(results[1]);
    setCheckedAt(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    void refresh();
    return () => { activeRequest.current?.abort(); activeRequest.current = null; };
  }, [refresh]);

  const checking = api === 'checking' || database === 'checking';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="AGRIS home"><span className="brand-mark">↗</span> AGRIS<span className="brand-dot">.</span></a>
        <p className="brand-caption">Agricultural intelligence</p>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          <a className="nav-link active" href="#overview"><span aria-hidden="true">▦</span> Overview</a>
          <a className="nav-link" href="#journey"><span aria-hidden="true">◇</span> Getting started</a>
          <a className="nav-link" href="#connections"><span aria-hidden="true">◎</span> Connections</a>
        </nav>
        <div className="sidebar-note"><span className="small-leaf" aria-hidden="true">↗</span><strong>Better decisions.<br />One field at a time.</strong><p>Built for farmers, grounded in evidence.</p></div>
        <div className="region">Nigeria first · Built to grow</div>
      </aside>

      <main id="overview">
        <header className="topbar"><span>Your farm workspace</span><span className="stage-tag">EARLY DEVELOPMENT</span></header>
        <section className="page-heading"><div><p className="eyebrow">GROW WITH CLARITY</p><h1>A clearer view of your farm.</h1><p>Your land, your information, your next informed decision.</p></div><a className="text-link" href="#journey">Explore the plan <span aria-hidden="true">↗</span></a></section>

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy"><span className="hero-label">WELCOME TO AGRIS</span><h2 id="hero-title">Good farming starts<br />with understanding.</h2><p>Bring soil, weather and farm information together. We’re building the tools to help you decide what comes next.</p><a className="primary-link" href="#journey">See your next steps <span aria-hidden="true">→</span></a><span className="hero-footnote">Advisory first. You stay in control.</span></div>
          <div className="land-art" role="img" aria-label="Abstract illustration of cultivated fields, not a map of real land"><div className="sun" /><div className="field field-one" /><div className="field field-two" /><div className="field field-three" /><span className="art-caption">A growing vision · Illustration</span></div>
        </section>

        <section className="connections" id="connections" aria-labelledby="connections-title">
          <div className="section-heading"><div><p className="eyebrow">THE FOUNDATION</p><h2 id="connections-title">Your connections</h2></div><button onClick={() => void refresh()} disabled={checking}>{checking ? 'Checking…' : 'Refresh status'} <span aria-hidden="true">↻</span></button></div>
          <div className="status-grid" aria-live="polite" aria-busy={checking}>
            <StatusCard title="AGRIS backend" subtitle="Connects your workspace to our services" status={api} />
            <StatusCard title="Farm database" subtitle="MySQL connection for future farm records" status={database} />
            <article className="status-card"><span className="card-symbol" aria-hidden="true">↗</span><h3>Crop intelligence</h3><p>Recommendations backed by evaluated models</p><span className="status planned">Not trained yet</span></article>
          </div>
          <p className="connection-note">{checkedAt ? `Last checked at ${checkedAt}. ` : ''}{!apiBase ? 'This preview is ready to explore. Live services will be available when the backend is hosted.' : api === 'unavailable' ? 'The AGRIS service is unavailable. Please try refreshing later.' : database === 'unavailable' ? 'The farm database is currently unavailable.' : 'Connection checks only; no farm data has been entered.'}</p>
        </section>

        <section className="journey" id="journey" aria-labelledby="journey-title"><div><p className="eyebrow">WHAT COMES NEXT</p><h2 id="journey-title">From your field to informed choices.</h2><p>We’ll build your workspace one verified step at a time.</p></div><ol className="steps"><li><span>01</span><div><h3>Introduce your farm</h3><p>Save your location, fields and farming goals.</p></div><small>Planned</small></li><li><span>02</span><div><h3>Understand your soil</h3><p>Record soil measurements with their units and dates.</p></div><small>Planned</small></li><li><span>03</span><div><h3>Explore suitable crops</h3><p>Compare recommendations, evidence and limitations.</p></div><small>Planned</small></li></ol></section>
        <footer><span>AGRIS · Agricultural Intelligence System</span><span>Recommendations will be guidance, never guarantees.</span></footer>
      </main>
    </div>
  );
}

function StatusCard({ title, subtitle, status }: { title: string; subtitle: string; status: Status }) {
  return <article className="status-card"><span className="card-symbol" aria-hidden="true">◎</span><h3>{title}</h3><p>{subtitle}</p><span className={`status ${status}`}><span className="status-dot" />{status === 'connected' ? 'Connected' : status === 'checking' ? 'Checking…' : 'Unavailable'}</span></article>;
}
