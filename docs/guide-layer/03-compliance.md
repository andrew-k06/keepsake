# Keepsake — Compliance Lens: The Guide Layer (Estate-Preparedness Education + AI Companion)

*Guide-layer concept session, July 2026. Follow-on to `docs/review-2026-07/03-compliance.md`. US market. See 00-synthesis.md for the consolidated concept.*

**Threshold judgment: the guide layer is buildable and, done right, is a compliance *asset* — but only as an education-and-checklist product. The moment it applies law to one user's facts or emits instrument text, it becomes a legal-services product in the highest-scrutiny demographic. Everything below is the fence around that line.**

---

## 1. Education vs. Advice — where the UPL line actually sits

### The doctrinal line
Every state defines the practice of law itself; the common core is **applying legal principles to a specific person's specific facts** (advising, selecting, drafting, or interpreting for an individual). Publishing general legal information is protected speech and not UPL anywhere. So:

- **"A power of attorney lets someone you choose handle finances if you can't."** — Education. General, declarative, no addressee-specific conclusion. Safe in all 50 states.
- **"In your situation, you should get a POA before the will."** — Advice. Three UPL triggers in one sentence: individual application ("in your situation"), a recommendation ("you should"), and instrument *selection/sequencing* (choosing among legal tools for this person).

The subtle version of the line, which matters for an interactive product: **personalizing navigation is fine; personalizing legal conclusions is not.** A guide may use what it knows about the user to decide *which topics to surface* ("you mentioned owning a home — here's what a transfer-on-death deed is, and a question to ask an attorney about yours"). It may never use those facts to output a *conclusion or recommendation* ("since you own your home outright, a TOD deed would avoid probate for you"). Same input, different output type — the output type is the whole game.

### The enforceable rubric (for the content team AND the AI system prompt — same document)

| | GREEN — publish freely | YELLOW — allowed with framing rules | RED — never |
|---|---|---|---|
| **Definitions** | What a will/POA/advance directive/executor/beneficiary designation/trust *is* and does, generally | State-specific rules stated as cited facts ("In Texas, a will needs two witnesses — verify with your attorney") | "Your will is/isn't valid"; interpreting the user's document |
| **How things work** | How probate works, what intestacy means, that beneficiary designations override wills, what executors do | "People in situation X often consider Y — an attorney can tell you whether it fits *you*" | "You need / don't need a will / trust / POA"; ranking or selecting instruments for the user |
| **Personalization** | Adapting which *topics* and *checklists* appear based on user facts | Preparedness scores framed as "topics you haven't covered yet" | Preparedness scores framed as "what you're missing / what you should do"; sequencing advice ("do the POA first") |
| **Documents** | Explaining what a document contains generally; linking to a state's *official* statutory forms | Checklists of decisions a document will require ("who would you want as agent? — bring this answer to the attorney") | Generating, filling, assembling, or reviewing any legal instrument; confirming execution ("yes, that's properly witnessed") |
| **Outcomes** | "Probate timelines vary; contested estates take longer" | General cost/benefit facts about instrument types | Predicting the legal outcome of the user's facts ("your kids would inherit equally") |
| **Routing** | Always available: "questions to ask an attorney" exports | — | Discouraging counsel ("you probably don't need a lawyer for this") — the inverse error, equally red |

Three-question test any sentence (human- or AI-written) must pass: **(1) Is it true for the general public, not just this user? (2) Does it inform rather than direct? (3) When it touches a decision, does it route to a professional?** Any "no" → rewrite or refuse.

