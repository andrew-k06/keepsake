# Keepsake — Security Review (SECURITY lens)

*Seven-lens review, July 2026. See 00-synthesis.md for the consolidated plan.*

## 1. CURRENT-CODE FINDINGS

Verified positives first: there is **no `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or `document.write` anywhere in `src/` or `index.html`** (grep-verified). All user-supplied strings (item name/story, emergency notes, person names/emails) are rendered as JSX text children (e.g., `ItemDetail.tsx:83,105`, `Emergency.tsx:70-71`, `Family.tsx:99-102`), so React auto-escaping closes the classic stored-XSS path in the code as written. Dependencies are current (React 19.2.x, react-router-dom 7.18, Vite 8, lucide-react 1.21) with no vulnerable pins I could verify; the SSR-related react-router advisories don't apply to this client-only HashRouter SPA.

### HIGH

**H1. Entire sensitive dataset persisted in plaintext localStorage with no session boundary.**
`src/store.tsx:6` (`STORAGE_KEY = 'keepsake.binder.v2'`) and `src/store.tsx:45-47` (`localStorage.setItem(STORAGE_KEY, JSON.stringify(state))`) persist, unencrypted and forever: every item with value and room location (including a room literally named "The Safe", `src/data/seed.ts:11`), full-resolution photos as data URLs (`types.ts:34`), family names/emails/roles, and emergency notes. The seed data demonstrates exactly what real users will type: *"The fireproof box in the bedroom closet holds my will… The key is taped under the jewelry drawer"* (`src/data/seed.ts:38-40`). Anyone with momentary physical access to the browser profile — family member, caregiver, library/shared computer, stolen unlocked device — gets the complete burglary map via DevTools or simply opening the URL. There is no auth, no lock, no logout; "Signed in as {ownerName}" (`src/components/Layout.tsx:47`) is cosmetic. Acceptable for a demo, but the app already invites entry of real data ("The new item persists", README:27) with no warning that it's plaintext on disk.

**H2. Shared-origin localStorage exposure on the intended deployment target.**
`vite.config.ts:7` (`base: '/keepsake/'`) plus the `gh-pages` devDependency (`package.json:24`) indicate deployment to `<user>.github.io/keepsake/`. localStorage is scoped per **origin**, not per path — every other app deployed on the same `<user>.github.io` origin (and any XSS in any of them) can read and overwrite the entire binder. Combined with H1 this makes the "Private by design" claim false at the hosting layer.

### MEDIUM

**M1. Untrusted `JSON.parse` of persisted state with zero schema validation.**
`src/store.tsx:27-28`: `JSON.parse(raw) as BinderState` — the cast is a lie to the type system; nothing validates shape. Tampered or corrupted storage (see H2) flows straight into render and logic. Concrete crash: `src/pages/AddItem.tsx:44` does `state.rooms[0].id`, which throws on an empty/missing `rooms` array, bricking the add flow. Any string field in the blob (names, `image`, `color`) becomes attacker-controlled render input.

**M2. Photo EXIF/GPS metadata retained in stored images.**
`src/pages/AddItem.tsx:48-55`: `FileReader.readAsDataURL(file)` stores the raw file bytes — including EXIF GPS coordinates, timestamps, and device identifiers — in the data URL. Today it stays local, but the moment these bytes are printed to PDF (`Summary.tsx:26`), emailed, or uploaded to the future backend/AI vision API, each valuable's photo carries the home's exact coordinates. The pipeline should strip EXIF at capture (canvas re-encode) before this ships anywhere.

**M3. Unhandled storage-quota failure → silent data loss.**
`src/store.tsx:46` calls `localStorage.setItem` with no try/catch. A single modern phone photo is 3–10 MB; base64 inflates it ~33%, and localStorage quota is ~5 MB. `AddItem.tsx:134-141` does no file-size or MIME validation (`accept="image/*"` is advisory only). Result: `QuotaExceededError` thrown inside the effect, item exists in React state but is never persisted — the user believes their heirloom record is saved and it vanishes on reload. For this product's purpose (records consulted after the owner's death), silent persistence failure is an integrity failure, not just a bug.

**M4. Unverifiable privacy promises hard-coded into the UI.**
`src/pages/Welcome.tsx:80-82` ("Private by design. Only the people you invite can ever see your binder."), `src/pages/AddItem.tsx:132` ("Your photo stays private in your binder."), `src/pages/Family.tsx:124-128` ("you'll always be able to see who has looked at your binder" — no audit log exists). Against H1/H2 these are materially false today and become deceptive-practice/FTC exposure if carried into the real product before the controls exist.

### LOW

**L1. No Content-Security-Policy** (`index.html` head, lines 3-8) and seed items hot-link a third party (`src/data/seed.ts:64,80,100,...` Unsplash URLs) — leaks user IPs/usage to Unsplash and leaves no defense-in-depth if any injection is ever found. `item.image`/`item.photo` from (tamperable) storage flow into `<img src>` at `src/components/ItemVisual.tsx:26-34`, and `person.color` into an inline style at `src/components/ui.tsx:176` — inert under React today, but these are the exact fields a CSP should fence.

**L2. No email/input validation on invites.** `src/pages/Family.tsx:68-75` — free-text email (`type="text"`, no format check), no bound on lengths anywhere. Matters once invites actually send mail (mis-delivery of a binder invite = data disclosure to a stranger).

**L3. Weak ID entropy fallback.** `src/store.tsx:35-40` falls back to the constant `1` when `crypto.getRandomValues` is absent, making IDs `performance.now()`-only. Harmless locally; must not survive into server-side identifiers.

**L4. No audit trail on destructive/beneficiary changes.** `updateItem`/`deleteItem` (`src/store.tsx:57-63`) mutate silently; the only guard is `confirm()` at `ItemDetail.tsx:198`. Anyone at the keyboard can reassign every item to themselves ("Who this is for" select, `ItemDetail.tsx:124-137`) with no history — directly enables the coercion scenario in the threat model.

---

## 2. THREAT MODEL — the real hosted product

**Core framing:** the asset is a *structured burglary target map* — geolocated photos, dollar values, physical locations ("The Safe", "fireproof box in the bedroom closet", "key taped under the jewelry drawer"), plus a schedule of who inherits what — owned by a demographic with the highest rates of financial exploitation and the lowest phishing resistance. A breach here isn't credential leakage; it's physical-world risk (burglary targeting, elder fraud, family coercion). Assume attackers include *insiders*: family members, caregivers, and "helpful" acquaintances who legitimately hold or borrow the device.

**Data at rest.** Field-level encryption for the high-toxicity fields (emergency notes, item locations, values, photos), keyed per user, with keys in a KMS/HSM — not just disk-level encryption, so a DB dump or misconfigured bucket is not a target map. Photos in private object storage with short-lived signed URLs, never public-read buckets. Emergency notes deserve the strongest tier (they are literally "where the will and keys are"). Retention/deletion must handle the death-of-owner case explicitly (executor-mediated export, then scheduled purge). Client-side "vault lock" (biometric/PIN re-prompt) for the emergency section even within a valid session.

**Data in transit.** TLS everywhere with HSTS; the AI-vision call is the sensitive new path — the photo (EXIF-stripped *client-side first*, see M2) plus any prompt context ("what is this worth", room name) goes to a model provider; that provider must be under DPA, with no training on user data, and the request must carry the minimum (image only, no address/name/room metadata). Appraiser-marketplace and insurance-referral integrations must receive per-item, per-consent scoped exports — never binder-wide access tokens.

**Account takeover & elder fraud.** Password reset and support channels are the soft target: attackers will phone support impersonating a "worried son." Countermeasures: passkeys/WebAuthn as the primary factor (phishing-resistant *and* senior-friendly — no codes to read to a scammer), aggressive rate limits, no SMS-only recovery, and a designed "trusted-contact recovery" flow rather than ad-hoc support overrides. Elder-specific scenarios to design against: (a) **family coercion** — a relative pressures/uses the owner's session to reassign beneficiaries or export the inventory; mitigate with immutable audit log of beneficiary/role changes, notification of changes to a second trusted contact, and cooling-off/undo windows on beneficiary reassignment; (b) **fake-appraiser scams** — the marketplace is an invitation for "certified appraisers" to harvest inventories or case homes; appraisers must be identity-verified and credential-verified (e.g., USPAP/ISA/ASA), see only the single item they're engaged on (no address until booking, no total binder value ever), with in-app messaging only (no exposing the senior's phone/email); (c) **phishing using product vocabulary** — "Your binder will be deleted, click here"; commit to signed, consistent email patterns and in-app-only sensitive actions.

**Sessions on shared/family devices.** Assume the device is shared with the exact people access control must constrain. Short idle timeouts with re-auth for sensitive views (emergency guide, full summary, family/role management), per-person accounts even within one household (never a shared "family login"), device list with remote sign-out, and no long-lived "remember me" that survives on a caregiver's phone. The printable summary (`Summary.tsx`) needs friction and watermarking — every printed copy is an unencrypted burglary map; log and notify on export/print.

**Photo EXIF/location.** Strip EXIF (GPS, serials, timestamps) client-side at capture before upload; re-encode via canvas. Never derive or store home address from photo metadata. Beware model-inferred location too (AI vision can localize from window views); don't persist model location inferences.

**Executor role.** "Executor (access in an emergency)" (`Family.tsx:80`) must not be a live grant. Correct shape: executor is *designated* while the owner lives (sees nothing, or only what the owner explicitly shares), and access *activates* only through a deliberate protocol — owner-initiated release, verified death certificate, or a dead-man's-switch (owner unresponsive to N notifications over M weeks with a second trusted contact confirming) — with the owner able to test and revoke it. Activation must be logged, notify all family members, and grant read/export only (an executor never edits stories or reassigns beneficiaries). Guard against the "impatient heir" who triggers activation early: multi-party confirmation and a mandatory delay window with owner-override.

---

## 3. TOP 5 SECURITY REQUIREMENTS FOR V1 (ordered)

1. **Real authentication with phishing-resistant, senior-usable factors and hardened recovery.** Passkeys/WebAuthn primary; no SMS-only or support-desk recovery; trusted-contact recovery flow designed for the coercion/impersonation cases. Everything else is moot if grandma's account falls to a phone call.
2. **Server-side authorization enforcing the role model (owner/collaborator/viewer/executor) with executor access gated behind an explicit activation protocol.** Roles exist only in UI copy today; v1 must enforce per-item visibility, viewer read-only, and dormant-until-activated executor access at the API layer, never the client.
3. **Encrypt the toxic fields at rest and minimize what leaves the trust boundary.** Field-level encryption for emergency notes, locations, values, and photos; private storage with signed URLs; EXIF stripped client-side before any upload; AI-vision and appraiser/insurance partners receive single-item, consented, minimum-necessary payloads under DPAs.
4. **Immutable audit log + second-party notifications for sensitive actions.** Beneficiary changes, role changes, invites, exports/prints, executor activation — all logged, all surfaced ("you'll always be able to see who has looked at your binder" must become true), with change-notifications to a trusted contact to blunt in-household coercion.
5. **Verified-professional marketplace and anti-scam session design.** Identity + credential verification for appraisers, item-scoped access with no address/total-value disclosure pre-booking, in-app-only messaging; plus shared-device session hygiene (short re-auth on emergency/summary views, per-person accounts, remote sign-out) and validated/size-limited uploads with schema-validated state (fixes M1/M3 class server-side).
