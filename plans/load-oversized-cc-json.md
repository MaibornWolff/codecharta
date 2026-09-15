---
name: Load cc.json files larger than the browser's string limit
issue: -
state: complete
version: -
---

## Goal

A cc.json that inflates beyond V8's maximum string length (~537 MB, e.g. netbeans.cc.json.gz at 830 MB)
loads instead of failing with "File is empty or invalid". Every source is loaded and checked one way,
without serializing content into strings.

## Tasks

### 1. Parse JSON from bytes in pieces
- Pure util that parses a UTF-8 byte array; a value too large for one string is split into its
  members at the byte level and each member parsed on its own

### 2. Compare restored settings without serializing them
- `loadInitialFile.store` compares slices with `dequal` instead of `safe-stable-stringify`

### 3. Move the gameObjects parser into the file store loaders (structural)
- So the single load function in the file store can convert gameObjects files

### 4. One load path from bytes
- Upload and URL (gzipped or not) hand raw bytes to one function: gunzip by magic bytes, parse in
  pieces, convert gameObjects, unwrap, fill a missing checksum with SHA-256 of the bytes
- URL files report their real byte size instead of a hard-coded one
- Replace stringify equality in `loadFiles.useCase` and scenario import with `dequal`; drop `md5`

### 5. Verify in the real app
- Load netbeans.cc.json.gz and a copy without checksum under Playwright

## Steps

- [x] Complete Task 1: Parse JSON from bytes in pieces
- [x] Complete Task 2: Compare restored settings without serializing them
- [x] Complete Task 3: Move the gameObjects parser
- [x] Complete Task 4: One load path from bytes
- [x] Complete Task 5: Verify in the real app
- [x] CHANGELOG entry

## Notes

- Node: full file parses in 6.8 s with ~1.06 GB heap
- Chromium: upload to rendered map 26 s, JS heap ~3 GB; domain view and reload restore work
- Checksum-less copy (SHA-256 of 830 MB runs): 27 s to map; by URL 26 s
- One early checksum-less upload showed "empty or invalid"; six reruns with error logging passed
- Web Crypto is available on file:// pages in Chromium, so the Electron app can hash
- On plain http (not localhost) there is no Web Crypto: a file without checksum is rejected with its
  own message (verified in Chromium for URL and upload)
- `updateMapColors.effect` still clones map colors through `safe-stable-stringify`