### State variance and the Texas-style carve-out
- UPL is defined and enforced state-by-state (bar committees, AGs; criminal in many states — Florida makes it a third-degree felony). There is no federal safe harbor. Content must therefore be written to the *strictest* posture, not the average.
- **Texas Gov't Code §81.101(c)** — enacted after the *Parsons Technology* (Quicken Family Lawyer) injunction — exempts self-help legal software and publications from "practice of law" **on condition** that the products **"clearly and conspicuously state that the products are not a substitute for the advice of an attorney."** Treat that as the design spec everywhere: the exemption is *conditioned on the disclaimer being conspicuous*, which is why the disclaimer architecture in §4 is a compliance control, not boilerplate.
- **Document preparation is the brighter, harder line.** The LegalZoom posture: *Janson v. LegalZoom* (W.D. Mo. 2011) let a UPL claim past summary judgment because interactive software that selects and assembles provisions from a user's answers resembles what a lawyer does; LegalZoom survived elsewhere (e.g., its 2015 North Carolina consent judgment) only under negotiated conditions. Keepsake should not spend a dollar litigating for that lane. **Product rule: Keepsake TEACHES and CHECKLISTS; it never generates, fills, or assembles a legal instrument.** For state statutory forms (advance directives especially), *link out to the state's official form*; never host a fillable version. The tangible-personal-property memorandum export is the outer boundary of acceptable output and keeps its "give this to the attorney who holds your will" framing.
- **The protected-population multiplier:** estate-planning outreach to seniors is the historical **living-trust-mill** fact pattern (state AG and bar enforcement, AARP litigation). Keepsake's structural defenses against being read as a trust mill: no legal product for sale at the end of the education, no urgency mechanics, and a measurable pattern of pushing users *toward* independent attorneys. Preserve all three visibly.

---

## 2. The AI companion — "do I need a trust?" is the whole problem

An unconstrained LLM answers that question helpfully, i.e., illegally. The companion must be built so the *helpful* answer and the *compliant* answer are the same answer.

