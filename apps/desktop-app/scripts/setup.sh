#!/usr/bin/env bash
set -e
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm install

