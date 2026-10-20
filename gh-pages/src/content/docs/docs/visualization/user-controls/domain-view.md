---
title: "The word cloud"
description: "See the domain language of your code as a word cloud in the CodeCharta Domain view, and find out what a folder or file is about at a glance."
---

The **Domain** view shows the vocabulary of your code as a word cloud: the words that appear in identifiers, comments and strings, sized by how much they matter. It answers a different question than the code map: not how big or complex the code is, but what it is about.

![The Domain view with a word cloud of CodeCharta's own code](/assets/images/docs/visualization/user-controls/domain-view.jpeg)

## Opening the view

The **Domain** tab appears in the top bar when the loaded map carries domain data. Create it with the [Domain Language parser](/docs/parser/domain-language) (`ccsh domainlanguageparser`), which [`ccsh analyse`](/docs/analysis/analyse) runs for you.

## Working with the cloud

The cloud shows the words of whatever is selected in the Explorer: the whole project at first, a single folder or file once you pick one. The bottom bar names the current selection.

- **Hover** a word to see its frequency and its TF-IDF value.
- **Click** a word to open it: it is marked in the cloud and pinned in the Explorer, with a breakdown of where it occurs.
- **Click the empty cloud** to let go of the opened word.
- **Right-click** a word for its menu: copy the word, **Search word** (puts it into the Explorer's word search) and **Hide word** (drops it from the cloud and the word list).
- **Mouse wheel** magnifies the cloud and **dragging** moves it. **Show whole cloud** in the [tools tab](/docs/visualization/user-controls/map-tools) brings the whole cloud back; **Screenshot** takes a picture of it.

The [word list](/docs/visualization/user-controls/domain-words) shows where a word lives in the file tree, and the
[domain bar](/docs/visualization/user-controls/domain-bar) shapes the cloud.