### System-prompt rules (the rubric above, plus)
1. **Persona:** "a guide who explains, never an advisor who recommends." Never claim to be, or be marketed as, a lawyer, legal expert, or advisor. Always disclose AI/non-human status on session start (FTC deception posture; California's bot-disclosure law is the template) — especially load-bearing with seniors who may attribute personhood.
2. **Grammar constraint that does most of the work:** general statements in the third person ("many people…", "a trust generally…"); **second-person prescriptive constructions ("you should," "you need," "in your case") are banned** except in two whitelisted frames: routing ("you may want to bring this question to an attorney") and process ("you can print this checklist").
3. **Grounding:** state-law specifics answered *only* from Keepsake's curated, dated, attorney-reviewed content corpus (RAG); if the corpus doesn't cover it, say so and route. No free-generation of statutory requirements — a hallucinated witness count in a will-execution answer is the nightmare scenario.
4. **No memory-driven advice creep:** the companion may use profile facts to pick topics (navigation), never to tailor conclusions — the same green/red split as §1.

### The canonical response pattern (encode as the required output shape)
For any "do/should I…" legal question:
1. **Define** — "A trust is a legal arrangement where…"
2. **Describe the general landscape** — "People consider trusts for reasons like avoiding probate, planning for incapacity, or providing for someone over time. Which fits depends on details of a person's property, family, and state."
3. **Route with a gift, not a shrug** — "Whether *you* need one is exactly the question an estate attorney answers — and it's usually a single conversation. Here are the questions to bring: …" (generated question list, exportable/printable — this is the feature that makes routing feel like service, not refusal).
4. **One-line contextual disclaimer** (the reusable component from §4), not a paragraph.

### Refusal boundaries (hard refusals, with warm redirect copy)
- Drafting or editing any legal instrument text, "just a simple clause," or execution validation ("is this signed right?").
- Reviewing/interpreting an uploaded or pasted will, trust, POA, or directive.
- Predicting the user's legal outcome ("who gets the house if…") on their facts.
- Medical treatment recommendations or prognosis (advance-directive content stays at "what the form lets you decide").
- Investment/insurance product recommendations, coverage amounts, or tax positions.
- **Coercion-adjacent requests** — "how do I get Mom to sign the POA," "help me convince Dad to leave me the house": refuse, and respond with undue-influence education + the resources in §3d. Log with a distinct flag.

### Disclaimers, logging, and evidence
- **Placement:** one first-run interstitial (plain language, once); a persistent small chip on the chat surface ("General information — not legal advice"); the inline contextual component whenever a response crosses into yellow-zone territory. No per-message walls.
- **Logging (this is affirmative-defense infrastructure):** retain full transcripts; flag every guardrail trigger; version-control system prompts; run a recurring red-team eval suite (a golden set of "do I need a trust"-shaped prompts with pass/fail rubric scoring) and keep the results. If a bar committee ever asks, Keepsake produces a paper trail showing *systematic, tested* non-advice behavior — that record is worth more than any disclaimer.

### FTC posture on AI claims to seniors
- Post-**Operation AI Comply** (2024), overstated AI capability claims are a §5 target in their own right; **elder-targeted deception is treated as aggravated**.
- Marketing rules: never "your AI legal guide/advisor/expert," never imply attorney-equivalent competence, never imply the companion "makes sure you're protected." Safe register: "explains the basics in plain English and helps you get ready for the professionals." Disclose AI-generated content as such, consistent with the app's existing labeled-preview discipline.

---

## 3. Adjacent tripwires

**(a) Advance directives / medical content — not medical advice.** Explaining what an advance directive, living will, health-care proxy, or POLST *is* — including plain-language explanations of what terms like ventilation or artificial nutrition mean — is education. The lines: never characterize any treatment choice as advisable for the user; never interpret a user's existing directive; note that **POLST is a medical order** completed with a clinician, and route there; and for the forms themselves, **link to each state's official statutory form** rather than hosting or pre-filling — hosting a fillable directive is document preparation. Answers about "what should I choose" route to *both* the person's doctor (medical substance) and attorney/state form process (legal form).

**(b) Financial-account guidance — not investment advice, and a data-sensitivity step-change.** Teaching that beneficiary designations, POD/TOD registrations, and joint titling pass outside the will (and override it) is high-value education — keep it. Never recommend specific products, allocations, consolidation, or "move the IRA" actions (Investment Advisers Act territory the moment recommendations touch securities, and state UDAP regardless). On data: a guide module that has users *inventory their accounts* creates a stored map of the estate's financial surface. **CPRA-class state laws treat financial account information as sensitive, and this is the single most exploitation-relevant dataset in the app.** Product rule enforced at the schema level: store *pointers* only (institution name, account type, "beneficiary form on file? y/n") — **no credentials, no account numbers, no balances**; field-level encryption per the Wave 1 plan; and the UI should affirmatively tell users not to enter passwords.

**(c) Insurance explanations — not producer activity.** Explaining term vs. whole life, what a beneficiary designation on a policy does, and why coverage reviews matter is education. Producer activity (state licensing) = **soliciting, negotiating, or selling**: recommending a carrier, policy, or coverage amount, quoting premiums, or a "you need $X of coverage" calculator — the calculator especially if it sits anywhere near referral revenue. **Keep the guide's insurance education economically decoupled from the referral flow** already gated on the state-licensing counsel memo; the education pages carry no referral links until that memo clears the model.

**(d) Coercion surfacing in "family conversation" modules — design for it now.** A module that coaches family estate conversations *will* receive disclosures: "my son says I have to sign everything over to him." Keepsake is almost certainly **not a mandated reporter** (elder-abuse mandatory-reporting statutes reach professionals — not consumer software), but "not mandated" must not mean "not designed for." Required design: (1) the AI companion recognizes coercion/undue-influence language and responds with resources — **Adult Protective Services locator, Eldercare Locator (1-800-677-1116), the DOJ National Elder Fraud Hotline** — plus plain education that documents signed under pressure can be challenged; (2) the family-conversation module runs only in the *owner's* authenticated session and never becomes a tool an heir can operate to extract or record commitments (session attribution + the existing audit log are the controls); (3) a written internal escalation playbook (what support staff do with a coercion disclosure, permissive-report contact paths per state) so the response is a procedure, not an improvisation; (4) the guide never scores or displays "who gets more," which manufactures the pressure it should defuse.

---

## 4. Why guidance done right is *safer* than silence

**The affirmative-defense math.** Keepsake's core risk (prior lens) is users treating wishes as legally effective and skipping real estate planning. A guide layer that consistently teaches "wishes need a will; here's what a will is; here's how to find an attorney" *reduces* that reliance risk — and the routing pattern is itself the UPL defense: a product with documented, tested, universal route-to-professional behavior has negated the "holding out as providing legal services" element and inverted the trust-mill fact pattern (education that *increases* independent attorney consultations). **Instrument the funnel** — track attorney-directory clickthroughs and "questions to ask" exports — because that metric is both a growth number and litigation-grade evidence of what the product actually does.

**Attorney referrals — the fee question has a trap in it.** Lawyers may not pay for referrals except through a **qualified lawyer-referral service** (ABA Model Rule 7.2(b)); for-profit non-bar referral services are prohibited or registration-gated in most states (California: State Bar registration under Bus. & Prof. Code §6155), and per-client or per-matter fees flow straight into fee-splitting-with-nonlawyers territory (Rule 5.4) — the problem that killed **Avvo Legal Services** under NY/NJ/Ohio ethics opinions. **Recommendation: take zero revenue from attorney referrals at launch.** Link freely to state-bar LRS programs and the NAELA (elder-law) directory; if attorney-side monetization is ever wanted, the only defensible model is flat, non-contingent *advertising/directory* fees structured under Rule 7.2's reasonable-advertising-cost allowance — with a 50-state ethics memo first. The referral feature's value is trust and defense posture, not margin.

**Disclaimer architecture — one component, placed at decision moments.** A wall of text is legally weak (unread = arguably not conspicuous) and brand-toxic for this audience. Build **one reusable in-context component**, attorney-approved once, ~2 sentences in the app's voice:

> *"Keepsake teaches how these things generally work — it isn't legal advice, and it's not a substitute for an attorney. For what's right for you, a short conversation with one is worth it. → Questions to bring"*

Placement map: top of each guide topic, inline in AI responses at yellow-zone moments, on every checklist, footer of every printed/exported guide artifact (extending the existing print-disclaimer pattern), plus the master clause in ToS. The component's conspicuousness is what satisfies Texas-style carve-out conditions; the "questions to bring" link is what makes it feel like help instead of a liability shield.

---

## 5. Top 5 compliance requirements to ship the guide layer (ordered)

1. **Adopt the Education/Advice rubric as a binding content standard — before any guide content or prompt is written.** *Artifact:* the §1 rubric as a versioned doc in the repo (e.g., `docs/guide-layer/upl-rubric.md`), counsel-reviewed, wired into the content style guide and the PR checklist for every guide page; the three-question test embedded verbatim in the AI system prompt. Everything else derives from this.

2. **AI companion guardrail spec + evaluation harness.** *Artifact:* the system prompt (rubric, grammar constraint, response pattern, refusal taxonomy, AI-status disclosure); a curated/dated state-law RAG corpus with a "decline if uncovered" rule; a red-team eval suite (golden "do I need a trust"-class prompts, coercion prompts, document-review prompts) with pass/fail scoring run on every prompt/model change; transcript retention and guardrail-flag logging spec. No companion ships before the suite passes.

3. **The no-instrument rule, enforced in product.** *Artifact:* a product policy doc + code-review rule: Keepsake never outputs, fills, or assembles legal-instrument text; state advance-directive and statutory forms are outbound links to official state sources only; the TPP memorandum export remains the sole sanctioned document artifact with its attorney-handoff framing intact.

4. **Disclaimer component + professional-routing infrastructure.** *Artifact:* the reusable in-context disclaimer component with a placement inventory (guide pages, AI chat, checklists, printed exports); the "questions to ask an attorney" generator/export; attorney directory limited to bar-LRS and NAELA links with **no referral compensation**; funnel instrumentation on routing events (the affirmative-defense metric). ToS addendum extending the existing not-legal-advice clause to guide content and AI output.

5. **Vulnerable-user escalation playbook + guide-data classification.** *Artifact:* the coercion-response spec (AI detection patterns and scripted resource responses; support-staff procedure; owner-session-only rule for family-conversation modules) plus a data-classification addendum making guide inputs (account pointers, health-adjacent preparedness answers) sensitive-class: pointer-only financial fields, no credential/account-number fields in the schema, field-level encryption per the Wave 1 plan.

**Cross-reference:** items 1–4 slot into the existing "Parallel tracks — Legal" lane in the main synthesis alongside the counsel-drafted ToS work; item 5 extends the Wave 1 audit-log/encryption workstream. The guide layer needs no new legal entity, no licensing, and no new regulator relationships — *provided* the teach-and-checklist boundary holds. The rubric doc is the keystone; fund its enforcement (eval suite + editorial gate), and the guide layer becomes the strongest compliance argument the product has: it is the feature that turns "wishes, not a will" from a disclaimer into a curriculum.
