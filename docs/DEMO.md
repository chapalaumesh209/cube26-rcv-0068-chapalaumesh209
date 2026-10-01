# DockProof demo runbook

Target length: 3–4 minutes. Record at 1440 × 900 or larger with browser zoom at 100%, and keep the address bar visible briefly so the running project is identifiable. Use the seeded demo database and `VLM_MODE=mock` for a repeatable walkthrough. Call the observations offline fixtures on screen; do not imply they were inferred from the shown photographs.

| Time | Show | Narration point |
| --- | --- | --- |
| 0:00–0:25 | Login and four workspaces | DockProof records condition at receipt; each role sees the work it is allowed to do. |
| 0:25–1:05 | Receiving ledger and verdict filters | A unit has a PO, supplier, verdict, and evidence status. Demonstrate one PASS, one EXCEPTION, and one UNCERTAIN. |
| 1:05–1:50 | Open an exception inspection | Compare expected PO fields with observed results. Open a “Why?” detail; show that one failed gate controls the overall result. |
| 1:50–2:25 | Open an uncertain inspection | Explain that unreadable or occluded evidence routes to review rather than being accepted. |
| 2:25–2:55 | Reviewer queue and override form | Show the mandatory reason and state that the override is recorded in an audit row. For a clean repeatable recording, do not submit the override unless you intend to change the local demo data. |
| 2:55–3:20 | Evidence vault and `rcv.v1` JSON | Show the schema version, check details, and SHA-256 content hash. |
| 3:20–3:45 | Quality lab | State that the numbers are from the 50-case fixture report, and that live field accuracy is not asserted by it. |

Before sharing the recording:

1. Watch the exported video from start to finish; verify text is readable and no private keys or local files appear.
2. Upload it to a judge-accessible location, set the required visibility, and open the link in a signed-out browser session.
3. Add the verified URL to the README submission table and your final submission form.

The public demo is available at [cube26-rcv-0068-chapalaumesh209.vercel.app](https://cube26-rcv-0068-chapalaumesh209.vercel.app). Its seeded SQLite snapshot is copied to ephemeral `/tmp` on each Vercel cold start, so changes can reset. A production deployment must use durable storage and a unique `AUTH_SECRET`; the seeded credentials are demo-only.
