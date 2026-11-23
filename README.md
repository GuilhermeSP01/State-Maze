# State Maze

Foundation for a web and mobile game built with Vite, React, TypeScript, and Capacitor.

## Development

Requirements: Node.js 22.12+ (recommended: Node.js 24 LTS) and npm.
Run commands from the repository root:

```sh
npm install
npm run dev
```

The terminal displays the local address. To check types, build, and preview the web app:

```sh
npm run typecheck
npm run build
npm run preview
```

## Structure

- `apps/game`: React app with Vite and Capacitor configuration.
- `packages/stages`: shared world and stage contracts, TypeScript types, and initial maps.
- `packages/game-core`: framework-independent game state, movement rules, and unit tests.
- `tools`: future development tools.
- `docs`: project documentation.

## Stages

The `@state-maze/stages` package defines the format shared by the game, the future stage editor, and the stage analyzer:

- `packages/stages/stage.schema.json`: JSON Schema contract, draft 2020-12.
- `packages/stages/world.schema.json`: world contract with UUID identity and localized titles.
- `packages/stages/src/types.ts`: `Tile`, `Position`, `LocalizedTitle`, `WorldDefinition`, and `StageDefinition` types.
- `packages/stages/worlds/<world-uuid>.json`: world identity and titles.
- `packages/stages/maps/<stage-uuid>.json`: initial state of each stage.

Each stage contains `schemaVersion`, `id` (UUID), `worldId` (UUID), `number`, `map`, and `playerStart`. Stage schema version 2 replaces the numeric ID from version 1. A stage number is a positive integer local to its world; `(worldId, number)` is unique. IDs remain stable when titles, numbers, or world membership change. The map uses `0` for a floor tile in state 0, `1` for a floor tile in state 1, and `2` for a wall. Coordinates are zero-based: `row` identifies the row and `column` identifies the column, accessed as `map[row][column]`. New codes will be defined when special tiles are introduced.

The initial definition is read-only in the TypeScript types. Each new attempt copies every map row to keep in-memory changes separate from the original map.

The starting tile does not toggle when the player leaves it. Each floor tile the player enters toggles between 0 and 1, and victory is checked at the end of a move. Stage 1 contains the corridor `1 0 0`, surrounded by walls, with the player on the first floor tile; sliding right completes the stage.

The schema serves as a contract. The stage editor will be responsible for producing valid maps; there is no additional validation during loading or in CI. The game page creates an independent in-memory attempt from the stage definition.

World and map filenames match their UUIDs. A stage explicitly references its world through `worldId`; folders do not determine membership. World titles are keyed by language code, with a required English title as fallback. The editor or future persistence layer is responsible for world references and unique stage numbers; the game adds no validation layer.

The main menu groups stages by their explicit `worldId` and sorts each group by `number`. World titles use the active language, then its base language, then English. Stage links use `#/stage/<stage-uuid>`; display numbers and world titles can change without changing those links.

Stage loading lives in `apps/game/src/stages/loadStage.ts`; world loading and catalog queries live in `apps/game/src/worlds/`. Both loaders accept UUIDs. The local catalog reads the bundled JSON definitions to obtain world membership and stage numbers. These data entry points can later be replaced with API calls.

## Gameplay

Use the arrow keys or swipe the board to slide until a wall or map boundary. Each entered floor toggles between 0 and 1; the starting floor stays unchanged. Completion is checked only after a slide ends, ignoring walls. New moves are disabled after completion or while the stage menu is open. Use **Restart** in that menu to restore the initial map and player position.

Keyboard auto-repeat is ignored. Swipes use Pointer Events (touch, pen, and mouse), require at least 24 CSS pixels, and follow the dominant axis; taps, canceled gestures, and equal-axis diagonals do not move the player. Browser touch scrolling is disabled only on the active board. Movement is animated at 110 milliseconds per entered tile. The player travels continuously, and each floor toggles on arrival. Commands during a slide are ignored, and completion is displayed only after the animation ends. Restarting or leaving the stage cancels the current animation. The system reduced-motion preference uses the immediate final state instead. Move counters, saved progress, and automatic stage advancement are not included.

Run the game rule tests with `npm test`. The core exposes `planMove()` with the final state and ordered path; the React animation presents that path without changing the rules. The `@state-maze/game-core` package has no React or browser dependencies and can also be used by a future stage analyzer.

## Localization

The app uses `i18next` and `react-i18next` with bundled JSON translations in `apps/game/src/i18n/locales/`. English (`en`) is the source and fallback language; Brazilian Portuguese (`pt-BR`) is also available.

The main menu includes a language selector. The saved preference (`state-maze.language` in local storage) takes precedence over the browser language. Portuguese browser variants use the Brazilian Portuguese translation; unsupported languages fall back to English. The HTML `lang` attribute follows the active language.

Use `useTranslation()` for visible text and accessibility labels. Translation keys are typed from `en.json`. Keep code, routes, developer errors, and documentation in English; translated text belongs in locale files. Stage maps are independent of the selected language. No translation server or external service is required.

## GitHub Pages and PR previews

The deployment workflows store the compiled site on `gh-pages`. The root contains the `main` build; `pr-preview/pr-<number>/` contains each open pull request preview. Main deployments preserve `pr-preview/`, and deployment actions use non-force pushes to retain other updates.

- `.github/workflows/deploy-pages.yml`: tests and publishes `main` on push or manual dispatch.
- `.github/workflows/preview-pages.yml`: tests and publishes same-repository PRs targeting `main` on open, reopen, and new commits. Closing or merging a PR removes its preview without rebuilding.

The preview URL is `https://guilhermesp01.github.io/State-Maze/pr-preview/pr-<number>/`. Each run includes the link in its Actions summary. Preview updates and removals become visible after GitHub Pages finishes publishing. The GitHub Actions bot maintains a single PR comment with the preview link, updates it after new deployments, and marks the preview as removed when the PR closes. The link is also available in the Actions summary.

### One-time activation

1. Merge these workflows into `main` and run **Deploy main site to GitHub Pages** from `main`. It creates `gh-pages` with the main site and `.nojekyll`.
2. In **Settings > Pages**, change **Source** from **GitHub Actions** to **Deploy from a branch**, select **gh-pages** and **/(root)**, and save. This switch is required by the PR preview action; do not keep the previous artifact deployment workflow running alongside it.
3. Open a PR targeting `main`, or push a commit to an existing PR, to generate its preview. Both the deployment branch and published preview should appear in the Actions run results.

The workflow grants repository write access only to deployment jobs, with PR comment permission for preview deployments; builds use a read-only token. No personal access token is required under repository policies that permit the declared workflow permissions. Fork PRs are excluded from publication. Closing a PR removes its published files; older versions can remain in the `gh-pages` Git history. Build artifacts expire after one day.

## Mobile

Capacitor uses `apps/game/dist` as the web output directory and `com.statemaze.game` as the initial app identifier. Review the identifier before publishing.
Android and iOS dependencies are installed. Native projects are generated on demand.

Android (requires Android Studio and a configured SDK):

```sh
npm run android:add
npm run cap:sync
npm run android:open
```

iOS (requires macOS, Xcode, and a configured native environment):

```sh
npm run ios:add
npm run cap:sync
npm run ios:open
```

Run `android:add` and `ios:add` only once per platform. After changing the game, use `npm run cap:sync` to build and update existing native projects. APK/AAB and iOS app builds are produced using the native tools.

References: [Vite](https://vite.dev/guide/) and [Capacitor](https://capacitorjs.com/docs/getting-started).
