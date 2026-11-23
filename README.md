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
- `packages/stages`: shared contract, TypeScript types, and initial stage maps.
- `tools`: future development tools.
- `docs`: project documentation.

## Stages

The `@state-maze/stages` package defines the format shared by the game, the future stage editor, and the stage analyzer:

- `packages/stages/stage.schema.json`: JSON Schema contract, draft 2020-12.
- `packages/stages/src/types.ts`: `Tile`, `Position`, and `StageDefinition` types.
- `packages/stages/maps/<id>.json`: initial state of each stage.

Each stage contains `schemaVersion`, `id`, `map`, and `playerStart`. The map uses `0` for a floor tile in state 0, `1` for a floor tile in state 1, and `2` for a wall. Coordinates are zero-based: `row` identifies the row and `column` identifies the column, accessed as `map[row][column]`. New codes will be defined when special tiles are introduced.

The initial definition is read-only in the TypeScript types. When gameplay is implemented, each map row must be copied to keep in-memory changes separate from the original map.

The starting tile does not toggle when the player leaves it. Each floor tile the player enters toggles between 0 and 1, and victory is checked at the end of a move. Stage 1 contains the corridor `1 0 0`, surrounded by walls, with the player on the first floor tile; sliding right completes the stage.

The schema serves as a contract. The stage editor will be responsible for producing valid maps; there is no additional validation during loading or in CI. The game page loads and renders the initial state, without movement or tile toggling.

Files in `maps/` use numeric names matching their `id` (for example, `1.json`). The menu automatically lists available maps. Data loading is centralized in `apps/game/src/stages/loadStage.ts`, allowing it to be replaced with an API later.

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
