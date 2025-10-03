# BROS

BROS (Block ROS) is an Electron desktop environment for building, simulating, and introspecting ROS 2 graphs with a drag-and-drop block interface. It streamlines going from idea to runnable robot behavior by generating ROS packages, launch files, and providing live insight into running nodes.

## Why BROS?
- Visual composition of ROS 2 nodes, topics, and services without leaving the editor.
- Automatic generation of package scaffolding and launch files from the block graph.
- Integrated simulation hooks (Gazebo, Isaac) and telemetry panels for rapid iteration.
- Cross-platform desktop app distributed via Electron so teams share a single workflow.

## Quick Start

### 1. Bootstrap the workspace

The bootstrap script installs the required toolchain (nvm, Node 20.19.0, pnpm 10.17.1) and pulls all workspace dependencies.

```bash
git clone https://github.com/nhathout/BROS.git
cd BROS/apps/desktop-app/
./scripts/bootstrap.sh
```

The script will:
- Install or load nvm and pin it to Node `20.19.0`.
- Install pnpm `10.17.1` via corepack (or npm fallback).
- Run `pnpm install -r` to hydrate every workspace package.
- Optionally add an auto-`nvm use` snippet to your `~/.zshrc` so new shells pick up the correct Node version.

If prompted, reload your shell (e.g. `source ~/.zshrc`) so `pnpm` is available on the `PATH`.

### 2. Run the desktop app in development

Build the runner package once (generates the JS consumed by Electron):

```bash
pnpm --filter @bros/runner build
```

Compile the Electron main process once (or use the watch script for live rebuilds):

```bash
pnpm --filter ./apps/desktop-app build:main      # one-off compile
# or
pnpm --filter ./apps/desktop-app build:main:watch  # keep dist/main.js up to date
```

Then start the renderer and Electron in separate terminals:

```bash
# Vite dev server for the renderer
pnpm --filter ./apps/desktop-app dev
```

Hot reload works for renderer assets. If you are not running `build:main:watch`, re-run `pnpm --filter ./apps/desktop-app build:main` whenever you touch `src/main.ts` (and then restart `electron:dev`).

### 3. ROS runner test (DevTools)

Make sure Docker Desktop (or your Docker engine) is running and the CLI is on your `PATH`. From a terminal run `which docker` and `docker ps`—both must succeed before proceeding. On macOS you can install the CLI from Docker Desktop → Settings → General → Configure Shell Completions → Install Automatically.

With the Electron window focused, open the renderer DevTools console (`View → Toggle Developer Tools`) and execute:

```js
await window.runner.up("hello_ros");
await window.runner.exec("ros2 --help");
await window.runner.exec("ros2 pkg list | head -n 5");
await window.runner.down();
```

You should see Docker bring up a container named `bros_hello_ros`, and new files appear under `~/BROS/Projects/hello_ros/` (`workspace/` plus `docker-compose.yml`). Re-running `up()` is safe—compose and image pulls are idempotent. 

### 4. Build the workspace

To compile every workspace package (runner first, then the desktop app) and make distributables:

```bash
pnpm -r build
```

- `@bros/runner` outputs ESM bundles to `packages/services/runner/dist/`.
- Electron Builder places macOS artifacts in `apps/desktop-app/release/` (zip + dmg). 

For a quicker cycle:

```bash
pnpm --filter @bros/runner build # runner only
pnpm --filter ./apps/desktop-app build:main # main process → dist/main.js
```

If you only need the packaged app, run `pnpm -r build` and then launch it with `open apps/desktop-app/release/mac-arm64/BROS\ Desktop.app`.

## Additional Notes
- The runner package relies on Docker and Docker Compose (CLI). Ensure Docker Desktop (or equivalent) is running and `docker ps` works (the CLI must be installed via Docker Desktop → Settings → Resources → CLI → “Install CLI tools”).
- Use `pnpm -r clean` to clear compiled output across packages; this now removes the desktop app's `dist/` and `release/` folders as well. After cleaning, rebuild the runner (`pnpm --filter @bros/runner build`) before launching or packaging the Electron app.
- The bootstrap script is idempotent—rerun it after toolchain updates to keep developers in sync.
