# Upwork authorization callback

The existing Dream Kasper Firebase website hosts a static manual OAuth handoff at:

https://dreamkasper.com/upwork/callback

This page is an OAuth redirect destination, not a webhook receiver. It requires no
Next.js app, npm installation, hosted function, API secret, or database. Existing
marketing pages and the production deployment workflow remain intact.

## Deploy

From this repository, with Firebase CLI installed and signed in:

```sh
node --check build/web/upwork/callback.js
node --test tests/upwork-callback.test.cjs
git diff --check
firebase deploy -P dreamkasper-website --only hosting:production
```

Alternatively, the existing GitHub Actions workflow deploys when changes are pushed
to `master`. Deployment publishes the entire current `build/web` directory and
hosting configuration, not just the callback. This change does not deploy anything
by itself.

After deployment, open `/upwork/callback` without parameters to see the waiting
state. For a harmless copy-button check, use
`/upwork/callback?code=demo-only&state=demo-only`. These dummy values cannot connect
an account. Check that the address bar is cleared and the copy button returns JSON.
Real authorization data must never be used in screenshots, tests, logs, or chats.

## Handoff contract (version 1)

The copy button returns JSON with exactly these fields:

```json
{
  "version": 1,
  "provider": "upwork",
  "redirect_uri": "https://dreamkasper.com/upwork/callback",
  "code": "SHORT_LIVED_AUTHORIZATION_CODE",
  "state": "STATE_FROM_PENDING_LOCAL_AUTHORIZATION"
}
```

The local Job Hunter app (separate project; not implemented in this checkout) must:

1. Initiate authorization with fresh unpredictable state and a PKCE S256 challenge;
   keep state and the verifier locally, and expire the pending attempt.
2. Accept the pasted JSON, validate its version/provider/redirect URI and compare
   state with the pending attempt. Reject mismatches and replayed responses.
3. Promptly exchange the code with Upwork from the local backend using the original
   verifier and exact registered redirect URI. Keep any required client secret
   local and server-side. Verify the approved Desktop app's requirements first.
4. Store access/refresh tokens locally (prefer macOS Keychain), honor returned
   expiry values, and persist rotated tokens. Never commit credentials or expose
   them to browser code or logs. A code is not a reusable startup credential.

Until that local flow exists and Upwork access is approved, deploying this page
only makes the callback route ready; it does not enable API access.

## Page behavior and limits

The page reads code/state from query parameters, strips query/fragment data with
`history.replaceState`, and copies the response only after a click. Both fields
are required and duplicate/invalid values are rejected. Provider errors and
implicit token responses are handled without reflecting their contents. The page
cannot verify state or establish that the response actually came from Upwork;
that verification is the local app's responsibility.

It makes no network requests, uses no analytics, stores nothing in browser storage,
and has no automatic redirect. Security headers disable caching, framing,
referrers, and network connections. A manual copy fallback handles clipboard API
failure. Clear removes the response from the page, not from the system clipboard;
replace clipboard contents after importing. Navigating away also clears the page.

OAuth query parameters necessarily reach the hosting provider before JavaScript
can remove them from the URL. Check hosting access-log retention/access separately;
client-side cleanup cannot erase upstream logs. No token or client secret should
be sent to this route.

## Verification

`node --test tests/upwork-callback.test.cjs` exercises callback behavior in a Node
DOM harness and checks Firebase routing/header configuration. It does not establish
real browser clipboard permission behavior or a working Upwork OAuth exchange.

Reference: https://www.upwork.com/developer/documentation/graphql/api/docs/index.html
