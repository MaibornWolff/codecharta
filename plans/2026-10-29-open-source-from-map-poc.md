---
name: Open source from the map (PoC)
state: complete
version: 1
---

## Goal

Proof of concept: right-click a file on the map and either show its source inside CodeCharta or open it in
VS Code, without uploading anything. The local project folder is chosen once via the browser's folder picker
(File System Access API, Chromium/Electron only) and remembered per map.

## Tasks

### 1. Local source folder per map
- Folder picker (`showDirectoryPicker`) gives a handle; saved in a separate IndexedDB database, keyed by the
  map file name
- Before reading: check/request read permission on the handle (Chrome asks again per visit)
- Resolve a node path (`/root/src/Foo.kt`) to a file handle; not found → offer the picker again
- Folder is saved per map file: with several maps visible, paths carry the map file as first segment
  (`/root/sample1.cc.json/src/Foo.kt`), so each map gets its own folder
- Check after picking that the folder fits the map (a few file paths exist), warn otherwise

### 2. Absolute path for the editor
- The picker does not reveal the absolute path: ask once in a small dialog, prefilled with the folder name
  as a hint, save it next to the handle

### 3. Context menu entries (files only)
- "Show source": opens a modal dialog with the file as plain monospaced text and line numbers
- "Open in VS Code": `vscode://file/<absolute root>/<relative path>`
- No folder yet or file missing → picker first, then continue with the action
- Hidden in browsers without `showDirectoryPicker` (Firefox, Safari)
- "Set local folder…" on the map's root (`/root`, or `/root/<map file>` with several maps visible)

### 4. Local folder in the map selector
- Each map row shows its folder: the full path once entered for VS Code, else the folder name, else
  "No local folder"
- Right-click a row: "Set Local Folder…" and, when one is set, "Forget Local Folder"
- Choosing a different folder drops the old full path (compared with `isSameEntry`), so no stale path shows
- The menu is rendered outside the dropdown: the dropdown's transform would shift a fixed menu

### 5. Try it out
- Run the app, load a map of a local project, test both actions, the missing-file and wrong-folder cases

## Steps

- [x] Complete Task 1: Local source folder per map
- [x] Complete Task 2: Absolute path for the editor
- [x] Complete Task 3: Context menu entries
- [x] Complete Task 4: Local folder in the map selector
- [x] Complete Task 5: Try it out (Playwright smoke in the sandbox; reload persistence still to try in real Chrome)

## Notes

- Decisions: web asks the absolute path once; VS Code only; modal dialog; no syntax highlighting, no new
  dependencies
- PoC scope: no Electron-specific code (Electron is Chromium, so the same API works there); hash check for
  "file changed since the analysis" is left for later
- A `vscode://` link gives no feedback: if the editor path is wrong, only VS Code notices
- Delta view: the first visible map's folder is used
- Smoke test (Playwright, OPFS folder as picker stand-in): show source, editor dialog + `vscode://` link,
  missing file, wrong folder, set folder, menu entries all work. Reading a folder handle back from IndexedDB
  crashes the sandbox's Chromium even in plain JS without CodeCharta, so "remembered after reload" is untested
- Open in VS Code opens directly only while the click is still fresh (`navigator.userActivation`); after a
  picker or permission prompt the editor dialog's Open button supplies the click
