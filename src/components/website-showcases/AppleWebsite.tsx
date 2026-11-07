'use client';

import {useEffect, useRef, useState} from 'react';
import type {KeyboardEvent} from 'react';
import './apple-website.css';

type Day = 'today' | 'tomorrow';
type Task = {id: number; title: string; day: Day; done: boolean};
type Tour = 'capture' | 'plan' | 'focus';
type IconName = 'mark' | 'arrow' | 'plus' | 'check' | 'clock' | 'sun' | 'close' | 'play' | 'pause' | 'reset';

function Icon({name, className = ''}: {name: IconName; className?: string}) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'mark' && <><path d="M12 3a9 9 0 1 0 9 9M15 3h6v6M21 3l-9 9"/><circle cx="12" cy="12" r="2.5"/></>}
    {name === 'arrow' && <path d="M5 12h14m-5-5 5 5-5 5"/>}
    {name === 'plus' && <path d="M5 12h14M12 5v14"/>}
    {name === 'check' && <path d="m5 12 4 4L19 6"/>}
    {name === 'clock' && <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}
    {name === 'sun' && <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></>}
    {name === 'close' && <path d="m6 6 12 12M6 18 18 6"/>}
    {name === 'play' && <path d="m9 5 11 7-11 7V5Z"/>}
    {name === 'pause' && <path d="M9 5v14m6-14v14"/>}
    {name === 'reset' && <><path d="M4 10a8 8 0 1 1 1.5 7M4 4v6h6"/></>}
  </svg>;
}

const seedTasks: Task[] = [
  {id: 1, title: 'Sketch the opening idea', day: 'today', done: false},
  {id: 2, title: 'Make time for a walk', day: 'today', done: false},
  {id: 3, title: 'Bring the outline together', day: 'today', done: true},
  {id: 4, title: 'Read with a fresh perspective', day: 'tomorrow', done: false},
  {id: 5, title: 'Share the first draft', day: 'tomorrow', done: false},
];
const tours: {id: Tour; label: string; title: string; text: string}[] = [
  {id: 'capture', label: 'Gather an idea', title: 'A thought is a good start.', text: 'Give a passing thought somewhere to land. Write it down now; decide what it becomes when you have a little more room.'},
  {id: 'plan', label: 'Give it time', title: 'A list, with room to breathe.', text: 'Choose what belongs today and what can wait. A simple view of your day makes the next step feel a little more possible.'},
  {id: 'focus', label: 'Find your flow', title: 'Stay with the thing that matters.', text: 'Pick one task and a comfortable stretch of time. Your other ideas will be right where you left them.'},
];

