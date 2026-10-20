package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class DelphiDependencyUnitTest {
    @Nested
    inner class PackageExtraction {
        @Test
        fun `should extract dotted unit name as package path`() {
            // Arrange
            val code = """
                unit MyCo.MyMod.Utils;
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).containsExactly("MyCo", "MyMod", "Utils")
        }

        @Test
        fun `should extract single-segment unit name`() {
            // Arrange
            val code = """
                unit Utils;
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).containsExactly("Utils")
        }

        @Test
        fun `should extract program name from dpr file`() {
            // Arrange
            val code = """
                program MyApp;
                begin
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).containsExactly("MyApp")
        }

        @Test
        fun `should return empty package path when no unit declaration exists`() {
            // Arrange
            val code = "// just a comment"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }
    }

    /**
     * Regression suite for [PackageExtractor]'s tolerance of malformed parses produced by
     * tree-sitter-pascal 0.10.2.
     *
     * Triggering files (Spring4D's `Spring.Comparers.pas`, `Spring.pas`, `Spring.Utils.pas`,
     * and several `Spring.Collections.*` units) cause the parser to wrap the entire unit body
     * in a top-level ERROR node and emit `kUnit` plus `moduleName` as raw children of that
     * ERROR rather than as a `unit` wrapper. The fallback in [PackageExtractor] recovers the
     * package path by searching for the keyword token and its sibling `moduleName`.
     *
     * **Deferred coverage:**
     *  - A minimal synthetic snippet that reproduces the root-level ERROR-wrap behaviour
     *    could not be constructed during this fix. Twelve candidate shapes (asm + IFDEF
     *    combinations, `{${'$'}I}` include directive before the unit declaration, and the
     *    verbatim Spring.Comparers shape) all parsed successfully with a `unit` wrapper.
     *    The real Spring4D file at `./spring4d/Source/Base/Spring.Comparers.pas` (when
     *    present) is therefore the authoritative regression guard; the test below skips
     *    silently when the checkout is not available so contributors without it aren't
     *    blocked.
     *  - A `program` / `library` keyword-fallback variant test is also deferred for the
     *    same reason — the trigger condition could not be reproduced for those module forms.
     *    The keyword-fallback code path nevertheless covers them by symmetry: all three of
     *    `kUnit` / `kProgram` / `kLibrary` are searched, and a matching `moduleName` sibling
     *    is read in the same way.
     */
    @Nested
    inner class PackageExtractionRobustness {
        @Test
        fun `should extract package path from real Spring Comparers pas file`() {
            // Arrange - reads the real spring4d file that triggers the bug. tree-sitter-pascal
            // 0.10.2 fails to recognize the file's top-level structure: `unit Spring.Comparers;`
            // through end-of-file is wrapped in a top-level ERROR node, with `kUnit` and
            // `moduleName` appearing as raw children of ERROR rather than as a `unit` node.
            // PackageExtractor's keyword-fallback recovers the package path; DeclarationExtractor
            // (which descends recursively into the ERROR via findAllDescendantsOfType) emits the
            // inner `declType` nodes with the now-correct package path.
            val file = java.io.File("./spring4d/Source/Base/Spring.Comparers.pas")
            org.junit.jupiter.api.Assumptions.assumeTrue(
                file.exists(),
                "spring4d checkout not present at ./spring4d — skipping real-file regression guard"
            )
            val code = file.readText()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - before the fix, packagePath was [] and declarations like TStringComparer
            // ended up as orphan project-tree roots. After the fix, the keyword-fallback recovers
            // ["Spring", "Comparers"] from the malformed parse.
            assertThat(result.packagePath).containsExactly("Spring", "Comparers")
        }

        @Test
        fun `should extract package path when include directive precedes unit declaration`() {
            // Arrange - reproduces Spring.Comparers.pas: `{${'$'}I Spring.inc}` directive
            // appears BEFORE `unit ...;`. Other Spring4D files have the directive AFTER
            // the unit declaration.
            val code = """
                {${'$'}I Spring.inc}

                unit Spring.Comparers;

                interface

                implementation

                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).containsExactly("Spring", "Comparers")
        }

        @Test
        fun `should extract package path when compiler directive follows interface keyword`() {
            // Arrange - Spring.Comparers.pas has `{${'$'}O+,W-,Q-,R-}` between `interface` and uses.
            val code = """
                unit Spring.Comparers;

                interface

                {${'$'}O+,W-,Q-,R-}

                type
                  TFoo = record
                    X: Integer;
                  end;

                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).containsExactly("Spring", "Comparers")
            assertThat(result.declarations.map { it.name }).containsExactly("TFoo")
        }

        @Test
        fun `should extract package path and declarations from full Spring Comparers shape`() {
            // Arrange - the verbatim shape that fails in production: include directive before
            // unit, compiler directive after interface, type alias to qualified name, generic
            // records with class methods, and a record with private-type nested records.
            val code = """
                {${'$'}I Spring.inc}

                unit Spring.Comparers;

                interface

                {${'$'}O+,W-,Q-,R-}

                uses
                  Generics.Defaults,
                  TypInfo,
                  Spring.Hash;

                type
                  TDefaultGenericInterface = Generics.Defaults.TDefaultGenericInterface;

                  TComparer<T> = record
                    class function Default: IComparer<T>; static;
                  end;

                  TEqualityComparer<T> = record
                    class function Default: IEqualityComparer<T>; static;
                  end;

                  TStringComparer = record
                  private type
                    TOrdinalCaseInsensitiveStringComparer = record
                      class operator Implicit(const value: TOrdinalCaseInsensitiveStringComparer): IComparer<string>;
                      function Compare(const left, right: string): Integer;
                    end;

                    TOrdinalCaseSensitiveStringComparer = record
                      class operator Implicit(const value: TOrdinalCaseSensitiveStringComparer): IComparer<string>;
                      function Compare(const left, right: string): Integer;
                    end;
                  public
                    const Ordinal: TOrdinalCaseSensitiveStringComparer = ();
                  end;

                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).containsExactly("Spring", "Comparers")
            val names = result.declarations.map { it.name }
            // anyMatch is used here because the snippet's full declaration set is parser-shape
            // dependent (e.g. type aliases like TDefaultGenericInterface, const Ordinal); the
            // robustness intent is only that the five named records survive the parse.
            assertThat(names).anyMatch { it == "TComparer" }
            assertThat(names).anyMatch { it == "TEqualityComparer" }
            assertThat(names).anyMatch { it == "TStringComparer" }
            assertThat(names).anyMatch { it == "TOrdinalCaseInsensitiveStringComparer" }
            assertThat(names).anyMatch { it == "TOrdinalCaseSensitiveStringComparer" }
        }
    }

    @Nested
    inner class ImportExtraction {
        @Test
        fun `should extract single uses clause`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                uses SysUtils;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("SysUtils")
            assertThat(result.imports[0].isWildcard).isFalse()
        }

        @Test
        fun `should extract multiple comma-separated uses`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                uses SysUtils, Classes, Generics.Collections;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports).hasSize(3)
            assertThat(result.imports[0].path).containsExactly("SysUtils")
            assertThat(result.imports[1].path).containsExactly("Classes")
            assertThat(result.imports[2].path).containsExactly("Generics", "Collections")
        }

        @Test
        fun `should extract dotted uses as multi-segment path`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                uses MyCo.Foo.Bar;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("MyCo", "Foo", "Bar")
        }

        @Test
        fun `should extract uses from both interface and implementation sections`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                uses InterfaceDep;
                implementation
                uses ImplDep;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports.map { it.path.joinToString(".") })
                .containsExactlyInAnyOrder("InterfaceDep", "ImplDep")
        }

        @Test
        fun `should deduplicate modules appearing in both sections`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                uses SharedDep;
                implementation
                uses SharedDep;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports).hasSize(1)
            assertThat(result.imports[0].path).containsExactly("SharedDep")
        }

        @Test
        fun `should return empty imports when no uses clauses exist`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports).isEmpty()
        }

        @Test
        fun `should extract module names from uses in path form`() {
            // Arrange - .dpr project files commonly use `uses Foo in 'path/Foo.pas'`. tree-sitter-pascal
            // 0.10.2 emits the `in '<path>'` clause as ERROR nodes but keeps the moduleName intact, so
            // the extractor still picks up the unit names cleanly.
            val code = """
                program MyApp;
                uses
                  Spring.TestBootstrap in 'Source\Spring.TestBootstrap.pas',
                  Spring.Collections   in 'Source\Base\Collections\Spring.Collections.pas';
                begin
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports.map { it.path.joinToString(".") })
                .containsExactlyInAnyOrder("Spring.TestBootstrap", "Spring.Collections")
        }

        @Test
        fun `should extract all uses entries even when interrupted by IFDEF directives`() {
            // Arrange - tree-sitter-pascal 0.10.2 keeps a single declUses node when {${'$'}IFDEF} blocks
            // appear between identifiers; the directives are emitted as `pp` siblings, so all module
            // names are still reachable via the moduleName children.
            val code = """
                unit MyUnit;
                interface
                uses
                  SysUtils,
                  {${'$'}IFDEF MSWINDOWS}
                  Windows,
                  Registry,
                  {${'$'}ENDIF}
                  Classes;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports.map { it.path.joinToString(".") })
                .containsExactlyInAnyOrder("SysUtils", "Windows", "Registry", "Classes")
        }

        @Test
        fun `should never mark any Delphi import as wildcard`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                uses Foo, Bar.Baz;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.imports).isNotEmpty
            assertThat(result.imports).allMatch { !it.isWildcard }
        }
    }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report Delphi as supported for dependency analysis`() {
            // Assert
            assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.DELPHI)).isTrue()
        }

        @Test
        fun `should include Delphi in supported languages list`() {
            // Act
            val supported = TreeSitterDependencies.getSupportedLanguages()

            // Assert
            assertThat(supported.any { it == Language.DELPHI }).isTrue()
        }

        @Test
        fun `should not throw when analyzing a trivial valid unit`() {
            // Arrange
            val code = """
                unit Trivial;
                interface
                implementation
                end.
            """.trimIndent()

            // Act + Assert
            TreeSitterDependencies.analyze(code, Language.DELPHI)
        }
    }

    @Nested
    inner class Robustness {
        @Test
        fun `should return empty result for empty input`() {
            // Act
            val result = TreeSitterDependencies.analyze("", Language.DELPHI)

            // Assert
            assertThat(result.packagePath).isEmpty()
            assertThat(result.imports).isEmpty()
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should return empty result for comment-only input`() {
            // Arrange
            val code = """
                // just a comment
                { and a brace comment }
                (* and a star comment *)
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).isEmpty()
            assertThat(result.imports).isEmpty()
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should not throw on malformed input missing end`() {
            // Arrange - a unit with unterminated class body
            val code = """
                unit Broken;
                interface
                type
                  TFoo = class
                    procedure Bar;
            """.trimIndent()

            // Act + Assert - must not throw
            TreeSitterDependencies.analyze(code, Language.DELPHI)
        }
    }

    @Nested
    inner class DprProgramSupport {
        @Test
        fun `should extract program name and uses from a dpr file`() {
            // Arrange - minimal .dpr source
            val code = """
                program MyApp;

                uses
                  SysUtils, MyCo.MyMod;

                begin
                  WriteLn('Hello');
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.packagePath).containsExactly("MyApp")
            assertThat(result.imports.map { it.path.joinToString(".") })
                .containsExactlyInAnyOrder("SysUtils", "MyCo.MyMod")
        }
    }
}
