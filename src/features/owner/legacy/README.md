# owner/legacy

Real implementations of owner pages that are **feature-flagged off** and not yet visible in the product.

These files are **not archived** — they contain working code and will be restored to the active owner nav in a future phase. They are hidden because the relevant backend data connections or business rules are not yet in place for pre-seed.

## Files

| File | Flag | Planned nav section |
|---|---|---|
| `CommandCenter.jsx` | `ownerCommandCenter` | Command Home (replaces OperationalPulse when wired) |
| `BudgetApprovals.jsx` | `ownerBudgetApprovals` | Approvals |
| `OwnerOperationalRequests.jsx` | `ownerOperationalRequests` | Approvals |
| `OwnerReport.jsx` | `ownerReport` | Reports |
| `BusinessMemoryPage.jsx` | `ownerBusinessMemory` | Memory |

## How to restore a page

1. Set its flag to `true` in `src/config/featureFlags.js`.
2. Add its route key to `NAV_GROUPS.command.pages` in `src/config/navigationConfig.js`.
3. Verify it receives all required props from `PageRenderer` in `src/App.jsx`.

## What is NOT here

Pages that are **under active development** (not yet implemented) live in `../wip/`.
Pages that are **superseded / dead code** live in `../_archived/`.
