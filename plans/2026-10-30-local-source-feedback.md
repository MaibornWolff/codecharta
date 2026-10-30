---
name: Local source feedback round
state: complete
version: 1
---

## Goal

Fix three points from trying the local source feature: saved folders outlive their deleted project, the map
selector shows only one of folder and VS Code path, and "Open in VS Code" reads oddly and leaves a blank tab.

## Tasks

### 1. Forget folders with their project
- Removing a map in the map selector deletes its saved folder and VS Code path; "Reset map to default" deletes all

### 2. Show both in the map selector
- One line for the folder chosen with the picker, one for the VS Code path

### 3. Open in VS Code
- Clearer dialog text, separate for a missing and a known path; an example for macOS, Linux and Windows
- Hand the link over with a link click: `window.open` leaves a blank tab behind

### 4. Independent folders
- The map row's menu offers "Set Local Folder…" and "Set VS Code Folder…"; "Forget Local Folder" is gone, as
  removing the map clears both
- The picker's folder and the VS Code path are saved independently: Open in VS Code needs no picker and no longer
  checks that the file exists; choosing another local folder keeps the path

### 5. Explain before the picker
- Show Source without a usable folder first explains in a small dialog why a folder is needed; its button opens the
  picker and then the file. Set Local Folder… asks for the picker itself and goes there directly

## Steps

- [x] Complete Task 1: Forget folders with their project
- [x] Complete Task 2: Show both in the map selector
- [x] Complete Task 3: Open in VS Code
- [x] Complete Task 4: Independent folders
- [x] Complete Task 5: Explain before the picker

## Notes

- Browsers have no call to revoke a folder permission. Dropping the handle ends CodeCharta's access; a Chrome
  "allow on every visit" entry stays listed in the site settings until the user removes it there
- The blank tab only showed with the real `window.open`, which every test had stubbed; a real-browser run confirms
  it is gone. The desktop app's handling of the link click is untested
