package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatCode
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource
import java.io.File

class DelphiUnitDependencyTest {
    @ParameterizedTest
    @MethodSource("packagePathCases")
    fun `should extract package path`(code: String, expectedPackagePath: List<String>) {
        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(result.packagePath).containsExactlyElementsOf(expectedPackagePath)
    }

    @ParameterizedTest
    @MethodSource("importCases")
    fun `should extract uses clauses as non-wildcard imports`(code: String, expectedPaths: List<List<String>>) {
        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(result.imports.map { it.path }).containsExactlyElementsOf(expectedPaths)
        assertThat(result.imports).allMatch { !it.isWildcard }
    }

    @ParameterizedTest
    @MethodSource("emptyResultCases")
    fun `should return empty result`(code: String) {
        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(result.packagePath).isEmpty()
        assertThat(result.imports).isEmpty()
        assertThat(result.declarations).isEmpty()
    }

    @ParameterizedTest
    @MethodSource("notThrowingCases")
    fun `should not throw when analyzing`(code: String) {
        // Act & Assert
        assertThatCode { analyzeDelphi(code) }.doesNotThrowAnyException()
    }

    @Test
    fun `should report Delphi as supported for dependency analysis`() {
        // Act & Assert
        assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.DELPHI)).isTrue()
    }

    @Test
    fun `should include Delphi in supported languages list`() {
        // Act
        val supported = TreeSitterDependencies.getSupportedLanguages()

        // Assert
        assertThat(supported.any { it == Language.DELPHI }).isTrue()
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
            // Arrange - tree-sitter-pascal 0.10.2 wraps this file from `unit Spring.Comparers;` to its end
            // in a top-level ERROR node; the keyword fallback of PackageExtractor recovers the package path.
            val file = File("./spring4d/Source/Base/Spring.Comparers.pas")
            assumeTrue(file.exists(), "spring4d checkout not present at ./spring4d — skipping real-file regression guard")
            val code = file.readText()

            // Act
            val result = analyzeDelphi(code)

            // Assert
            assertThat(result.packagePath).containsExactly("Spring", "Comparers")
        }

        @Test
        fun `should extract package path when compiler directive follows interface keyword`() {
            // Arrange
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
            val result = analyzeDelphi(code)

            // Assert
            assertThat(result.packagePath).containsExactly("Spring", "Comparers")
            assertThat(result.declarations.map { it.name }).containsExactly("TFoo")
        }

        @Test
        fun `should extract package path and declarations from full Spring Comparers shape`() {
            // Arrange
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
            val result = analyzeDelphi(code)

            // Assert - the full declaration set depends on the parser's shape (type aliases, consts);
            // only the five named records have to survive the parse.
            assertThat(result.packagePath).containsExactly("Spring", "Comparers")
            val names = result.declarations.map { it.name }
            assertThat(names).anyMatch { it == "TComparer" }
            assertThat(names).anyMatch { it == "TEqualityComparer" }
            assertThat(names).anyMatch { it == "TStringComparer" }
            assertThat(names).anyMatch { it == "TOrdinalCaseInsensitiveStringComparer" }
            assertThat(names).anyMatch { it == "TOrdinalCaseSensitiveStringComparer" }
        }
    }

    companion object {
        private val DPR_PROGRAM =
            """
            program MyApp;

            uses
              SysUtils, MyCo.MyMod;

            begin
              WriteLn('Hello');
            end.
            """.trimIndent()

        @JvmStatic
        fun packagePathCases(): List<Arguments> = listOf(
            argumentSet(
                "dotted unit name",
                "unit MyCo.MyMod.Utils;\ninterface\nimplementation\nend.",
                listOf("MyCo", "MyMod", "Utils")
            ),
            argumentSet("single-segment unit name", "unit Utils;\ninterface\nimplementation\nend.", listOf("Utils")),
            argumentSet("program name of dpr file", "program MyApp;\nbegin\nend.", listOf("MyApp")),
            argumentSet("program name of dpr file with uses", DPR_PROGRAM, listOf("MyApp")),
            argumentSet(
                "unit name after preceding include directive",
                """
                    {${'$'}I Spring.inc}

                    unit Spring.Comparers;

                    interface

                    implementation

                    end.
                """.trimIndent(),
                listOf("Spring", "Comparers")
            ),
            argumentSet("no unit declaration", "// just a comment", emptyList<String>())
        )

        @JvmStatic
        fun importCases(): List<Arguments> = listOf(
            argumentSet("single uses clause", unitUsing("uses SysUtils;"), listOf(listOf("SysUtils"))),
            argumentSet(
                "multiple comma-separated uses",
                unitUsing("uses SysUtils, Classes, Generics.Collections;"),
                listOf(listOf("SysUtils"), listOf("Classes"), listOf("Generics", "Collections"))
            ),
            argumentSet("dotted uses as multi-segment path", unitUsing("uses MyCo.Foo.Bar;"), listOf(listOf("MyCo", "Foo", "Bar"))),
            argumentSet(
                "uses of interface and implementation sections",
                unitUsing("uses InterfaceDep;", "uses ImplDep;"),
                listOf(listOf("InterfaceDep"), listOf("ImplDep"))
            ),
            argumentSet(
                "module used in both sections only once",
                unitUsing("uses SharedDep;", "uses SharedDep;"),
                listOf(listOf("SharedDep"))
            ),
            argumentSet("no uses clauses", unitUsing(""), emptyList<List<String>>()),
            argumentSet("never wildcard", unitUsing("uses Foo, Bar.Baz;"), listOf(listOf("Foo"), listOf("Bar", "Baz"))),
            argumentSet(
                "module names of uses in path form",
                """
                    program MyApp;
                    uses
                      Spring.TestBootstrap in 'Source\Spring.TestBootstrap.pas',
                      Spring.Collections   in 'Source\Base\Collections\Spring.Collections.pas';
                    begin
                    end.
                """.trimIndent(),
                listOf(listOf("Spring", "TestBootstrap"), listOf("Spring", "Collections"))
            ),
            argumentSet(
                "all uses entries interrupted by IFDEF directives",
                unitUsing("uses\n  SysUtils,\n  {${'$'}IFDEF MSWINDOWS}\n  Windows,\n  Registry,\n  {${'$'}ENDIF}\n  Classes;"),
                listOf(listOf("SysUtils"), listOf("Windows"), listOf("Registry"), listOf("Classes"))
            ),
            argumentSet("uses of dpr file", DPR_PROGRAM, listOf(listOf("SysUtils"), listOf("MyCo", "MyMod")))
        )

        @JvmStatic
        fun emptyResultCases(): List<Arguments> = listOf(
            argumentSet("empty input", ""),
            argumentSet("comment-only input", "// just a comment\n{ and a brace comment }\n(* and a star comment *)")
        )

        @JvmStatic
        fun notThrowingCases(): List<Arguments> = listOf(
            argumentSet("trivial valid unit", "unit Trivial;\ninterface\nimplementation\nend."),
            argumentSet("malformed unit with unterminated class body", "unit Broken;\ninterface\ntype\n  TFoo = class\n    procedure Bar;")
        )

        private fun unitUsing(interfaceUses: String, implementationUses: String = ""): String =
            "unit MyUnit;\ninterface\n$interfaceUses\nimplementation\n$implementationUses\nend."
    }
}
