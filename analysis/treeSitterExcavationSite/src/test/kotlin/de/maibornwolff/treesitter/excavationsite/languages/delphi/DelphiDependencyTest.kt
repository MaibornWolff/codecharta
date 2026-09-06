package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class DelphiDependencyTest {
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
    inner class DeclarationExtraction {
        @Test
        fun `should extract simple class declaration`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("TMyClass")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
            assertThat(result.declarations[0].parentPath).isEmpty()
        }

        @Test
        fun `should extract interface declaration`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  IMyIntf = interface
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("IMyIntf")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.INTERFACE)
        }

        @Test
        fun `should extract record declaration`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TPoint = record
                    X, Y: Integer;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("TPoint")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.RECORD)
        }

        @Test
        fun `should extract enum declaration`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TColor = (Red, Green, Blue);
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("TColor")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.ENUM)
        }

        @Test
        fun `should extract class helper as CLASS declaration`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TStringHelper = class helper for string
                    function Reverse: string;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("TStringHelper")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        }

        @Test
        fun `should skip type aliases`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyInt = Integer;
                  TMyClass = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("TMyClass")
        }

        @Test
        fun `should classify dispinterface as INTERFACE`() {
            // Arrange - tree-sitter-pascal 0.10.2 emits `dispinterface` as a `declIntf` node with a
            // `kDispInterface` keyword (no separate `declDispIntf` node), so the existing
            // declIntf->INTERFACE mapping covers COM dispatch interfaces too.
            val code = """
                unit MyUnit;
                interface
                type
                  IMyAutoObject = dispinterface
                    ['{12345678-1234-1234-1234-123456789012}']
                    procedure DoSomething; dispid 1;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("IMyAutoObject")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.INTERFACE)
        }

        @Test
        fun `should emit a single declaration for a forward-declared class with a later full definition`() {
            // Arrange - forward `TFoo = class;` (no body, no parent clause) followed by the real
            // class shape on a subsequent line. The forward decl must be filtered so the full
            // definition's used types are preserved.
            val code = """
                unit MyUnit;
                interface
                type
                  TFoo = class;
                  TFoo = class(TBase)
                    FValue: Integer;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).hasSize(1)
            assertThat(result.declarations[0].name).isEqualTo("TFoo")
            assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("TBase", "Integer")
        }

        @Test
        fun `should return empty declarations when no types defined`() {
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
            assertThat(result.declarations).isEmpty()
        }
    }

    @Nested
    inner class UsedTypeExtraction {
        @Test
        fun `should extract superclass and implemented interfaces from class inheritance`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class(TBase, IFoo, IBar)
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TBase", "IFoo", "IBar")
        }

        @Test
        fun `should extract parameter types`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    procedure Do(A: TFoo; B: TBar);
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TFoo", "TBar")
        }

        @Test
        fun `should extract field types`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    FValue: TFoo;
                    FOther: TBar;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TFoo", "TBar")
        }

        @Test
        fun `should extract function return type`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    function GetValue: TResult;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TResult")
        }

        @Test
        fun `should extract generic type arguments`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    FList: TList<TItem>;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val fieldType = result.declarations[0].usedTypes.single { it.name == "TList" }
            assertThat(fieldType.genericTypes.map { it.name }).containsExactly("TItem")
        }

        @Test
        fun `should emit empty used-types for a class with no body`() {
            // Arrange - a class declaration with no members and no inheritance
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - the defensive-extraction guard drops blank names, so an empty class
            // yields an empty used-types set rather than noise.
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should emit used types in fixed concatenation order`() {
            // Arrange - a class that exercises every category at least once
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class(TBase)
                    FValue: TFieldType;
                    property Bar: TPropType read FValue;
                    class const FOO: TConstType = nil;
                    function DoWork(Arg: TParamType): TReturnType;
                  end;
                implementation
                function TMyClass.DoWork(Arg: TParamType): TReturnType;
                var
                  Local: TLocalType;
                begin
                  Local := TCtorType.Create;
                  TUtility.Call;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - the order must match the documented sequence:
            // inheritance, fieldTypes, propertyTypes, constTypes, variableTypes,
            // parameters, returnTypes, attributeTypes, constructorCalls, methodCalls,
            // castTypes, genericConstraintTypes
            val names = result.declarations[0].usedTypes.map { it.name }
            assertThat(names).containsSubsequence(
                "TBase", // inheritance
                "TFieldType", // fieldTypes
                "TPropType", // propertyTypes
                "TConstType", // constTypes
                "TLocalType", // variableTypes
                "TParamType", // parameters
                "TReturnType", // returnTypes
                "TCtorType", // constructorCalls
                "TUtility" // methodCalls
            )
        }

        @Test
        fun `should capture used types from method bodies implemented in implementation section`() {
            // Arrange - Delphi splits class shape (interface) from method bodies (implementation).
            // The extractor must associate `defProc` nodes back to their declaring class via
            // the `TClass.Method` prefix on the defProc header name.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    procedure DoIt;
                  end;
                implementation
                procedure TMyClass.DoIt;
                var
                  Helper: TBodyOnlyType;
                begin
                  Helper := TBodyCtor.Create;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - variableTypes come before constructorCalls per the fixed concatenation order
            val names = result.declarations[0].usedTypes.map { it.name }
            assertThat(names).containsExactly("TBodyOnlyType", "TBodyCtor")
        }

        @Test
        fun `should bind class operator defProc bodies to their declaring class`() {
            // Arrange - `class operator TAny.Implicit(...)` body lives in the implementation
            // section. Its used types must still appear under TAny's usedTypes.
            val code = """
                unit MyUnit;
                interface
                type
                  TAny = record
                    class operator Implicit(const Value: TMatcherFactory): TAny;
                  end;
                implementation
                class operator TAny.Implicit(const Value: TMatcherFactory): TAny;
                var
                  Helper: TOperatorBodyType;
                begin
                  Helper := nil;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val tAny = result.declarations.single { it.name == "TAny" }
            assertThat(tAny.usedTypes.map { it.name })
                .containsExactlyInAnyOrder("TMatcherFactory", "TAny", "TOperatorBodyType")
        }

        @Test
        fun `should capture interfaces implemented by a record`() {
            // Arrange - records use a `declClass` shape with a `kRecord` keyword; their parent
            // typeref children should be picked up by the existing inheritance walk.
            val code = """
                unit MyUnit;
                interface
                type
                  IMyIntf = interface
                    procedure DoIt;
                  end;
                  TMyRecord = record(IMyIntf)
                    procedure DoIt;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val record = result.declarations.single { it.name == "TMyRecord" }
            assertThat(record.usedTypes.map { it.name }).containsExactly("IMyIntf")
        }

        @Test
        fun `should extract typed class-level const types`() {
            // Arrange - typed class-level consts (`class const FOO: TBar = nil;`) should
            // contribute their declared type to the enclosing class's usedTypes.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    class const FOO: TBar = nil;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TBar")
        }

        @Test
        fun `should not introduce blank-named UsedType for untyped class-level consts`() {
            // Arrange - untyped consts (`class const PI = 3.14;`) carry no `type` field;
            // the defensive guard must drop them rather than emit a blank-named UsedType.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    class const PI = 3.14;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations[0].usedTypes).isEmpty()
        }

        @Test
        fun `should extract property declared type`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    property Foo: TBar read FValue;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TBar")
        }

        @Test
        fun `should extract generic property type and not capture accessor names`() {
            // Arrange - property accessor names (`read GetItems` / `write SetItems`) are
            // method-bind references, not type references. Kotlin doesn't capture them and
            // Delphi mirrors that behaviour.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    property Items: TList<TItem> read GetItems write SetItems;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypes = result.declarations[0].usedTypes
            val propertyType = usedTypes.single { it.name == "TList" }
            assertThat(propertyType.genericTypes.map { it.name }).containsExactly("TItem")
            assertThat(usedTypes.map { it.name }).doesNotContain("GetItems", "SetItems")
        }

        @Test
        fun `should extract indexed property parameter and return types`() {
            // Arrange - indexed-property `declArg` children fall through to the existing
            // declArg traversal, so both the parameter type (Integer) and the return type
            // (TElement) should appear in usedTypes.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    property Indexed[Index: Integer]: TElement read GetItem;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - propertyTypes come before parameters in the concatenation order
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TElement", "Integer")
        }

        @Test
        fun `should extract element type of unbounded array fields`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    FBuf: array of Byte;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("Byte")
        }

        @Test
        fun `should extract element type of bounded array fields`() {
            // Arrange - range bounds are opaque; only the element type is captured.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    FArr: array[0..9] of Integer;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("Integer")
        }

        @Test
        fun `should extract element type of set fields`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    FSet: set of TColor;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TColor")
        }

        @Test
        fun `should extract element type of array property`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    property Buf: array of Byte read FBuf;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("Byte")
        }

        @Test
        fun `should extract innermost element type of nested array fields`() {
            // Arrange - `array of array of TFoo` should unwrap both `declArray` layers and
            // surface the innermost element type (`TFoo`).
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    FNested: array of array of TFoo;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TFoo")
        }

        @Test
        fun `should extract element type of set-typed property`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    property Colors: set of TColor read FColors;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TColor")
        }

        @Test
        fun `should extract element type of set-typed class const inside a record`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TFoo = record
                    class const Codes: set of TCode = [];
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TCode")
        }

        @Test
        fun `should extract element type of bounded array with non-literal bounds and ignore range bounds`() {
            // Arrange - range bounds (`Low`, `High`) are opaque identifiers; only the element
            // type should be captured.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    FArr: array[Low..High] of TFoo;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TFoo")
            assertThat(usedTypeNames).doesNotContain("Low", "High")
        }

        @Test
        fun `should capture lambda parameter and local variable types in enclosing class`() {
            // Arrange - anonymous procedures (`procedure(P: TBar) begin ... end`) parse as
            // `lambda` nodes. Their `declArg` parameters and `declVar` locals are reached
            // by the existing `findAllDescendantsGroupedByType` walk, so their types should
            // contribute to the enclosing class's usedTypes.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    procedure DoIt;
                  end;
                implementation
                procedure TMyClass.DoIt;
                begin
                  Run(procedure(P: TBar)
                    var
                      LambdaLocal: TLambdaLocalType;
                    begin
                    end);
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - lambda's declArg (P: TBar) contributes parameters, declVar
            // (LambdaLocal: TLambdaLocalType) contributes variableTypes.
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("TBar", "TLambdaLocalType")
        }

        @Test
        fun `should extract qualified property type via rightmost segment`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    property Q: System.TDateTime read FQ;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TDateTime")
        }

        @Test
        fun `should extract two-arg generic property type with both type parameters`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    property D: TDict<TKey, TValue> read FD;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val propertyType = result.declarations[0].usedTypes.single { it.name == "TDict" }
            assertThat(propertyType.genericTypes.map { it.name }).containsExactly("TKey", "TValue")
        }

        @Test
        fun `should extract type of class property`() {
            // Arrange - `class property` (kClass-prefixed) routes through the same declProp path.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    class property CFoo: TBaz read FBaz;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TBaz")
        }

        @Test
        fun `should extract types of default array property with default attribute`() {
            // Arrange - `default;` attribute must not interfere with type capture.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    property Items[Index: Integer]: TItem read GetItem; default;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TItem", "Integer")
        }

        @Test
        fun `should not contribute module-level typed const to any declaration`() {
            // Arrange - module-level consts live outside any declaration's bucket walk.
            // They must surface as identifiers but produce no declarations and no usedTypes.
            val code = """
                unit MyUnit;
                interface
                const
                  MAX: Integer = 1;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should extract element type of set-typed class const`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    class const Colors: set of TColor = [];
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TColor")
        }

        @Test
        fun `should capture single generic constraint type as used type`() {
            // Arrange - `TFoo<T: TBase> = class` should surface `TBase` in `TFoo.usedTypes`.
            val code = """
                unit MyUnit;
                interface
                type
                  TFoo<T: TBase> = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations.single { it.name == "TFoo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("TBase")
        }

        @Test
        fun `should capture each per-parameter constraint when multiple type parameters declare constraints with semicolons`() {
            // Arrange - `TFoo<T: TBase; U: IFoo>` parses as two distinct genericArgs each
            // with their own `[type]` field; both constraints should be captured. The
            // comma-separated form (`<T: TBase, U: IFoo>`) is parsed as a single genericArg
            // with the first constraint dropped into an ERROR sibling — see KNOWN_ISSUES.md.
            val code = """
                unit MyUnit;
                interface
                type
                  TFoo<T: TBase; U: IFoo> = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations.single { it.name == "TFoo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("TBase", "IFoo")
        }

        @Test
        fun `should capture only the trailing constraint when multiple type parameters use comma separator`() {
            // Arrange - tree-sitter-pascal 0.10.2 ERROR-recovers comma-separated multi-param
            // constraint clauses, so `<T: TBase, U: IFoo>` collapses into a single genericArg
            // and the leading constraint (TBase) is dropped. The trailing constraint (IFoo)
            // remains cleanly attached and is captured. Documented as a v1 limitation.
            val code = """
                unit MyUnit;
                interface
                type
                  TFoo<T: TBase, U: IFoo> = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations.single { it.name == "TFoo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("IFoo")
        }

        @Test
        fun `should not capture used type for unconstrained generic type parameter`() {
            // Arrange - `TFoo<T>` has no constraint; usedTypes should remain empty.
            val code = """
                unit MyUnit;
                interface
                type
                  TFoo<T> = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations.single { it.name == "TFoo" }.usedTypes).isEmpty()
        }

        @Test
        fun `should not capture keyword constraints like class as used types`() {
            // Arrange - `TFoo<T: class>` is a keyword constraint, not a type reference;
            // no usedType should be emitted for the constraint.
            val code = """
                unit MyUnit;
                interface
                type
                  TFoo<T: class> = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            assertThat(result.declarations.single { it.name == "TFoo" }.usedTypes).isEmpty()
        }

        @Test
        fun `should capture bare RTTI attribute name on a class declaration`() {
            // Arrange - `[Inject] TFoo = class` should surface `Inject` in `TFoo.usedTypes`.
            val code = """
                unit MyUnit;
                interface
                type
                  [Inject]
                  TFoo = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations.single { it.name == "TFoo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("Inject")
        }

        @Test
        fun `should capture call-form RTTI attribute name without argument types`() {
            // Arrange - `[SomeAttr('x', 42)] TFoo = class` should surface `SomeAttr` only;
            // the argument types ('x', 42) are not captured (mirrors Java/Kotlin/C#).
            val code = """
                unit MyUnit;
                interface
                type
                  [SomeAttr('x', 42)]
                  TFoo = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - argument types ('x', 42) are not captured (mirrors Java/Kotlin/C#).
            val usedTypeNames = result.declarations.single { it.name == "TFoo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("SomeAttr")
        }

        @Test
        fun `should capture every name in a stacked RTTI attribute`() {
            // Arrange - multiple attributes coalesced into one bracket pair (`[A, B]`) — both
            // should be captured.
            val code = """
                unit MyUnit;
                interface
                type
                  [Inject, Singleton]
                  TFoo = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations.single { it.name == "TFoo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("Inject", "Singleton")
        }

        @Test
        fun `should capture member-level RTTI attribute name in enclosing class usedTypes`() {
            // Arrange - `[Validate]` attached to `procedure DoIt;` should surface in the
            // enclosing class's usedTypes.
            val code = """
                unit MyUnit;
                interface
                type
                  TFoo = class
                    [Validate]
                    procedure DoIt;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations.single { it.name == "TFoo" }.usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactly("Validate")
        }

        @Test
        fun `should capture cast target type with as operator`() {
            // Arrange - `(Foo as TBar).Name` should surface `TBar`.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    procedure DoIt;
                  end;
                implementation
                procedure TMyClass.DoIt;
                var Foo: TBase;
                begin
                  (Foo as TBar).Name;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - var Foo: TBase contributes variableTypes; Foo as TBar contributes castTypes.
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("TBase", "TBar")
        }

        @Test
        fun `should capture type-test target type with is operator`() {
            // Arrange - `if Foo is TBar then ...` should surface `TBar`.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    procedure DoIt;
                  end;
                implementation
                procedure TMyClass.DoIt;
                var Foo: TBase;
                begin
                  if Foo is TBar then Exit;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert - var Foo: TBase contributes variableTypes; Foo is TBar contributes castTypes.
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).containsExactlyInAnyOrder("TBase", "TBar")
        }

        @Test
        fun `should not capture lowercase or nil cast RHS`() {
            // Arrange - `Foo is nil` is parseable but `nil` is not a type; the uppercase-first
            // heuristic must drop it. Same goes for lowercase identifiers (e.g. `foo`).
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    procedure DoIt;
                  end;
                implementation
                procedure TMyClass.DoIt;
                var Foo: TBase;
                begin
                  if Foo is nil then Exit;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames).doesNotContain("nil")
        }

        @Test
        fun `should deduplicate cast target type when used by both as and is operators`() {
            // Arrange - both `Foo as TBar` and `Foo is TBar` reference TBar; the final set
            // should contain it exactly once.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class
                    procedure DoIt;
                  end;
                implementation
                procedure TMyClass.DoIt;
                var Foo: TBase;
                begin
                  if Foo is TBar then (Foo as TBar).Name;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val usedTypeNames = result.declarations[0].usedTypes.map { it.name }
            assertThat(usedTypeNames.count { it == "TBar" }).isEqualTo(1)
        }

        @Test
        fun `should capture rightmost segment of qualified inheritance parent`() {
            // Arrange - dotted type refs in inheritance should resolve to the simple type name
            // (the rightmost segment), not the leading namespace segment.
            val code = """
                unit MyUnit;
                interface
                type
                  TMyClass = class(System.Classes.TObject)
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val names = result.declarations[0].usedTypes.map { it.name }
            assertThat(names).containsExactly("TObject")
        }
    }

    @Nested
    inner class NestedDeclarations {
        @Test
        fun `should extract nested class with parentPath of enclosing class`() {
            // Arrange - Delphi allows nested types inside class bodies. The nested type should be
            // emitted as a sibling declaration, with parentPath pointing back at its enclosing class.
            val code = """
                unit MyUnit;
                interface
                type
                  TOuter = class
                  private type
                    TInner = class
                      FValue: Integer;
                    end;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val inner = result.declarations.single { it.name == "TInner" }
            assertThat(inner.type).isEqualTo(DeclarationType.CLASS)
            assertThat(inner.parentPath).containsExactly("TOuter")
        }

        @Test
        fun `should extract nested record interface and enum with parentPath`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TOuter = class
                  public type
                    TInnerRecord = record
                      X: Integer;
                    end;
                    IInnerIntf = interface
                      procedure Do_;
                    end;
                    TInnerEnum = (Red, Green, Blue);
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val record = result.declarations.single { it.name == "TInnerRecord" }
            assertThat(record.type).isEqualTo(DeclarationType.RECORD)
            assertThat(record.parentPath).containsExactly("TOuter")

            val intf = result.declarations.single { it.name == "IInnerIntf" }
            assertThat(intf.type).isEqualTo(DeclarationType.INTERFACE)
            assertThat(intf.parentPath).containsExactly("TOuter")

            val enum = result.declarations.single { it.name == "TInnerEnum" }
            assertThat(enum.type).isEqualTo(DeclarationType.ENUM)
            assertThat(enum.parentPath).containsExactly("TOuter")
        }

        @Test
        fun `should produce parentPath in outer-to-inner order for two-level nesting`() {
            // Arrange
            val code = """
                unit MyUnit;
                interface
                type
                  TOuter = class
                  public type
                    TMiddle = class
                    public type
                      TInner = class
                        FValue: Integer;
                      end;
                    end;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val inner = result.declarations.single { it.name == "TInner" }
            assertThat(inner.parentPath).containsExactly("TOuter", "TMiddle")
        }

        @Test
        fun `should bind defProc bodies to nested classes via TOuter TInner Method`() {
            // Arrange - method bodies for nested classes are referenced as TOuter.TInner.Method in
            // the implementation section. They must still be associated with TInner so its used
            // types include the body's references.
            val code = """
                unit MyUnit;
                interface
                type
                  TOuter = class
                  public type
                    TInner = class
                      procedure DoIt;
                    end;
                  end;
                implementation
                procedure TOuter.TInner.DoIt;
                var
                  Helper: TBodyOnlyType;
                begin
                  Helper := nil;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val inner = result.declarations.single { it.name == "TInner" }
            assertThat(inner.usedTypes.map { it.name }).containsExactly("TBodyOnlyType")
        }

        @Test
        fun `should keep top-level declarations with empty parentPath`() {
            // Arrange - regression: extracting nested types must not leak parentPath onto siblings.
            val code = """
                unit MyUnit;
                interface
                type
                  TOuter = class
                  public type
                    TInner = class
                    end;
                  end;
                  TSibling = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.DELPHI)

            // Assert
            val outer = result.declarations.single { it.name == "TOuter" }
            assertThat(outer.parentPath).isEmpty()
            val sibling = result.declarations.single { it.name == "TSibling" }
            assertThat(sibling.parentPath).isEmpty()
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
