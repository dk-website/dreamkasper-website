const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const script = fs.readFileSync('build/web/upwork/callback.js', 'utf8');
function load(search = '', hash = '', clipboardFails = false, historyFails = false) {
  const elements = new Map();
  const events = {};
  let copied;
  let cleaned;
  const document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { hidden: id === 'handoff', value: '', textContent: '', disabled: false, open: false, handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; }, focus() { this.focused = true; }, select() { this.selected = true; } });
    return elements.get(id);
  }};
  const window = { location: { search, hash, pathname: '/upwork/callback' }, history: { replaceState(_state, _title, url) { if (historyFails) throw new Error('unavailable'); cleaned = url; } }, addEventListener(name, fn) { events[name] = fn; } };
  vm.runInNewContext(script, { window, document, URLSearchParams, navigator: { clipboard: { async writeText(text) { if (clipboardFails) throw new Error('denied'); copied = text; } } } });
  return { el: id => document.getElementById(id), events, cleaned, copied: () => copied };
}
test('valid response preserves exact code/state, strips URL, and copies only the handoff contract', async () => {
  const page = load('?code=example%2Bcode&state=example-state&untrusted=ignored');
  assert.equal(page.cleaned, '/upwork/callback');
  assert.equal(page.el('handoff').hidden, false);
  await page.el('copy').handlers.click();
  assert.deepEqual(JSON.parse(page.copied()), {version:1, provider:'upwork', redirect_uri:'https://dreamkasper.com/upwork/callback', code:'example+code', state:'example-state'});
  assert.match(page.el('feedback').textContent, /not connected/);
});
test('direct visit has no copyable response', () => {
  const page = load();
  assert.equal(page.el('handoff').hidden, true);
  assert.equal(page.cleaned, '/upwork/callback');
});
test('missing, duplicated, empty, whitespace and oversized values are rejected', () => {
  for (const query of ['?code=example','?state=example','?code=&state=x','?code=a&code=b&state=c','?code=a&state=b&state=c','?code=a%0Ab&state=c', '?code=a&state=' + 'x'.repeat(1025)]) {
    const page = load(query);
    assert.equal(page.el('handoff').hidden, true);
    assert.match(page.el('title').textContent, /Incomplete/);
  }
});
test('provider error is handled without reflecting untrusted text', () => {
  const page = load('?error=access_denied&error_description=%3Cscript%3E&code=a&state=b');
  assert.equal(page.el('handoff').hidden, true);
  assert.match(page.el('title').textContent, /not completed/);
  assert.doesNotMatch(page.el('description').textContent, /script/);
});
test('tokens in a query or fragment are never exposed for copying', () => {
  for (const [query, hash] of [['?access_token=example',''], ['', '#access_token=example'], ['?code=a&state=b','#refresh_token=example']]) {
    const page = load(query, hash);
    assert.equal(page.el('handoff').hidden, true);
    assert.match(page.el('description').textContent, /PKCE/);
    assert.equal(page.cleaned, '/upwork/callback');
  }
});
test('clipboard failure exposes and selects manual copy text', async () => {
  const page = load('?code=a&state=b', '', true);
  await page.el('copy').handlers.click();
  assert.equal(page.el('manual').open, true);
  assert.equal(page.el('response').selected, true);
  assert.equal(page.el('copy').disabled, false);
});
test('clear and navigation remove response from page memory and DOM', () => {
  for (const mode of ['clear','pagehide']) {
    const page = load('?code=a&state=b');
    if (mode === 'clear') page.el('clear').handlers.click(); else page.events.pagehide();
    assert.equal(page.el('response').value, '');
    assert.equal(page.el('handoff').hidden, true);
  }
});
test('failure to clean the URL stops the handoff', () => {
  const page = load('?code=a&state=b', '', false, true);
  assert.equal(page.el('handoff').hidden, true);
  assert.match(page.el('title').textContent, /Restart/);
});
test('both hosting targets place callback before marketing fallback and apply security headers', () => {
  const config = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
  for (const hosting of config.hosting) {
    assert.equal(hosting.rewrites[0].source, '/upwork/callback{,/**}');
    assert.equal(hosting.rewrites[0].destination, '/upwork/callback.html');
    const headers = Object.fromEntries(hosting.headers.find(h => h.source === '/upwork/**').headers.map(h => [h.key, h.value]));
    assert.match(headers['Cache-Control'], /no-store/);
    assert.equal(headers['Referrer-Policy'], 'no-referrer');
    assert.match(headers['Content-Security-Policy'], /connect-src 'none'/);
    assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
  }
});