export function AppleWebsite() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [day, setDay] = useState<Day>('today');
  const [draft, setDraft] = useState('');
  const [taskError, setTaskError] = useState('');
  const [workspaceStatus, setWorkspaceStatus] = useState('Your sample day is ready. Make it your own.');
  const [activeId, setActiveId] = useState(1);
  const [tour, setTour] = useState<Tour>('capture');
  const [sessionLength, setSessionLength] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [timerStatus, setTimerStatus] = useState('Ready when you are.');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [plan, setPlan] = useState<'Starter' | 'Plus' | null>(null);
  const nextId = useRef(6);
  const deadline = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleTasks = tasks.filter(task => task.day === day);
  const activeTask = tasks.find(task => task.id === activeId && !task.done);
  const selectedTour = tours.find(item => item.id === tour)!;
  const openTasks = visibleTasks.filter(task => !task.done);
  const agendaTask = activeTask?.day === day ? activeTask : openTasks[0];
  const nextAgendaTask = openTasks.find(task => task.id !== agendaTask?.id);
  const timerDisplay = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        setRunning(false);
        setTimerStatus('Your session is complete. Take a breath before your next step.');
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [running]);

  function stopTimer(message: string) {
    setRunning(false);
    setSeconds(sessionLength * 60);
    setTimerStatus(message);
  }

  function selectTask(task: Task, scroll = false) {
    setActiveId(task.id);
    stopTimer(`Ready to focus on “${task.title}”.`);
    setWorkspaceStatus(`“${task.title}” is your next focus.`);
    if (scroll) document.getElementById('focus-session')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
  }

  function toggleTask(task: Task) {
    const done = !task.done;
    setTasks(previous => previous.map(item => item.id === task.id ? {...item, done} : item));
    setWorkspaceStatus(done ? `Completed: ${task.title}.` : `Returned to your list: ${task.title}.`);
    if (done && activeId === task.id) {
      const next = tasks.find(item => item.id !== task.id && !item.done && item.day === day);
      setActiveId(next?.id ?? -1);
      stopTimer(next ? `Next up: ${next.title}.` : 'Choose an unfinished task to begin a session.');
    } else if (!done && !activeTask) {
      setActiveId(task.id);
      stopTimer(`Ready to focus on “${task.title}”.`);
    }
  }

  function changeDay(value: Day) {
    setDay(value);
    setWorkspaceStatus(value === 'today' ? 'Here is the space you made for today.' : 'Tomorrow has room for a fresh start.');
    setTaskError('');
  }

  function tabKeys(event: KeyboardEvent<HTMLDivElement>) {
    const index = tours.findIndex(item => item.id === tour);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tours.length;
    else if (event.key === 'ArrowLeft') next = (index + tours.length - 1) % tours.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tours.length - 1;
    else return;
    event.preventDefault();
    setTour(tours[next].id);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  function toggleTimer() {
    if (!activeTask) return;
    if (running) {
      setRunning(false);
      setTimerStatus('Paused. Pick up whenever you are ready.');
      return;
    }
    const nextSeconds = seconds || sessionLength * 60;
    setSeconds(nextSeconds);
    deadline.current = Date.now() + nextSeconds * 1000;
    setRunning(true);
    setTimerStatus(`Your focus session for “${activeTask.title}” is underway.`);
  }

  return <div className="ws-apple">
    <header className="fx-nav">
      <a className="fx-brand" href="#focus-top" aria-label="Focus home"><Icon name="mark"/>Focus</a>
      <nav aria-label="Focus product"><a href="#focus-story">How it feels</a><a href="#focus-plans">Plans</a><a href="#focus-questions">Questions</a></nav>
      <a className="fx-nav-cta" href="#focus-workspace">Try Focus<Icon name="arrow"/></a>
    </header>

    <main>
      <section className="fx-hero" id="focus-top">
        <div className="fx-hero-copy">
          <h1>Make room for<br/>your best work.</h1>
          <p>Gather your ideas. Give them time.<br className="fx-desktop-break"/> A calmer day starts with a little Focus.</p>
          <div className="fx-actions"><a className="fx-primary" href="#focus-workspace">Try your day<Icon name="arrow"/></a><a className="fx-text-link" href="#focus-story">See how it works<Icon name="arrow"/></a></div>
        </div>

        <div className="fx-workspace" id="focus-workspace" aria-label="Interactive Focus day planner">
          <div className="fx-workspace-bar"><span><Icon name="mark"/>Your workspace</span><span className="fx-sample-label">A sample day, ready to edit</span><button className="fx-reset" onClick={() => {setTasks(seedTasks.map(task => ({...task}))); setDay('today'); setDraft(''); setTaskError(''); setActiveId(1); stopTimer('Ready when you are.'); setWorkspaceStatus('Sample tasks restored.');}}>Reset day<Icon name="reset"/></button></div>
          <div className="fx-workspace-body">
            <div className="fx-day-list">
              <div className="fx-day-heading"><div><h2>{day === 'today' ? 'Hello, today.' : 'Hello, tomorrow.'}</h2><p>Let’s make a little room.</p></div><Icon name="sun" className="fx-day-sun"/></div>
              <div className="fx-day-switch" role="group" aria-label="Choose a day"><button aria-pressed={day === 'today'} onClick={() => changeDay('today')}>Today</button><button aria-pressed={day === 'tomorrow'} onClick={() => changeDay('tomorrow')}>Tomorrow</button></div>
              <ul className="fx-tasks" aria-label={`${day === 'today' ? 'Today’s' : 'Tomorrow’s'} tasks`}>
                {visibleTasks.map(task => <li className={task.done ? 'fx-task is-done' : 'fx-task'} key={task.id}>
                  <label><input type="checkbox" checked={task.done} onChange={() => toggleTask(task)}/><span className="fx-checkbox" aria-hidden="true">{task.done && <Icon name="check"/>}</span><span>{task.title}</span></label>
                  <button className="fx-task-focus" disabled={task.done} aria-pressed={activeId === task.id && !task.done} onClick={() => selectTask(task)} aria-label={`Focus on ${task.title}`}>{activeId === task.id && !task.done ? 'In focus' : 'Focus'}<Icon name={activeId === task.id && !task.done ? 'check' : 'arrow'}/></button>
                </li>)}
              </ul>
              {!visibleTasks.length && <p className="fx-empty">An open day. Add the first thing you would like to make time for.</p>}
              <form className="fx-add-task" onSubmit={event => {
                event.preventDefault();
                const title = draft.trim();
                if (!title) {setTaskError('Write a few words for your task.'); inputRef.current?.focus(); return;}
                const task = {id: nextId.current++, title, day, done: false};
                setTasks(previous => [...previous, task]); setDraft(''); setTaskError('');
                setWorkspaceStatus(`Added to ${day}: ${title}.`);
                if (!activeTask) {setActiveId(task.id); stopTimer(`Ready to focus on “${title}”.`);}
                inputRef.current?.focus();
              }}>
                <label className="fx-visually-hidden" htmlFor="focus-new-task">Add a task</label><input ref={inputRef} id="focus-new-task" value={draft} maxLength={72} placeholder="Make room for something…" aria-invalid={Boolean(taskError)} aria-describedby={taskError ? 'focus-task-error' : undefined} onChange={event => {setDraft(event.target.value); setTaskError('');}}/>
                <button type="submit" aria-label="Add task"><Icon name="plus"/></button>
              </form>
              {taskError && <p id="focus-task-error" className="fx-field-error" role="alert">{taskError}</p>}
              <p className="fx-workspace-status" role="status">{workspaceStatus}</p>
            </div>
            <div className="fx-agenda">
              <div className="fx-agenda-heading"><span>A little space goes a long way.</span><Icon name="clock"/></div>
              <ol className="fx-timeline" aria-label={`${day === 'today' ? 'Today’s' : 'Tomorrow’s'} example schedule`}>
                <li><time dateTime="09:00">9:00</time><div className="fx-time-quiet"><span>Ease into the day</span><small>A moment to find your bearings</small></div></li>
                <li><time dateTime="10:00">10:00</time><div className="fx-time-focus"><span className="fx-time-tag"><Icon name="mark"/>A little Focus</span><strong>{agendaTask?.title ?? 'Room for your next idea'}</strong><span className="fx-time-length">25 minutes, just for this.</span></div></li>
                <li><time dateTime="11:00">11:00</time><div className="fx-time-quiet"><span>{nextAgendaTask?.title ?? 'Leave some room to wander'}</span><small>A clear space in your day</small></div></li>
              </ol>
              <div className="fx-agenda-note"><span className="fx-note-line"/><p>Some of your best ideas<br/>need a little breathing room.</p></div>
            </div>
          </div>
        </div>
        <p className="fx-under-workspace">Try adding a task. Check one off. Make this day yours.</p>
      </section>

      <section className="fx-story fx-section" id="focus-story">
        <div className="fx-section-heading"><h2>From a passing thought<br/>to a little progress.</h2><p>Your ideas don’t have to arrive in order.<br/>Focus helps you find a place for each one.</p></div>
        <div className="fx-tour-tabs" role="tablist" aria-label="Explore the Focus workflow" onKeyDown={tabKeys}>{tours.map(item => <button key={item.id} id={`focus-tab-${item.id}`} role="tab" aria-controls="focus-tour-panel" aria-selected={tour === item.id} tabIndex={tour === item.id ? 0 : -1} onClick={() => setTour(item.id)}>{item.label}</button>)}</div>
        <div className="fx-tour-panel" id="focus-tour-panel" role="tabpanel" aria-labelledby={`focus-tab-${tour}`}>
          <div className="fx-tour-art" aria-hidden="true">
            {tour === 'capture' && <div className="fx-capture-scene"><div className="fx-idea-sheet fx-idea-back"><span>A thought for later</span><div/><div/></div><div className="fx-idea-sheet fx-idea-front"><Icon name="plus"/><strong>What if the first<br/>page felt like<br/>a fresh start?</strong><span>Saved for a quieter moment.</span></div><div className="fx-idea-caption"><Icon name="check"/>A thought, safely kept.</div></div>}
            {tour === 'plan' && <div className="fx-plan-scene"><div><span>Today</span><strong>A little structure.<br/>A lot of possibility.</strong></div><p><time>10:00</time><span>Make something meaningful</span></p><p><time>11:30</time><span>Step away. Look around.</span></p><p><time>14:00</time><span>Come back with fresh eyes</span></p></div>}
            {tour === 'focus' && <div className="fx-flow-scene"><Icon name="mark"/><strong>Just this.<br/>For a little while.</strong><span>One task. Space to think.</span><div className="fx-flow-line"/></div>}
          </div>
          <div className="fx-tour-copy"><h3>{selectedTour.title}</h3><p>{selectedTour.text}</p><a className="fx-text-link" href={tour === 'focus' ? '#focus-session' : '#focus-workspace'}>{tour === 'capture' ? 'Save your first thought' : tour === 'plan' ? 'Shape your day' : 'Begin a quiet moment'}<Icon name="arrow"/></a></div>
        </div>
      </section>

      <section className="fx-focus-section" id="focus-session">
        <div className="fx-focus-inner"><div className="fx-focus-copy"><h2>One thing.<br/>Your full attention.</h2><p>Close a few mental tabs. Choose something you care about, and give it a little uninterrupted time.</p><a href="#focus-workspace" className="fx-text-link">Choose a different task<Icon name="arrow"/></a></div>
          <div className="fx-timer">
            <div className="fx-timer-task"><Icon name="mark"/><span>{activeTask?.title ?? 'Choose an unfinished task above'}</span></div>
            <div className="fx-timer-display" role="timer" aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}>{timerDisplay}</div>
            <fieldset className="fx-duration"><legend>How much time feels right?</legend>{[15, 25, 45].map(minutes => <label key={minutes}><input type="radio" name="focus-duration" value={minutes} checked={sessionLength === minutes} onChange={() => {setSessionLength(minutes); setSeconds(minutes * 60); setRunning(false); setTimerStatus(`${minutes} minutes set aside. Ready when you are.`);}}/><span>{minutes} min</span></label>)}</fieldset>
            <div className="fx-timer-actions"><button className="fx-primary" onClick={toggleTimer} disabled={!activeTask}><Icon name={running ? 'pause' : 'play'}/>{running ? 'Pause session' : seconds === 0 ? 'Begin again' : seconds < sessionLength * 60 ? 'Resume session' : 'Start a session'}</button><button className="fx-timer-reset" onClick={() => stopTimer('A fresh start. Your timer has been reset.')} aria-label="Reset focus timer"><Icon name="reset"/></button></div>
            <p className="fx-timer-status" role="status">{timerStatus}</p>
          </div>
        </div>
      </section>

      <section className="fx-plans fx-section" id="focus-plans">
        <div className="fx-section-heading"><h2>A little Focus.<br/>At your own pace.</h2><p>Start with a day. Make room for more when you need it.</p></div>
        <div className="fx-billing" role="group" aria-label="Billing period"><button aria-pressed={billing === 'monthly'} onClick={() => setBilling('monthly')}>Monthly</button><button aria-pressed={billing === 'yearly'} onClick={() => setBilling('yearly')}>Yearly</button></div>
        <div className="fx-plan-grid">
          <article className={`fx-plan${plan === 'Starter' ? ' is-selected' : ''}`}><h3>Starter</h3><p>For making space in your everyday.</p><div className="fx-price">Free<span>A good place to begin.</span></div><ul><li><Icon name="check"/>Your daily task list</li><li><Icon name="check"/>A simple focus timer</li><li><Icon name="check"/>Room to gather ideas</li></ul><button className="fx-plan-button" aria-pressed={plan === 'Starter'} onClick={() => setPlan('Starter')}>{plan === 'Starter' ? 'Starter selected' : 'Choose Starter'}<Icon name={plan === 'Starter' ? 'check' : 'arrow'}/></button></article>
          <article className={`fx-plan fx-plan-plus${plan === 'Plus' ? ' is-selected' : ''}`}><h3>Plus</h3><p>For the projects you want to grow.</p><div className="fx-price">${billing === 'monthly' ? '6' : '4'}<span>per month · {billing === 'monthly' ? '$6 billed monthly' : '$48 billed yearly'}</span></div><ul><li><Icon name="check"/>Everything in Starter</li><li><Icon name="check"/>Separate spaces for your projects</li><li><Icon name="check"/>A wider view of your week</li></ul><button className="fx-primary" aria-pressed={plan === 'Plus'} onClick={() => setPlan('Plus')}>{plan === 'Plus' ? 'Plus selected' : 'Choose Plus'}<Icon name={plan === 'Plus' ? 'check' : 'arrow'}/></button></article>
        </div>
        <div className="fx-plan-result" role="status">{plan ? <><Icon name="check"/><span>{plan === 'Starter' ? 'Starter selected. Your next step is a little time for yourself.' : `Plus selected at ${billing === 'monthly' ? '$6 per month' : '$48 per year'}. Your choice is saved for this visit.`}</span><a href="#focus-workspace">Return to your day<Icon name="arrow"/></a></> : <p>Choose the amount of space that feels right for you.</p>}</div>
        <p className="fx-demo-note">Focus is a fictional product. These are example plans; no account or payment is created.</p>
      </section>

      <section className="fx-questions fx-section" id="focus-questions"><div><h2>A few things<br/>you might wonder.</h2><p>A little clarity before you begin.</p></div><div className="fx-question-list">
        <details><summary>Can I try Focus right here?<Icon name="plus"/></summary><p>Yes. Add a task to today or tomorrow, check it off, or choose it for a focus session. The workspace at the top of this page is yours to explore.</p></details>
        <details><summary>Will my tasks be saved?<Icon name="plus"/></summary><p>Your changes stay in this open page. Refreshing restores the sample day. Nothing you type here is sent to a server.</p></details>
        <details><summary>How does a focus session work?<Icon name="plus"/></summary><p>Choose an unfinished task, set aside 15, 25, or 45 minutes, and start the timer. You can pause, resume, or begin again at any point. Completing the selected task stops its session.</p></details>
        <details><summary>What happens when I choose a plan?<Icon name="plus"/></summary><p>The page remembers your selection for this visit and shows the example price. This product study does not create subscriptions or take payments.</p></details>
      </div></section>
    </main>
    <footer className="fx-footer"><div><a className="fx-brand" href="#focus-top"><Icon name="mark"/>Focus</a><p>A little space. A better day.</p></div><span>Independent product website study · IAVSE</span><a href="https://www.apple.com/macbook-air/" target="_blank" rel="noopener noreferrer">Public design reference<Icon name="arrow"/></a></footer>
  </div>;
}
