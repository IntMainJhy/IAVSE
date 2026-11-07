'use client';

import {useState} from 'react';
import './stripe-website.css';

const features = [
  ['Payments', 'One clear path from checkout to confirmation.'],
  ['Subscriptions', 'Keep recurring plans and billing changes together.'],
  ['Reporting', 'Make the next decision with a readable financial picture.'],
];
const shopItems = [
  {id: 'notebook', name: 'Field notebook', detail: 'One good place for your next idea.', price: 24},
  {id: 'desk-set', name: 'Everyday desk set', detail: 'A notebook, pencils and a fresh start.', price: 48},
];
const initialOrders = [
  {id: 1048, name: 'Everyday desk set', amount: 48},
  {id: 1047, name: 'Field notebook', amount: 24},
  {id: 1046, name: 'Field notebook', amount: 24},
];
const money = (amount: number) => '$' + amount.toFixed(2);

function Arrow({diagonal = false}: {diagonal?: boolean}) {
  return <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 15 15 5M5 5h10v10' : 'M3.5 10h12M10 4.5l5.5 5.5-5.5 5.5'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function StripeWebsite() {
  const [annual, setAnnual] = useState(false);
  const [tab, setTab] = useState('Payments');
  const [selected, setSelected] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [itemId, setItemId] = useState(shopItems[0].id);
  const [orders, setOrders] = useState(initialOrders);
  const [checkoutStatus, setCheckoutStatus] = useState('Choose an item, then add it to the demo ledger.');
  const item = shopItems.find(product => product.id === itemId)!;
  const demoTotal = orders.reduce((total, order) => total + order.amount, 0);

  function addDemoOrder() {
    const orderId = orders[0].id + 1;
    setOrders(current => [{id: orderId, name: item.name, amount: item.price}, ...current]);
    setCheckoutStatus(`Demo order #${orderId} added: ${item.name}, ${money(item.price)}. No payment was made.`);
  }

  return <div className="ws-stripe">
    <header className="wst-nav">
      <a href="#wst-top" className="wst-brand">flowpay<span className="wst-brand-period">.</span></a>
      <nav aria-label="Payment site navigation"><a href="#wst-products">Products</a><a href="#wst-pricing">Pricing</a><a href="#wst-platform">Platform</a><a href="#wst-contact">Contact</a></nav>
      <a className="wst-primary" href="#wst-contact">Start building <Arrow diagonal/></a>
    </header>
    <main>
      <section className="wst-hero" id="wst-top">
        <div className="wst-hero-copy">
          <h1>Good business.<br/><span>Great checkout.</span></h1>
          <p>Make every purchase part of a connected experience. Bring your checkout, payments and day-to-day finances into one flow.</p>
          <div className="wst-actions"><a className="wst-primary" href="#wst-checkout">Try the checkout <Arrow/></a><a className="wst-text-link" href="#wst-products">Explore Flowpay <Arrow/></a></div>
          <p className="wst-hero-note">Your brand at the front.<br/>A clear view of the business behind it.</p>
        </div>
        <div className="wst-commerce" id="wst-checkout" aria-label="Interactive local checkout demonstration">
          <div className="wst-commerce-bar"><span>One purchase. Both sides of the story.</span><span className="wst-demo-label">Local demo</span></div>
          <div className="wst-commerce-body">
            <form className="wst-checkout" onSubmit={event => {event.preventDefault(); addDemoOrder();}}>
              <div className="wst-store-name">form &amp; field<span>Everyday things, thoughtfully made.</span></div>
              <h2>Your next good idea<br/> starts here.</h2>
              <fieldset className="wst-shop-options">
                <legend>Choose your item</legend>
                {shopItems.map(product => <label key={product.id} className={itemId === product.id ? 'is-selected' : ''}>
                  <input type="radio" name="wst-item" value={product.id} checked={itemId === product.id} onChange={() => setItemId(product.id)}/>
                  <span><strong>{product.name}</strong><small>{product.detail}</small></span><b>{money(product.price)}</b>
                </label>)}
              </fieldset>
              <div className="wst-checkout-total"><span>Demo total <small>USD</small></span><strong>{money(item.price)}</strong></div>
              <button className="wst-primary wst-checkout-submit" type="submit">Add demo order <Arrow/></button>
              <p className="wst-demo-note">Sample items and amounts. No payment details needed, no money moves.</p>
            </form>
            <div className="wst-ledger" aria-label="Demo merchant ledger">
              <div className="wst-ledger-heading"><span>MERCHANT VIEW</span><span>F&amp;F</span></div>
              <h2>A sale.<br/>A clearer picture.</h2>
              <div className="wst-ledger-total"><span>Demo settled volume</span><strong>{money(demoTotal)}</strong><small>{orders.length} sample orders · USD</small></div>
              <div className="wst-ledger-list"><div className="wst-ledger-list-heading"><span>Recent activity</span><span>Amount</span></div>{orders.slice(0, 4).map(order => <div className="wst-ledger-row" key={order.id}><span><strong>Order #{order.id}</strong><small>{order.name}</small></span><span><b>{money(order.amount)}</b><small className="wst-settled">Settled · demo</small></span></div>)}</div>
              <button type="button" className="wst-reset-demo" disabled={orders.length === initialOrders.length} onClick={() => {setOrders(initialOrders); setCheckoutStatus('Demo ledger reset to its three sample orders.');}}>Reset demo</button>
            </div>
          </div>
          <p className="wst-checkout-status" role="status">{checkoutStatus}</p>
        </div>
        <div className="wst-hero-foot"><span>Built around the way you sell.</span><p>One-time purchases<span aria-hidden="true">/</span>Recurring revenue<span aria-hidden="true">/</span>A shared financial view</p></div>
      </section>
      <section className="wst-products" id="wst-products">
        <div className="wst-section-intro"><h2>One workflow.<br/>From first sale to next step.</h2><p>Give every financial task a clear place, without making your team learn a different system each time.</p></div>
        <div className="wst-product-tabs" role="tablist" aria-label="Product overview" onKeyDown={event => {const names = features.map(feature => feature[0]); let next = names.indexOf(tab); if (event.key === 'ArrowRight') next = (next + 1) % names.length; else if (event.key === 'ArrowLeft') next = (next - 1 + names.length) % names.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = names.length - 1; else return; event.preventDefault(); setTab(names[next]); event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]')[next]?.focus();}}>{features.map(([name]) => <button key={name} role="tab" id={'wst-tab-' + name} aria-controls="wst-tab-panel" tabIndex={tab === name ? 0 : -1} aria-selected={tab === name} onClick={() => setTab(name)}>{name}</button>)}</div>
        <div className="wst-product-detail" id="wst-tab-panel" role="tabpanel" aria-labelledby={'wst-tab-' + tab}>
          <div><h3>{features.find(feature => feature[0] === tab)?.[1]}</h3><p>{tab === 'Payments' ? 'Keep the order, customer and status together. Search and review without switching contexts.' : tab === 'Subscriptions' ? 'A single view for plan changes, billing dates and recurring customer relationships.' : 'Readable totals, useful comparisons and transaction context at the moment you need them.'}</p><a href="#wst-contact">Plan your integration <Arrow/></a></div>
          <div className="wst-product-screen"><div><span>flowpay / {tab.toLowerCase()}</span><i>DEMO</i></div>{[['Website subscription', '$128.00', 'Complete'], ['Studio workshop', '$490.00', 'Complete'], ['Design resources', '$84.00', 'Pending']].map(([label, price, state], index) => <div key={label}><span className="wst-screen-icon">{index + 1}</span><span><strong>{tab === 'Subscriptions' ? 'Monthly / ' : ''}{label}</strong><small>{index === 2 ? 'Awaiting confirmation' : 'Updated just now'}</small></span><b>{price}</b><em>{tab === 'Reporting' ? 'View detail' : state}</em></div>)}</div>
        </div>
      </section>
      <section className="wst-pricing" id="wst-pricing">
        <div className="wst-section-intro"><h2>Start small.<br/>Keep room to grow.</h2><p>Illustrative plans for this design demonstration. No subscription or payment is created.</p></div>
        <div className="wst-billing" aria-label="Billing period"><button aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button><button aria-pressed={annual} onClick={() => setAnnual(true)}>Yearly <small>Save 20%</small></button></div>
        <div className="wst-plan-grid">{[['Starter', 0, 'A place to begin.', ['A single workspace', 'Transaction overview', 'Community resources']], ['Growth', annual ? 23.2 : 29, 'For a team finding its rhythm.', ['Everything in Starter', 'Recurring plans', 'Shared reporting']], ['Scale', annual ? 79.2 : 99, 'For more connected operations.', ['Everything in Growth', 'Multiple workspaces', 'Priority support']]].map(([name, price, desc, items], index) => <article className={index === 1 ? 'wst-plan is-featured' : 'wst-plan'} key={String(name)}>{index === 1 && <span className="wst-plan-label">FOR GROWING TEAMS</span>}<h3>{name}</h3><p>{desc}</p><div className="wst-price"><strong>${typeof price === 'number' && !Number.isInteger(price) ? price.toFixed(2) : price}</strong><span>{annual ? "/ month · billed yearly" : "/ month"}</span></div><ul>{(items as string[]).map(listItem => <li key={listItem}><svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>{listItem}</li>)}</ul><button className={index === 1 ? 'wst-primary' : 'wst-secondary'} onClick={() => setSelected(String(name))}>{selected === name ? 'Selected' : 'Choose ' + name}</button></article>)}</div>
        <p className="wst-status" role="status">{selected ? selected + ' selected · ' + (annual ? 'yearly' : 'monthly') + ' demonstration pricing.' : 'Choose a plan to compare its place in your workflow.'}</p>
      </section>
      <section className="wst-platform" id="wst-platform"><div><h2>Clarity at<br/>every layer.</h2></div><div>{[['A checkout that feels like you', 'Keep your customer experience connected, from choosing a product to reviewing the order.'], ['Revenue with its context', 'See what was sold, which plan it belongs to and where the payment stands in the same workspace.'], ['A shared view of the business', 'Bring payment activity and recurring revenue together, so the whole team can work from one picture.']].map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="wst-contact" id="wst-contact"><div><h2>Build your next<br/>financial workflow.</h2><p>Try the form. The result stays on this page.</p></div><form onSubmit={event => {event.preventDefault(); setStatus('Thanks — ' + email + ' has been added to this local demonstration.');}}><label htmlFor="wst-email">Your work email</label><div><input id="wst-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com"/><button className="wst-primary">Get started <Arrow/></button></div><p role="status">{status || 'Demonstration only. No email is sent.'}</p></form></section>
    </main>
    <footer className="wst-footer"><a href="#wst-top" className="wst-brand">flowpay.</a><span>Independent website design · IAVSE</span><a href="https://stripe.com/payments" target="_blank" rel="noreferrer">Design language reference: Stripe <Arrow diagonal/></a><a href="#wst-top">Back to top <Arrow diagonal/></a></footer>
  </div>;
}
