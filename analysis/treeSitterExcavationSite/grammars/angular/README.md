# Angular template grammar

[tree-sitter-angular](https://github.com/dlvandenberg/tree-sitter-angular) 0.9.2 by Dennis van den Berg (MIT, see
`LICENSE`). It extends [tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html) 0.23.2 by Max Brunsfeld and
Amaan Qureshi (MIT, see `html/LICENSE`), whose `grammar.js` is vendored in `html/` so the grammar generates without npm.
`grammar.js` requires `./html/grammar` instead of the npm package and carries the patches CodeCharta needs, each
marked with a `CodeCharta:` comment and covered by `test/corpus/codecharta.txt`:

| Patch                                   | Upstream                                                         | Patched                                                        |
|-----------------------------------------|------------------------------------------------------------------|----------------------------------------------------------------|
| Identifiers of every script             | ASCII only, `höhle.rüstungsklasse` breaks into `ERROR` nodes     | `identifier` and `binding_identifier` take any Unicode letter or digit |
| Interpolation in a plain attribute      | `class="w-4 {{ a ? 'x' : 'y' }}"` is one `attribute_value`         | `quoted_attribute_value` holds `attribute_value` and `interpolation` nodes |
| Event of a global target                | `(window:resize)` is an `ERROR` node                               | `binding_name` with a `target` field                             |
| Unary minus, plus and `typeof`          | `-1` and `typeof heading === "string"` are `ERROR` nodes          | `unary_operator` takes `-`, `+` and `typeof`; a unary expression is a left operand |
| Optional, chained and asserted calls    | `isFocused?.()`, `action()(row)`, `itemAction()!(row)` and `errors?.['max']` are `ERROR` nodes | `call_expression` calls a call or a non-null assertion, optionally with `?.(`; `bracket_expression` takes `?.[` |
| Non-null assertion                      | `cipher()!` is an `ERROR` node                                    | `non_null_expression`                                          |
| Operators in nested positions           | a ternary, `??` or pipe in a call argument, an operator in a ternary's true branch, array element or pipe argument is an `ERROR` node | each position takes the expressions Angular allows there, with trailing commas |
| Pipe after the last operand             | `a && b$ \| async` and `a ?? b \| currency` are `ERROR` nodes        | the pipe is part of the last operand                           |
| Attributes                              | `attr.viewBox="0 0 {{ size }}"` and `[popupBackAction]` without a value are `ERROR` nodes | `attribute_name` holds a dot; `property_binding` without a value |
| `@for` lets                             | `let` before `track`, `let` before each alias and `items ?? []` are `ERROR` nodes | `for_declaration` takes any expression and lets before `track`; `for_reference` takes `let` before each alias |
| Structural directive values             | `trackBy: trackBy()`, `templateCacheSize: 0` and `columns.name; let row` are `ERROR` nodes | `structural_assignment` takes a call, member, number or string; `structural_expression` takes trailing lets |

The version `0.9.2-codecharta.<n>` names the upstream release and the patch level.

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
VERSION=0.9.2-codecharta.2
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
