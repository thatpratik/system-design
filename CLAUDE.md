# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a learning repository for system design concepts. It is currently in early/empty state.

## Project Setup

The `.gitignore` is pre-configured for **Angular** projects (dist, out-tsc, .angular cache, node_modules, TypeScript build info). If Angular projects are added, standard Angular CLI commands apply:

```bash
npm install          # install dependencies
ng serve             # dev server at localhost:4200
ng build             # production build to /dist
ng test              # run unit tests (Karma)
ng lint              # lint with ESLint
ng test --include='**/foo.spec.ts'  # run a single test file
```
