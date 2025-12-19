---
name: open-in-editor-feature
issue: #N/A
state: complete
version: 1.0
---

## Goal

Add "Open in Editor" feature: a settings popup next to the file panel to configure preferred editor (VS Code/IntelliJ) and local folder path, plus a context menu entry to open files in the selected editor.

## Tasks

### 1. Create ngrx State for Editor Settings
- Add `preferredEditor` state slice in `appSettings/` (string: "vscode" | "intellij")
- Add `localFolderPath` state slice in `appSettings/` (string path)
- Follow existing pattern: actions, reducer, add to combined reducer
- Add selectors in globalSettings selectors

### 2. Create Feature Module in `features/editorSettings/`
- Create stores: `PreferredEditorStore`, `LocalFolderPathStore`
- Create services: `PreferredEditorService`, `LocalFolderPathService`
- Create facade: `EditorSettingsFacade`
- Create selectors file

### 3. Create Editor Settings Dialog Component
- Button component next to file panel in toolbar
- Dialog with dropdown (VS Code / IntelliJ) and text input for folder path
- Use signals pattern with `toSignal()`
- Auto-save on change (dispatch actions)

### 4. Create Context Menu Button
- Add `OpenInEditorButtonComponent` in existing empty directory
- Read settings from facade
- Build URL protocol: `vscode://file/path` or `idea://open?file=path`
- Replace `/root/` prefix with configured local folder path
- If not configured, open settings dialog instead

### 5. Integrate Components
- Add button to toolbar next to file panel
- Add button to context menu card
- Ensure state persists via existing IndexedDB mechanism

## Steps

- [x] Complete Task 1: Create ngrx state slices for preferredEditor and localFolderPath
- [x] Complete Task 2: Create editorSettings feature module with stores, services, facade
- [x] Complete Task 3: Create editor settings button and dialog components
- [x] Complete Task 4: Create context menu open-in-editor button
- [x] Complete Task 5: Integrate all components and test

## Notes

- Browser opens editors via URL protocols: `vscode://file/...`, `idea://open?file=...`
- Empty directories already exist for some components
- State automatically persists via `saveCcStateEffect` to IndexedDB
- Path replacement: `/root/src/file.ts` + folder `/Users/x/proj` → `/Users/x/proj/src/file.ts`
