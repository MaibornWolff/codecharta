# Angular template grammar

[tree-sitter-angular](https://github.com/dlvandenberg/tree-sitter-angular) 0.9.2 by Dennis van den Berg (MIT, see
`LICENSE`). It extends [tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html) 0.23.2 by Max Brunsfeld and
Amaan Qureshi (MIT, see `html/LICENSE`), whose `grammar.js` is vendored in `html/` so the grammar generates without npm.
The only change to the upstream sources is that `grammar.js` requires `./html/grammar` instead of the npm package.

## Develop

Requires the tree-sitter CLI 0.26.3 (the version of the tree-sitter core CodeCharta loads, ABI 15) and a C compiler.

```bash
cd analysis/treeSitterExcavationSite/grammars/angular
tree-sitter generate          # writes src/parser.c, src/grammar.json, src/node-types.json
tree-sitter test              # runs test/corpus
tree-sitter parse some.html   # prints the tree
```

`src/` is generated except `src/scanner.c` and `src/tag.h`, which come from upstream; commit it together with
`grammar.js`.

## Rebuild the jar

`treeSitterExcavationSite/libs/tree-sitter-angular-<version>.jar` carries the native library for Linux and macOS on
x86_64 and aarch64 and for Windows on x86_64, built with the `gen` and `buildNative` tasks of
[tree-sitter-ng](https://github.com/bonede/tree-sitter-ng), which cross-compile with Zig. The library exports
`tree_sitter_angular`. tree-sitter-ng's Gradle 8.7 needs a JDK 17 or 21. The last build used tree-sitter-ng at commit
`52f2d14` with Zig 0.11.0.

```bash
# 1. The grammar as the source archive tree-sitter-ng downloads, with one top folder and an entry per folder
cd analysis/treeSitterExcavationSite/grammars
VERSION=0.9.2
rm -rf /tmp/angular && mkdir -p /tmp/angular
cp -r angular /tmp/angular/tree-sitter-angular-$VERSION
(cd /tmp/angular && zip -qr tree-sitter-angular-$VERSION.zip tree-sitter-angular-$VERSION)

# 2. A subproject for the grammar, then the native libraries, then the jar (two runs: the jar task does not
#    depend on buildNative)
git clone https://github.com/bonede/tree-sitter-ng.git && cd tree-sitter-ng
./gradlew gen --parser-name=angular --parser-version=$VERSION \
    --parser-zip=file:///tmp/angular/tree-sitter-angular-$VERSION.zip
./gradlew :tree-sitter-angular:buildNative \
    -PtreeSitterTargets=x86_64-windows,x86_64-macos,x86_64-linux-gnu,aarch64-linux-gnu,aarch64-macos
./gradlew :tree-sitter-angular:jar

# 3. Into CodeCharta; change the version in the file name and in treeSitterExcavationSite/build.gradle.kts together
cp tree-sitter-angular/build/libs/tree-sitter-angular-$VERSION.jar <codecharta>/analysis/treeSitterExcavationSite/libs/
```

Where tree-sitter-ng can not reach the Zig mirrors, download `zig-<os>-<arch>-0.11.0` from ziglang.org into
`tree-sitter-ng/build/zig/`, check it with the `.minisig` and add `-x downloadZig` to the `buildNative` run.
`GrammarLoadingTest` loads the bundled library and fails when its ABI does not fit the tree-sitter core.
