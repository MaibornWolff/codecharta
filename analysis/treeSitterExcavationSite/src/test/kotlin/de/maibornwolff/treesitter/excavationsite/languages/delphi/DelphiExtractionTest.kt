package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class DelphiExtractionTest {
    @Nested
    inner class IdentifierExtraction {
        @Test
        fun `should extract procedure name from defProc`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure DoSomething;
                begin
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("DoSomething", "DoSomething")
        }

        @Test
        fun `should extract function name from defProc`() {
            // Arrange
            val code = """
                unit U; interface implementation
                function Compute: Integer;
                begin
                  Result := 1;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("Compute", "Compute")
        }

        @Test
        fun `should extract class name from declType`() {
            // Arrange
            val code = """
                unit U;
                interface
                type
                  TMyClass = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("TMyClass")
        }

        @Test
        fun `should extract interface name from declType`() {
            // Arrange
            val code = """
                unit U;
                interface
                type
                  IMyInterface = interface
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("IMyInterface")
        }

        @Test
        fun `should extract multiple variable names from a single declVar`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo;
                var X, Y: Integer;
                begin
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("Foo", "Foo", "X", "Y")
        }

        @Test
        fun `should extract record name from declType`() {
            // Arrange
            val code = """
                unit U;
                interface
                type
                  TPoint = record
                    X, Y: Integer;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("TPoint", "X", "Y")
        }

        @Test
        fun `should extract enum type name and values`() {
            // Arrange
            val code = """
                unit U;
                interface
                type
                  TColor = (Red, Green, Blue);
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("TColor", "Red", "Green", "Blue")
        }

        @Test
        fun `should extract field names from declField`() {
            // Arrange
            val code = """
                unit U;
                interface
                type
                  TSample = class
                    FName, FOther: string;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("TSample", "FName", "FOther")
        }

        @Test
        fun `should extract parameter names from declArg`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo(A: Integer; B, C: string);
                begin
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("Foo", "Foo", "A", "B", "C")
        }

        @Test
        fun `should extract property names from declProp`() {
            // Arrange - both simple and indexed properties; default attribute must not interfere.
            val code = """
                unit U;
                interface
                type
                  TSample = class
                    FValue: Integer;
                    property Foo: Integer read FValue;
                    property Items[Index: Integer]: Integer read FValue; default;
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("TSample", "FValue", "Foo", "Items", "Index")
        }

        @Test
        fun `should extract const identifiers for typed and untyped declarations`() {
            // Arrange - Pascal supports both untyped (`const PI = 3.14;`) and typed
            // (`const MAX_SIZE: Integer = 100;`) const declarations. Both should surface
            // their identifier name.
            val code = """
                unit U;
                interface
                const
                  PI = 3.14;
                  MAX_SIZE: Integer = 100;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("PI", "MAX_SIZE")
        }

        @Test
        fun `should extract generic type parameter names alongside the declaration name`() {
            // Arrange - `TFoo<T, U>` declares two generic type parameters; both names should
            // surface as identifiers alongside the declaration's own name.
            val code = """
                unit U;
                interface
                type
                  TFoo<T, U> = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("TFoo", "T", "U")
        }

        @Test
        fun `should extract generic type parameter name when declared with a constraint`() {
            // Arrange - `TBaz<T: TBase>` declares one type parameter `T` with a constraint.
            // Only `T` is extracted as an identifier here; the constraint type goes to
            // usedTypes via the dependency extractor, not the identifier extractor.
            val code = """
                unit U;
                interface
                type
                  TBaz<T: TBase> = class
                  end;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("TBaz", "T")
        }

        @Test
        fun `should extract exception handler bound variable name`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  try
                    Bar;
                  except
                    on MyErr: Exception do WriteLn(MyErr.Message);
                  end;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.identifiers).containsExactlyInAnyOrder("Foo", "Foo", "MyErr")
        }
    }

    @Nested
    inner class CommentExtraction {
        @Test
        fun `should extract text of line comments`() {
            // Arrange
            val code = """
                unit U; // first line comment
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.comments).containsExactly("first line comment")
        }

        @Test
        fun `should extract text of brace comments`() {
            // Arrange
            val code = """
                unit U;
                { brace body }
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.comments).containsExactly("brace body")
        }

        @Test
        fun `should extract text of star comments`() {
            // Arrange
            val code = """
                unit U;
                (* star body *)
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.comments).containsExactly("star body")
        }
    }

    @Nested
    inner class StringExtraction {
        @Test
        fun `should extract single-quoted string content without quotes`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  WriteLn('hello world');
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.DELPHI)

            // Assert
            assertThat(result.strings).containsExactly("hello world")
        }
    }
}
