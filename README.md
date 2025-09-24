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

```bash
cd apps/desktop-app
pnpm dev
```

This runs Vite for the renderer and launches Electron in development mode. Hot-reload is enabled for renderer assets.

### 3. Build a packaged app

```bash
cd apps/desktop-app
pnpm build
```

Electron Builder creates distributables inside `apps/desktop-app/release/` (CI targets Linux by default). The TypeScript main process output lives in `apps/desktop-app/dist/`.

## Additional Notes
- Docker or other ROS runtimes are optional unless you plan to run simulations locally.
- Use `pnpm clean` at the repo root to clear build artifacts across packages.
- The bootstrap script is idempotent—rerun it after toolchain updates to keep developers in sync.
