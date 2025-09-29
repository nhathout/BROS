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
cd BROS
./apps/desktop-app/scripts/bootstrap.sh
```

The script will:
- Install or load nvm and pin it to Node `20.19.0`.
- Install pnpm `10.17.1` via corepack (or npm fallback).
- Run `pnpm install -r` to hydrate every workspace package.
- Optionally add an auto-`nvm use` snippet to your `~/.zshrc` so new shells pick up the correct Node version.

If prompted, reload your shell (e.g. `source ~/.zshrc`) so `pnpm` is available on the `PATH`.

### 2. Run the desktop app in development

From the repository root, launch the app with the workspace-aware script (this keeps dependencies in sync across packages):

```bash
pnpm --filter ./apps/desktop-app dev
```

This starts Vite for the renderer and spawns Electron in development mode with hot reload.

### 3. ROS runner test (DevTools)

With the app running, open the renderer DevTools console (`View → Toggle Developer Tools`) and execute:

```js
await window.runner.up("hello_ros");
await window.runner.exec("ros2 --help");
await window.runner.exec("ros2 pkg list | head -n 5");
await window.runner.down();
```

You should see Docker bring up a container named `bros_hello_ros`, and new files appear under `~/BROS/Projects/hello_ros/` (`workspace/` plus `docker-compose.yml`). Re-running `up()` is idempotent.

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

## Additional Notes
- The runner package relies on Docker and Docker Compose (CLI). Ensure Docker Desktop (or equivalent) is running before calling `window.runner.*` APIs.
- Use `pnpm -r clean` to clear compiled output across packages; this now removes the desktop app's `dist/` and `release/` folders as well.
- The bootstrap script is idempotent—rerun it after toolchain updates to keep developers in sync.