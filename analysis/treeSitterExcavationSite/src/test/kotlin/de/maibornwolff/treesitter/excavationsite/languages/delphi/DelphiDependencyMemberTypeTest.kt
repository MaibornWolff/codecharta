package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DelphiDependencyMemberTypeTest {
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
}
