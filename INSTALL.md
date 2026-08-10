# Ruler Extension Installation

This project is a Chrome/Chromium Manifest V3 browser extension.

## Prerequisites

- Node.js 18+
- npm
- Google Chrome or Chromium with extension developer mode enabled

## Install dependencies

```bash
npm install
```

## Build the extension

```bash
npm run build
```

## Load the extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the project root folder that contains `manifest.json` and the generated `dist/` contents.

## Local development

```bash
npm run dev
```

The development flow expects the extension assets to be emitted into the distribution folder used by the manifest.
