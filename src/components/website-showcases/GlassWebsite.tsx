'use client';

import { useState, type FormEvent } from 'react';
import { ExpressiveIcon as Icon } from './ExpressiveIcon';
import './showcase-fonts.css';
import './glass-website.css';

const routes = [
  { name: 'Cedar Loop', kind: 'A little woodland', distance: '4.2 km', duration: 150, description: 'Follow the tree line, find a clearing, take the long way back.', stops: ['Meet at the trail gate', 'Pause at the cedar clearing', 'Lunch by the old footbridge'], terrain: 'Gentle slopes', color: 'cedar' },
  { name: 'Reedwater Shore', kind: 'A little waterside', distance: '3.6 km', duration: 120, description: 'A level path along the water, with plenty of places to stop.', stops: ['Start at the landing', 'Walk the reedwater boardwalk', 'Unpack a picnic at the shore'], terrain: 'Mostly level', color: 'water' },
  { name: 'Orchard Path', kind: 'A little open country', distance: '5.1 km', duration: 180, description: 'Make your way through the orchard and up to the open ridge.', stops: ['Gather at the orchard gate', 'Reach the open ridge', 'Settle in under the apple trees'], terrain: 'A steady climb', color: 'orchard' },
];

function DaybreakMark() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M3 24h26M7 19a9 9 0 0 1 18 0M16 3v4M4.7 8.7l2.8 2.8m17-2.8-2.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function RouteMap({ selected }: { selected: number }) {
  return <div className={'gw-map gw-map-' + routes[selected].color} aria-hidden="true">
    <div className="gw-map-disc" /><div className="gw-map-land gw-map-land-far" /><div className="gw-map-land gw-map-land-near" /><div className="gw-map-lake" />
    <svg className="gw-map-contours" viewBox="0 0 1200 500" preserveAspectRatio="none">
      <path d="M-80 180C140 26 218 284 415 172S746 14 872 152s259 93 405 31M-80 208C140 54 218 312 415 200S746 42 872 180s259 93 405 31M-80 236C140 82 218 340 415 228S746 70 872 208s259 93 405 31M-80 264C140 110 218 368 415 256S746 98 872 236s259 93 405 31" />
      <path className="gw-map-walk" d={selected === 0 ? 'M126 330C142 268 243 286 271 229S378 174 422 215 470 304 581 254' : selected === 1 ? 'M126 330C196 291 270 355 338 315S495 348 581 254' : 'M126 330C180 251 205 140 306 142S391 304 481 197 540 174 581 254'} />
      <circle className="gw-map-stop" cx="126" cy="330" r="8" /><circle className="gw-map-stop" cx="581" cy="254" r="8" />
    </svg>
    <span className="gw-map-north">N<span /></span><span className="gw-map-start">Start here</span><span className="gw-map-picnic">Stay a while</span>
  </div>;
}

