package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class DelphiDeclarationDependencyTest {
    @ParameterizedTest
    @MethodSource("topLevelDeclarationCases", "nestedDeclarationCases")
    fun `should extract declarations with type and parentPath`(code: String, expectedDeclarations: List<Declaration>) {
        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(result.declarations)
            .usingRecursiveFieldByFieldElementComparatorIgnoringFields("usedTypes")
            .containsExactlyInAnyOrderElementsOf(expectedDeclarations)
    }

    @Test
    fun `should emit a single declaration for a forward-declared class with a later full definition`() {
        // Arrange - the forward declaration has no body, so it must not hide the used types of the full definition.
        val code = unitWithTypes("TFoo = class;", "TFoo = class(TBase)", "  FValue: Integer;", "end;")

        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(result.declarations).hasSize(1)
        assertThat(result.declarations[0].name).isEqualTo("TFoo")
        assertThat(result.declarations[0].type).isEqualTo(DeclarationType.CLASS)
        assertThat(result.declarations[0].usedTypes.map { it.name }).containsExactlyInAnyOrder("TBase", "Integer")
    }

    companion object {
        @JvmStatic
        fun topLevelDeclarationCases(): List<Arguments> = listOf(
            argumentSet("class", unitWithTypes("TMyClass = class", "end;"), listOf(declaration("TMyClass", DeclarationType.CLASS))),
            argumentSet(
                "interface",
                unitWithTypes("IMyIntf = interface", "end;"),
                listOf(declaration("IMyIntf", DeclarationType.INTERFACE))
            ),
            argumentSet(
                "record",
                unitWithTypes("TPoint = record", "  X, Y: Integer;", "end;"),
                listOf(declaration("TPoint", DeclarationType.RECORD))
            ),
            argumentSet("enum", unitWithTypes("TColor = (Red, Green, Blue);"), listOf(declaration("TColor", DeclarationType.ENUM))),
            argumentSet(
                "class helper as CLASS",
                unitWithTypes("TStringHelper = class helper for string", "  function Reverse: string;", "end;"),
                listOf(declaration("TStringHelper", DeclarationType.CLASS))
            ),
            argumentSet(
                "dispinterface as INTERFACE",
                unitWithTypes(
                    "IMyAutoObject = dispinterface",
                    "  ['{12345678-1234-1234-1234-123456789012}']",
                    "  procedure DoSomething; dispid 1;",
                    "end;"
                ),
                listOf(declaration("IMyAutoObject", DeclarationType.INTERFACE))
            ),
            argumentSet(
                "no type aliases",
                unitWithTypes("TMyInt = Integer;", "TMyClass = class", "end;"),
                listOf(declaration("TMyClass", DeclarationType.CLASS))
            ),
            argumentSet("no types defined", "unit MyUnit;\ninterface\nimplementation\nend.", emptyList<Declaration>()),
            argumentSet(
                "no module-level typed const",
                "unit MyUnit;\ninterface\nconst\n  MAX: Integer = 1;\nimplementation\nend.",
                emptyList<Declaration>()
            )
        )

        @JvmStatic
        fun nestedDeclarationCases(): List<Arguments> = listOf(
            argumentSet(
                "nested class under its enclosing class",
                unitWithTypes("TOuter = class", "private type", "  TInner = class", "    FValue: Integer;", "  end;", "end;"),
                listOf(declaration("TOuter", DeclarationType.CLASS), declaration("TInner", DeclarationType.CLASS, "TOuter"))
            ),
            argumentSet(
                "nested record, interface and enum under their enclosing class",
                unitWithTypes(
                    "TOuter = class",
                    "public type",
                    "  TInnerRecord = record",
                    "    X: Integer;",
                    "  end;",
                    "  IInnerIntf = interface",
                    "    procedure Do_;",
                    "  end;",
                    "  TInnerEnum = (Red, Green, Blue);",
                    "end;"
                ),
                listOf(
                    declaration("TOuter", DeclarationType.CLASS),
                    declaration("TInnerRecord", DeclarationType.RECORD, "TOuter"),
                    declaration("IInnerIntf", DeclarationType.INTERFACE, "TOuter"),
                    declaration("TInnerEnum", DeclarationType.ENUM, "TOuter")
                )
            ),
            argumentSet(
                "two-level nesting in outer-to-inner order",
                unitWithTypes(
                    "TOuter = class",
                    "public type",
                    "  TMiddle = class",
                    "  public type",
                    "    TInner = class",
                    "      FValue: Integer;",
                    "    end;",
                    "  end;",
                    "end;"
                ),
                listOf(
                    declaration("TOuter", DeclarationType.CLASS),
                    declaration("TMiddle", DeclarationType.CLASS, "TOuter"),
                    declaration("TInner", DeclarationType.CLASS, "TOuter", "TMiddle")
                )
            ),
            argumentSet(
                "top-level sibling of a nesting class without parentPath",
                unitWithTypes("TOuter = class", "public type", "  TInner = class", "  end;", "end;", "TSibling = class", "end;"),
                listOf(
                    declaration("TOuter", DeclarationType.CLASS),
                    declaration("TInner", DeclarationType.CLASS, "TOuter"),
                    declaration("TSibling", DeclarationType.CLASS)
                )
            )
        )

        private fun declaration(name: String, type: DeclarationType, vararg parentPath: String) =
            Declaration(name = name, type = type, usedTypes = emptySet(), parentPath = parentPath.toList())
    }
}
