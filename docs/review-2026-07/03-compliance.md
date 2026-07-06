# Keepsake — Compliance / Legal-Risk Review (US market)

*Seven-lens review, July 2026. See 00-synthesis.md for the consolidated plan.*

Scope: full read of README.md, src/types.ts, src/data/seed.ts, all src/pages/*, src/components/ui.tsx, Layout.tsx, ItemCard.tsx, store.tsx. Prototype is client-only (localStorage), but copy is written as if production promises exist — that copy is the risk surface.

---

## 1. CURRENT-COPY FINDINGS (overpromising text, cited)

### Estate-law / testamentary overreach
- **src/pages/ItemDetail.tsx:142-143** — `This will pass to {heir.name}.` Declarative statement of testamentary effect. A dropdown assignment has zero legal force; tangible personal property passes under the will or intestacy. Worst single line in the app. Rewrite: "You'd like this to go to Sarah. This is a wish, not a will."
- **src/pages/Summary.tsx:42-43** — "Below is what each person has been **entrusted with**" — implies a completed transfer. Compounded by Summary.tsx:26-27 (`Print this binder`): the printed artifact can be waved around at a funeral as if it were a codicil. The printout carries **no disclaimer anywhere**.
- **src/pages/Family.tsx:80** — `<option value="executor">Executor (access in an emergency)</option>` — implies the app can confer or recognize executor status. Executor authority comes from a will + court letters, not a select element.
- **Counter-example (good):** src/pages/Emergency.tsx:82-84 — "This section isn't a legal will…" is the right instinct, but it's the *only* disclaimer in the app and it's on the wrong page (Emergency notes are the least will-like feature; the beneficiary picker and Summary have none). Same card, line 84-85: "Keepsake can help you share it **automatically with your executor** if something ever happens" — promises a death-triggered disclosure mechanism that has heavy RUFADAA/verification requirements (see 2g).

### Insurance
- **src/pages/ItemDetail.tsx:181-187** — the "Look into insurance" button executes `updateItem(item.id, { insured: true })`, immediately rendering the green **"Insured"** badge (src/components/ui.tsx:185-192). Clicking a button ≠ coverage. In production this pattern implies a policy is in force — deceptive-practice (FTC Act §5) and reliance risk (family skips real coverage). Also ItemDetail.tsx:76-78 "Not insured" pill presents Keepsake as authoritative on coverage status.
- **src/pages/Appraisals.tsx:60-63** — "this record is what **makes an insurance claim simple** — and it **makes sure your children never sell** something for a fraction of its worth." Two guarantees Keepsake cannot make. Insurers routinely dispute documentation; "makes sure…never" is a warranty of outcome.

### Appraisal
- **src/pages/Appraisals.tsx:20-22** — "valued right from your photos… seen in person by a **certified appraiser** near you." Personal-property appraisers are not state-certified (unlike real-estate appraisers); "certified" implies government credentialing that doesn't exist. Say "USPAP-trained / accredited (ISA, ASA, AAA) appraiser."
- **src/pages/Appraisals.tsx:32** — demo completion fabricates `appraisedValue: estValue * 1.1`, which then displays as "**appraised value**" (ItemDetail.tsx:88-89) and flows into Summary/insurance framing. Fine in a demo; in production, nothing may be labeled "appraised" unless it comes from a delivered USPAP-compliant report. Seed data reinforces the right pattern (seed.ts:90 "USPAP appraisal (2023)") — keep that discipline.
- **src/pages/Appraisals.tsx:45** — "finds certified appraisers near you and books a visit" — marketplace vetting promise (see 2b).

### AI estimates
- **src/pages/AddItem.tsx:166** — "We're identifying what this is and **what it may be worth**", then AddItem.tsx:173-179 "Here's what we found… We think this is a {name}" and the value is silently injected into the "Estimated value" field (AddItem.tsx:65). No accuracy, no-advice, or not-an-appraisal disclaimer anywhere in the flow.

### Privacy / security absolutes
- **src/pages/Welcome.tsx:81** — "Private by design. Only the people you invite can **ever** see your binder." Absolute security guarantee; classic FTC §5 exposure after any breach. Data is currently unencrypted localStorage.
- **src/pages/AddItem.tsx:132** — "Your photo stays private in your binder." Directly contradicted by the planned architecture: README.md:47-48 says the real version sends the photo to a vision model.
- **src/pages/Family.tsx:125-127** — "Family members **only see what you allow**… you'll **always be able to see who has looked** at your binder." Promises (1) granular per-item permissions and (2) an access audit log — neither exists even conceptually in the data model (roles in types.ts:15 are binder-wide; nothing is enforced). Either build both or delete the sentence.
- **src/data/seed.ts:38-39** — sample copy coaches users to record "The key is taped under the jewelry drawer" alongside safe contents and will location. Seed content teaches users to centralize burglary/elder-exploitation gold (safe locations + key locations + item values + who visits). Sample data is copy; it sets behavior.

---

## 2. LEGAL-RISK MAP (real product)

### (a) Beneficiary assignments vs. estate law
- Assignments are precatory wishes. They cannot override a will, intestacy, joint ownership, or beneficiary designations. If a Keepsake summary conflicts with the will, the will wins — and a family that relied on Keepsake has a claim narrative.
- **Path to (some) legal effect without becoming a law firm:** ~30 states (UPC §2-513 adopters) recognize a **tangible personal property memorandum** referenced in a will — signed writing describing items and recipients. Keepsake could export a memorandum-formatted PDF with instructions "give this to the attorney who drafts/holds your will," with state-availability caveats (e.g., NY does not recognize it; CA only via narrow Prob. Code §6132). Do NOT auto-generate anything styled as a will or codicil.
- **UPL containment:** stay in the self-help-software lane — (1) no individualized guidance ("in your situation you should…"); (2) conspicuous "not a law firm / not legal advice / not a substitute for an attorney" disclaimer (some states effectively require it for self-help legal products, e.g., Tex. Gov't Code §81.101(c) carve-out conditions); (3) consistent "wishes" vocabulary — audit out "beneficiary," "inherit," "will pass to," "entrusted"; use "who you'd like this to go to" (AddItem.tsx:239 already gets this right); (4) affirmative nudge to consult an estate attorney, which is a feature, not a weakness, for this demographic.

### (b) Appraisal marketplace
- No state licensing regime for personal-property appraisers, but **USPAP compliance is the market/insurer/IRS standard**, and IRS "qualified appraiser" rules (IRC §170(f)(11); Treas. Reg. §1.170A-17: designation from a recognized org + education/experience) matter the moment a user uses an appraisal for estate-tax or charitable-deduction purposes.
- Marketplace liability = **negligent referral/vetting**: the words "certified," "vetted," and "we find appraisers" create a duty. Mitigate with: credential verification at onboarding (current USPAP 7-hour course, ISA/ASA/AAA accreditation), E&O insurance minimums, independent-contractor marketplace agreement with indemnity, an in-product statement that appraisers are independent professionals and Keepsake is a directory/booking layer, and a rule that `appraisedValue` is only ever populated from an uploaded appraiser report.

### (c) Insurance referrals
- The trap: **compensation contingent on the sale of insurance is producer activity** requiring a state insurance-producer license (state analogs of NY Ins. Law §§2114-2116 pattern). Per-policy or percentage-of-premium referral fees to an unlicensed platform = unlicensed producing in most states.
- Generally safe pattern (still state-by-state): **flat, non-sale-contingent referral fee**, no discussion of coverage terms, no premium quoting, no recommendation of a specific policy in-app; hand off to a licensed producer/partner and disclose compensation. Alternative: form/acquire a licensed agency entity.
- The current UI is the opposite of safe: an in-app "Insured" state Keepsake asserts (ItemDetail.tsx:181-192). Rename to user-attested status ("You marked this insured") and never display coverage as fact.

### (d) AI value estimates & market-trend indications
- Required framing: estimates are **informational ranges, not an appraisal (USPAP term of art), not financial, investment, insurance, or tax advice**, may be materially wrong, and shouldn't be relied on for insuring, selling, or estate planning without a professional appraisal. Show ranges + confidence, log model provenance, and label AI content as AI-generated (FTC deception guidance; CA and other state AI-disclosure laws trending).
- Market-trend indications: never frame heirlooms as investments or predict appreciation. Note the audience multiplier: **FTC treats elder-targeted deception as aggravated** (Elder Abuse Prevention and Prosecution Act posture; §5 + ROSCA if subscription billing). Appraisals.tsx:60-63's "makes sure your children never sell for a fraction of its worth" is exactly the claim class to eliminate.

### (e) Privacy
- The dataset is a **target map**: itemized valuables with photos, values, rooms ("The Safe"), safe-key locations, will location, attorney, medication/advance-directive pointers (seed.ts:34-57), family emails and inheritance expectations. Treat all of it as sensitive regardless of statutory category.
- **CCPA/CPRA + the comprehensive-state-law wave** (VA/CO/CT/TX/etc.): notice at collection, purpose limitation, deletion/access rights, opt-out links, data-minimization; precise geolocation and health-adjacent data can hit "sensitive" categories. No HIPAA (not a covered entity), but medical notes deserve HIPAA-grade handling as a design norm.
- **Breach:** all-50-state breach-notification exposure; the Welcome.tsx:81 "only…ever" promise converts any breach into a deception count on top of breach liability.
- **Elder-abuse angle:** the collaborator role is a self-dealing vector (a "helper" child reassigning items to themselves). Design abuse-resistance: immutable audit log of beneficiary/role changes (also makes Family.tsx:127's promise true), owner-only beneficiary edits by default, alerts to the owner on changes, and an escalation path informed by state Adult Protective Services / elder-financial-exploitation reporting frameworks (Keepsake likely isn't a mandated reporter, but banks-style "hold and report" thinking is the right posture).
- **GDPR, only where it changes design:** GDPR does not protect deceased persons (member states may), but EU availability would force data-minimization, erasure rights, and an EU-representative — the design-relevant piece is building a **retention/legal-basis model now** that can reconcile "right to erasure" with "legacy data meant to outlive the user."

### (f) Accessibility
- Senior-targeted consumer web product = elevated **ADA Title III** exposure (DOJ's consistent position that commercial websites are public accommodations; serial-plaintiff bar actively targets consumer sites; California Unruh Act adds $4,000/violation statutory damages). DOJ's Title II rule codifying **WCAG 2.1 AA** is the de-facto benchmark.
- The UI is directionally good (large targets, `aria-hidden` on decorative icons, `aria-pressed`/`aria-label` on the view toggle in Home.tsx:187-189), but there's no evidence of contrast validation, focus management, or screen-reader testing; `window.print()` summary and photo-capture flows are classic failure points. A senior product getting sued over accessibility is also a brand-fatal headline.

### (g) Death/incapacity data handling
- **RUFADAA** (adopted in ~47 states): a custodian may disclose digital assets to a fiduciary, with priority given to the user's designation in an **"online tool"** — which overrides the will. Keepsake's "executor" role should be built as an explicit RUFADAA online-tool designation: affirmative, revocable, logged consent by the owner to disclose binder contents to the named person upon verified death/incapacity.
- **Contractual requirements for "executor access":** ToS must specify (1) the trigger and proof — certified death certificate plus letters testamentary/of administration (or, for the in-app designee under RUFADAA, death certificate + identity verification); incapacity requires POA/guardianship documentation; (2) what is disclosed and to whom; (3) survivorship of the account and who pays; (4) dispute handling among family members; (5) Keepsake's right to demand court orders when in doubt. The Emergency.tsx:84-85 "share it automatically" promise is only lawful/safe on top of this machinery — "automatic" should become "after we verify."

---

## 3. TOP 5 COMPLIANCE ACTIONS BEFORE CHARGING MONEY (ordered)

1. **Ship Terms of Service + Privacy Policy drafted by counsel.** Concrete artifacts: (a) "Not a law firm; not legal, financial, insurance, or tax advice; assignments are non-binding wishes" clause; (b) RUFADAA online-tool consent clause + executor-verification procedure (death certificate + letters/court appointment); (c) AI-output disclaimer clause; (d) limitation of liability + arbitration; (e) CCPA-compliant privacy notice covering the sensitive inventory data. Nothing else matters until users are inside a contract.

2. **Copy remediation pass with in-context disclaimers.** Concrete artifact: a copy-change PR covering, at minimum — ItemDetail.tsx:142 ("This will pass to" → "Your wish: this goes to… A wish, not a will"); Summary.tsx:42 ("entrusted with" → "would like to go to") plus a persistent header/footer disclaimer on the **printed** summary ("This document expresses wishes only and is not a will, trust, or legal instrument"); Family.tsx:80 ("Executor" → "Emergency contact / trusted person — legal executor status comes from a will"); Welcome.tsx:81 and AddItem.tsx:132 (delete "ever"/"stays private" absolutes; disclose AI photo processing); Appraisals.tsx:20-22, 60-63 (drop "certified," drop "makes sure…never"); Family.tsx:125-127 (remove audit-log promise until built). One standard disclaimer string, reused, attorney-approved.

3. **Insurance-referral licensing determination before any insurance revenue.** Concrete artifact: 50-state (or launch-state) counsel memo on producer licensing for the chosen referral model, plus the compliant flow spec: flat non-contingent referral fee OR licensed-partner handoff, compensation disclosure screen, and removal of the self-set `insured` flag (ItemDetail.tsx:181-187) in favor of "You marked this as insured" user attestation.

4. **Appraiser-network credentialing program.** Concrete artifacts: appraiser onboarding checklist (current USPAP course certificate, ISA/ASA/AAA accreditation verification, E&O insurance ≥ $1M, background check); marketplace agreement (independent contractor, indemnification, report-delivery standards); product rule that `appraisedValue` populates only from an uploaded appraiser report and the label "appraised" appears nowhere else.

5. **Security + accessibility conformance to back the claims.** Concrete artifacts: security spec (encryption at rest/in transit, MFA, role enforcement server-side, immutable audit log of views and beneficiary/role changes — which also delivers the elder-abuse-resistance control and makes Family.tsx:127 true); WCAG 2.1 AA third-party audit report with remediation list, including the print summary and photo-capture flows.

Cross-cutting note: the seed/demo content itself (seed.ts:38-39 key-location coaching) should be revised before any public demo — it models unsafe data-entry behavior for the exact population regulators most protect.
