package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class DelphiDependencyDeclarationTest {
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
}