function timeAt(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function GlassWebsite() {
  const [selected, setSelected] = useState(0);
  const [pace, setPace] = useState<'easy' | 'steady'>('easy');
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [people, setPeople] = useState('2');
  const [picnic, setPicnic] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const route = routes[selected];
  const minutes = route.duration + (pace === 'easy' ? 30 : 0);
  const stopTimes = [570, 570 + Math.round(minutes * .4), 570 + minutes];
  const duration = `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ''}`;

  function updatePlan() { setSaved(''); setError(''); }
  function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !date) {
      setError('Add your name and choose a day so we can put your plan together.');
      setSaved('');
      return;
    }
    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    setError('');
    setSaved(`${name.trim()}, your ${route.name} plan is ready for ${formattedDate}: ${people} ${people === '1' ? 'person' : 'people'}, an ${pace === 'easy' ? 'easy' : 'active'} pace${picnic ? ', and a picnic stop' : ''}.`);
  }

  return <div className="site-glass" data-website="glass">
    <header className="gw-nav">
      <a href="#gw-top" className="gw-brand" aria-label="Daybreak home"><DaybreakMark />daybreak</a>
      <button type="button" className="gw-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="gw-navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
      <nav id="gw-navigation" className={menuOpen ? 'is-open' : ''} aria-label="Daybreak navigation"><a href="#gw-routes" onClick={() => setMenuOpen(false)}>Find a route</a><a href="#gw-day" onClick={() => setMenuOpen(false)}>Your day, your pace</a><a href="#gw-plan" onClick={() => setMenuOpen(false)}>Make a plan <Icon name="arrow" /></a></nav>
    </header>
    <main>
      <section className="gw-hero" id="gw-top" aria-labelledby="gw-title">
        <div className="gw-hero-heading"><h1 id="gw-title">Make a <em>day</em> of it.</h1><div><p>A path to follow. Time to spare.<br /> A small escape that fits into a day.</p><a className="gw-text-link" href="#gw-routes">Find your next day out <Icon name="arrow" /></a></div></div>
        <div className="gw-landscape">
          <RouteMap selected={selected} />
          <div className="gw-map-caption"><h2>{route.name}</h2><p>Imagined landscape · route sketch</p></div>
          <aside className="gw-itinerary" id="gw-day" aria-labelledby="gw-itinerary-title">
            <div className="gw-itinerary-head"><h2 id="gw-itinerary-title">A good day ahead</h2><DaybreakMark /></div>
            <div className="gw-itinerary-route"><span>{route.name}</span><span>{route.distance} / {duration}</span></div>
            <div className="gw-pace" role="group" aria-label="Walking pace"><button type="button" aria-pressed={pace === 'easy'} onClick={() => { setPace('easy'); updatePlan(); }}>Take it easy</button><button type="button" aria-pressed={pace === 'steady'} onClick={() => { setPace('steady'); updatePlan(); }}>Keep moving</button></div>
            <ol className="gw-timeline" aria-label={`${route.name} day plan`}>{route.stops.map((stop, index) => <li key={stop}><time>{timeAt(stopTimes[index])}</time><span>{stop}</span></li>)}</ol>
            <a className="gw-primary" href="#gw-plan">Choose a day for this <Icon name="arrow" /></a><p className="gw-itinerary-note">A loose plan. Plenty of breathing room.</p>
          </aside>
        </div>
        <div className="gw-map-key"><span><i />A path worth taking</span><span>Choose a route. We’ll make room for the pauses.</span><span>Day trips, by daybreak <DaybreakMark /></span></div>
      </section>
      <section className="gw-routes gw-content" id="gw-routes" aria-labelledby="gw-routes-title">
        <div className="gw-section-heading"><h2 id="gw-routes-title">Where will the<br /><em>day take you?</em></h2><p>Three imagined routes, three different ways to get outside. Choose the one that feels like your kind of day.</p></div>
        <div className="gw-route-list" role="group" aria-label="Choose your route">
          {routes.map((item, index) => <button type="button" className={'gw-route-choice' + (selected === index ? ' is-selected' : '')} aria-pressed={selected === index} key={item.name} onClick={() => { setSelected(index); updatePlan(); }}>
            <span className={'gw-route-symbol gw-route-symbol-' + item.color} aria-hidden="true"><svg viewBox="0 0 76 56" fill="none"><path d={index === 0 ? 'M8 45 23 17l15 28M30 45 47 9l20 36M23 29v22m24-30v30' : index === 1 ? 'M5 18c11-10 16 10 28 0s17 10 29 0M5 30c11-10 16 10 28 0s17 10 29 0M5 42c11-10 16 10 28 0s17 10 29 0' : 'M6 45 28 15l15 20L55 9l17 36M25 45V32m29 13V27'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <span className="gw-route-title"><strong>{item.name}</strong><span>{item.kind}</span></span><span className="gw-route-description">{item.description}</span><span className="gw-route-facts"><strong>{item.distance}</strong><span>{item.terrain}</span></span><span className="gw-route-select"><Icon name={selected === index ? 'check' : 'plus'} /><span>{selected === index ? 'In your plan' : 'Choose route'}</span></span>
          </button>)}
        </div>
        <p className="gw-route-note">These are fictional routes to help you try the planner. For a real outing, check your route, access and conditions before setting off.</p>
      </section>
      <section className="gw-pack gw-content" aria-labelledby="gw-pack-title"><div className="gw-pack-heading"><DaybreakMark /><h2 id="gw-pack-title">A little preparation.<br />A lot of possibility.</h2></div><div className="gw-pack-copy"><p>Leave a little space in the bag and in the plan. The best part of a day out might be the stop you didn’t see coming.</p><ul><li>Water, something to eat, a layer for later.</li><li>A route checked before you leave.</li><li>Time to turn back, or take the longer way.</li></ul></div></section>
      <section className="gw-plan-section" id="gw-plan" aria-labelledby="gw-plan-title">
        <div className="gw-content gw-plan-layout">
          <div className="gw-plan-intro"><h2 id="gw-plan-title">Leave a day<br /><em>open for this.</em></h2><p>Pick a date. Bring your favourite people.<br />Keep the rest beautifully uncomplicated.</p><div className="gw-plan-summary"><Icon name="leaf" /><div><strong>{route.name}</strong><span>{route.distance} · {duration} · {pace === 'easy' ? 'Taking it easy' : 'Keeping moving'}</span></div><a href="#gw-routes">Change route</a></div><p className="gw-local-note">Your plan stays on this page. No booking, payment or message is sent.</p></div>
          <form className="gw-plan-form" onSubmit={savePlan} noValidate>
            <label htmlFor="gw-name">Your name<input id="gw-name" autoComplete="given-name" value={name} placeholder="What should we call you?" aria-invalid={!!error && !name.trim()} aria-describedby={error ? 'gw-form-error' : undefined} onChange={event => { setName(event.target.value); updatePlan(); }} required /></label>
            <div className="gw-form-row"><label htmlFor="gw-date">A day for it<input id="gw-date" type="date" value={date} aria-invalid={!!error && !date} aria-describedby={error ? 'gw-form-error' : undefined} onChange={event => { setDate(event.target.value); updatePlan(); }} required /></label><label htmlFor="gw-people">Who’s coming<select id="gw-people" value={people} onChange={event => { setPeople(event.target.value); updatePlan(); }}>{['1', '2', '3', '4', '5', '6'].map(count => <option key={count} value={count}>{count === '1' ? 'Just me' : `${count} people`}</option>)}</select></label></div>
            <label className="gw-picnic" htmlFor="gw-picnic"><input id="gw-picnic" type="checkbox" checked={picnic} onChange={event => { setPicnic(event.target.checked); updatePlan(); }} /><span>Make time for a picnic<small>Add a reminder to pack something good.</small></span></label>
            <button type="submit" className="gw-primary">{saved ? 'Update my day plan' : 'Keep my day plan'}<Icon name={saved ? 'check' : 'arrow'} /></button>
            {error && <p className="gw-form-error" id="gw-form-error" role="alert">{error}</p>}
            <div className={'gw-save-status' + (saved ? ' is-saved' : '')} role="status" aria-live="polite">{saved ? <><Icon name="check" /><p>{saved}<span>Saved here for this visit. Take a screenshot to keep it.</span></p></> : <p>A little commitment to a little time outside.</p>}</div>
          </form>
        </div>
      </section>
    </main>
    <footer className="gw-footer gw-content"><a className="gw-brand" href="#gw-top"><DaybreakMark />daybreak</a><p>Some days are better spent outside.</p><a href="https://learn.microsoft.com/en-us/windows/apps/design/style/acrylic" target="_blank" rel="noopener noreferrer">Material reference <Icon name="arrow" /></a><span>An independent website study by IAVSE</span></footer>
  </div>;
}
