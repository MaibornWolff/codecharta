---
permalink: /docs/overview/data-privacy
title: "Data Privacy"
---

## Your Data Stays on Your Machine

CodeCharta is designed with privacy as a core principle. **All analysis and visualization happens entirely on your machine.** No data is ever uploaded, shared, or transmitted to any external service without your explicit intent.

### What This Means

- **Analysis (ccsh)**: When you run the CodeCharta Shell to analyze your code, all processing happens locally. Your source code, git history, and metrics never leave your computer.

- **Visualization (Web Studio)**: The web-based visualization runs entirely in your browser using client-side JavaScript. Even when you use the online version at [codecharta.com](https://codecharta.com), your `.cc.json` files are processed locally in your browser and never uploaded to any server.

- **No Tracking**: CodeCharta does not include any analytics, telemetry, or usage tracking. We don't collect any data about how you use the tool or what code you analyze. Note that when you visit our documentation or GitHub repository, GitHub's standard analytics may apply, but that is managed by GitHub, not by us.

### Running Completely Offline

Both the CodeCharta Shell and Web Studio can run completely offline:

- **Analysis**: Install via `npm i -g codecharta-analysis` and use anywhere without an internet connection
- **Visualization**: Install via `npm i -g codecharta-visualization` and use anywhere without an internet connection

### Data You Choose to Share

The only times data might leave your machine are when **you explicitly choose** to. Examples include:

- Share exported `.cc.json` files with colleagues
- Upload maps to your own hosting for team access
- Use the "Share URL" feature to send configurations (only settings are shared, not data)
- Commit analysis results to version control

### Open Source Transparency

CodeCharta is fully open source on [GitHub](https://github.com/MaibornWolff/codecharta). You can inspect the code yourself to verify these privacy guarantees, or run your own local instance with full control.
