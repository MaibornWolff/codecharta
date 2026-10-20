---
title: "Desktop app"
description: "Run the CodeCharta Web Studio as a desktop app on Windows, macOS or Linux, from a GitHub release download or the npm package."
---

The Web Studio is also available as a desktop app, built with Electron. It is the same application as the one at
codecharta.com and works offline. To create maps you still need the
[CodeCharta Shell](/docs/overview/getting-started/npm).

## Download a release

Every visualization release on [GitHub](https://github.com/MaibornWolff/codecharta/releases) (tags starting with
`vis-`) lists one zip file per platform under **Assets**:

| Platform | x64 | arm64 |
| --- | --- | --- |
| Windows | `codecharta-visualization-win32-x64.zip` | `codecharta-visualization-win32-arm64.zip` |
| macOS | `codecharta-visualization-darwin-x64.zip` | `codecharta-visualization-darwin-arm64.zip` |
| Linux | `codecharta-visualization-linux-x64.zip` | `codecharta-visualization-linux-arm64.zip` |

Download the file for your system, extract it and start the app:

- **Windows**: run `codecharta-visualization.exe`.
- **macOS**: open `codecharta-visualization.app`.
- **Linux**: run `./codecharta-visualization`.

:::note[macOS]
The app is not signed, so macOS may refuse to open it or call it damaged. Remove the download flag and open it again:

```bash
xattr -cr codecharta-visualization.app/
```
:::

The release also contains `web.zip`, the Web Studio as static files you can serve from any web server.

## Install with npm

The desktop app is also published on npm as `codecharta-visualization`:

```bash
npm i -g codecharta-visualization
codecharta-visualization
```

## Open a map

Load a `.cc.json` or `.cc.json.gz` file with the folder button (**Load cc.json files**) in the top bar. See
[Loading maps](/docs/visualization/user-controls/loading-maps).
