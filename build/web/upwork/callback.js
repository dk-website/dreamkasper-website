/* Static OAuth handoff only. Token exchange and state/PKCE validation belong to the local app. */
(() => {
  'use strict';
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  // Remove authorization data before any user interaction or navigation.
  try {
    window.history.replaceState(null, '', window.location.pathname);
  } catch {
    document.getElementById('title').textContent = 'Restart the connection';
    document.getElementById('description').textContent = 'This browser could not clear the callback URL. Close this tab and restart authorization in a supported browser.';
    return;
  }
  const title = document.getElementById('title');
  const description = document.getElementById('description');
  const feedback = document.getElementById('feedback');
  const handoff = document.getElementById('handoff');
  const response = document.getElementById('response');
  const copy = document.getElementById('copy');
  let payload = '';

  if (query.has('error') || fragment.has('error')) {
    title.textContent = 'Authorization was not completed';
    description.textContent = 'Upwork returned an authorization error or access was declined. Return to your local app and start a new connection when you’re ready.';
    return;
  }
  if (query.has('access_token') || query.has('refresh_token') || fragment.has('access_token') || fragment.has('refresh_token')) {
    title.textContent = 'Start a new connection';
    description.textContent = 'This page accepts authorization-code responses only. Start the authorization-code flow with PKCE from your local app.';
    return;
  }
  if (!query.has('code') && !query.has('state')) return;
  const code = query.get('code');
  const state = query.get('state');
  if (query.getAll('code').length !== 1 || query.getAll('state').length !== 1 ||
      !code || !state || code.length > 8192 || state.length > 1024 ||
      /[\s\u0000-\u001f\u007f]/u.test(code + state)) {
    title.textContent = 'Incomplete authorization response';
    description.textContent = 'A valid code and state are both required. Return to your local app and start a new connection.';
    return;
  }
  payload = JSON.stringify({
    version: 1,
    provider: 'upwork',
    redirect_uri: 'https://dreamkasper.com/upwork/callback',
    code,
    state,
  }, null, 2);
  // These values remain in this tab's memory only. Never use innerHTML for callback data.
  query.delete('code');
  query.delete('state');
  title.textContent = 'Finish connecting in your local app';
  description.textContent = 'An authorization response arrived from the callback URL. Copy it below to complete the connection in Job Hunter.';
  response.value = payload;
  handoff.hidden = false;
  copy.addEventListener('click', async () => {
    copy.disabled = true;
    try {
      await navigator.clipboard.writeText(payload);
      feedback.textContent = 'Copied. Paste into your local app promptly, then clear this page. Your account is not connected yet.';
    } catch {
      document.getElementById('manual').open = true;
      response.focus();
      response.select();
      feedback.textContent = 'Automatic copying is unavailable. Copy the selected response manually and paste it into your local app.';
    } finally {
      copy.disabled = false;
    }
  });
  function clearResponse() {
    payload = '';
    response.value = '';
    handoff.hidden = true;
    title.textContent = 'Response cleared';
    description.textContent = 'The response has been removed from this page. If you still need to connect, start a new authorization from your local app.';
    feedback.textContent = 'If you copied the response, replace your clipboard contents after pasting it into the local app.';
  }
  document.getElementById('clear').addEventListener('click', clearResponse);
  // Prevent the browser's back/forward cache from retaining a usable handoff.
  window.addEventListener('pagehide', clearResponse);
})();
