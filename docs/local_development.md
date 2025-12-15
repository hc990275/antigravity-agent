# Development Guide (Antigravity Agent)

## Prerequisites

- Node.js >= 20: https://nodejs.org/en/download
- Rust: https://rust-lang.org/
- Tauri build prerequisites
  - Windows: Visual Studio Build Tools (Desktop development with C++), WebView2 Runtime
  - macOS: Xcode Command Line Tools
  - Linux: Follow Tauri docs to install dependencies such as `webkit2gtk`

## Install dependencies

```bash
npm install
```

## Run in development

```bash
npm run tauri:dev
```

## Build / Package

- Desktop bundle:

```bash
npm run tauri:build
```

