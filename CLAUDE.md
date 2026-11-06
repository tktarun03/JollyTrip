# Working on JollyTrip (guide for Claude and other AI assistants)

JollyTrip is a family holiday planner and budget. It is one static page on GitHub Pages, with no server and no framework. Everything a family saves stays in their own browser.

## Read this first, and read less

The source is about 400 KB. Reading all of it costs roughly 100k tokens, and a task almost never needs it. Work in this order:

1. **`ROADMAP.md`**: is the task already planned, and what was decided?
2. **`docs/CODEMAP.md`**: every function, constant, button action and sheet, with file and line number. About 4k tokens.
3. **Read only the lines you need**, for example `sed -n 120,160p src/c-views.js`. Many lines are 200 to 400 characters long, so a 40-line range is plenty.
4. **`docs/ARCHITECTURE.md`**: only when you change data, storage, rendering or the lock.

Don't:
- Read whole `src/*.js` files, `index.html` (it's built), or `src/lib-*.js` (third-party).
- Take screenshots unless the change is visual. Then take one at 390 × 844.
- Run the full test suite after every small edit. Run the one relevant test, then the full suite once before committing.

## Commands

| Task | Command |
|---|---|
| Build | `python3 build.py`, which writes `index.html`, `docs/CODEMAP.md` and `CHANGELOG.md` |
| Preview artifact | `python3 build.py --preview /path/to/jollytrip.html` |
| All tests (about 1 minute) | `npm test` |
| One test | `node --test --test-name-pattern="calendar" tests/e2e.js` |
| Local server | `python3 -m http.server 8771`, then open `http://localhost:8771/index.html` |

In the Claude cloud workspace, Playwright is already installed globally. Run tests with `NODE_PATH=/opt/npm-tools/node_modules node --test tests/e2e.js`, and don't run `playwright install`.

## Rules

- **Edit `src/`, never `index.html`.** Rebuild, then commit `index.html`, `docs/CODEMAP.md` and `CHANGELOG.md` together with the source change. CI fails if they don't match `src/`.
- **Language:** plain ES5-style JavaScript (`var`, `function`), inside one IIFE. No modules, no build tools beyond `build.py`, and no npm packages in the app. A new library must be pinned to an exact version and either inlined in `src/lib-*.js` or loaded from jsDelivr only when it's first needed (like the OCR libraries).
- **Data changes are backwards compatible.** Old saved data must still load. Add defaults for new fields in `migrateTrip()` or `migrate()` in `b-data.js`, and never rename or remove a stored field without migrating it.
- **Every user action that changes data** calls `save()`. Destructive actions call `checkpoint(label, true)` first and show `toast(..., UNDO)`.
- **User-facing text:** short, plain, sentence case, and curly quotes (’ “ ”). No "Oops" or exclamation marks. Errors say what to do next.
- **Release:** follow `docs/RELEASE.md`. Bump `APP_VERSION`, add a `CHANGELOG` entry in `src/b-data.js`, build, test and push.

## How the code fits together (one-minute version)

- **State:** one object `S` (`b-data.js`). `S.p` is the signed-in profile (accounts → trips). `trip()` returns the active trip.
- **Rendering:** strings of HTML. `renderView()` draws the current tab, `renderSheet()` the open bottom sheet, and `renderAll()` both. There's no virtual DOM, so re-render after changing `S`.
- **Buttons:** `data-act="name"` on any element calls `ACT.name(el, event)`. Files add handlers with `Object.assign(ACT, {...})`.
- **Sheets:** `openSheet({ type: 'x', d: {...draft} })` renders `SHEETS.x(sh)`. Each sheet starts with `sheetHead(title)`, which keeps the header fixed while the body scrolls. Form fields use `data-f="path"` to write into `S.sheet.d`.
- **Storage:** `Store` (cookies plus `localStorage`) holds JSON. `Photos` (IndexedDB) holds images, PDFs and passes. `Versions` (IndexedDB) holds history snapshots.

## Adding a feature (the usual recipe)

1. Find similar code in `docs/CODEMAP.md` and copy its pattern.
2. New stored fields: add a default in `migrateTrip()`.
3. UI: a view in `c-views.js`, a sheet in `d-sheets.js`, or a new `src/<letter>-<name>.js` file for a self-contained feature. Add a new file to `JS` in `build.py`, before `z-start.js`.
4. Add actions via `Object.assign(ACT, {...})`.
5. Add a test to `tests/e2e.js` that covers the main path, then build, test and commit.
