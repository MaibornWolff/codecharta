package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class DelphiUsedTypeDependencyTest {
    @ParameterizedTest
    @MethodSource("classShapeCases", "elementTypeCases", "constraintAndAttributeCases", "implementationBodyCases")
    fun `should extract used types in concatenation order`(code: String, declarationName: String, expectedUsedTypes: List<String>) {
        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(usedTypeNamesOf(result, declarationName)).containsExactlyElementsOf(expectedUsedTypes)
    }

    @ParameterizedTest
    @MethodSource("unorderedCases")
    fun `should extract used types`(code: String, declarationName: String, expectedUsedTypes: List<String>) {
        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(usedTypeNamesOf(result, declarationName)).containsExactlyInAnyOrderElementsOf(expectedUsedTypes)
    }

    @ParameterizedTest
    @MethodSource("genericTypeCases")
    fun `should extract generic type arguments`(code: String, genericTypeName: String, expectedTypeArguments: List<String>) {
        // Act
        val result = analyzeDelphi(code)

        // Assert
        val genericType = result.declarations[0].usedTypes.single { it.name == genericTypeName }
        assertThat(genericType.genericTypes.map { it.name }).containsExactlyElementsOf(expectedTypeArguments)
    }

    @ParameterizedTest
    @MethodSource("excludedNameCases")
    fun `should not extract non-type names as used types`(code: String, excludedNames: List<String>) {
        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(usedTypeNamesOf(result, "TMyClass")).doesNotContainAnyElementsOf(excludedNames)
    }

    @Test
    fun `should emit used types in fixed concatenation order`() {
        // Arrange
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
        val result = analyzeDelphi(code)

        // Assert - inheritance, fields, properties, consts, variables, parameters, return types,
        // attributes, constructor calls, method calls, casts, generic constraints
        assertThat(usedTypeNamesOf(result, "TMyClass")).containsSubsequence(
            "TBase",
            "TFieldType",
            "TPropType",
            "TConstType",
            "TLocalType",
            "TParamType",
            "TReturnType",
            "TCtorType",
            "TUtility"
        )
    }

    @Test
    fun `should deduplicate cast target type when used by both as and is operators`() {
        // Arrange
        val code = classWithDoItBody("var Foo: TBase;", "if Foo is TBar then (Foo as TBar).Name;")

        // Act
        val result = analyzeDelphi(code)

        // Assert
        assertThat(usedTypeNamesOf(result, "TMyClass").count { it == "TBar" }).isEqualTo(1)
    }

    private fun usedTypeNamesOf(result: DependencyResult, declarationName: String) =
        result.declarations.single { it.name == declarationName }.usedTypes.map { it.name }

    companion object {
        @JvmStatic
        fun classShapeCases(): List<Arguments> = listOf(
            argumentSet(
                "superclass and implemented interfaces",
                unitWithTypes("TMyClass = class(TBase, IFoo, IBar)", "end;"),
                "TMyClass",
                listOf("TBase", "IFoo", "IBar")
            ),
            argumentSet(
                "rightmost segment of qualified inheritance parent",
                unitWithTypes("TMyClass = class(System.Classes.TObject)", "end;"),
                "TMyClass",
                listOf("TObject")
            ),
            argumentSet(
                "interfaces implemented by a record",
                unitWithTypes(
                    "IMyIntf = interface",
                    "  procedure DoIt;",
                    "end;",
                    "TMyRecord = record(IMyIntf)",
                    "  procedure DoIt;",
                    "end;"
                ),
                "TMyRecord",
                listOf("IMyIntf")
            ),
            argumentSet("nothing for a class with no body", classWithMembers(), "TMyClass", emptyList<String>()),
            argumentSet("parameter types", classWithMembers("procedure Do(A: TFoo; B: TBar);"), "TMyClass", listOf("TFoo", "TBar")),
            argumentSet("field types", classWithMembers("FValue: TFoo;", "FOther: TBar;"), "TMyClass", listOf("TFoo", "TBar")),
            argumentSet("function return type", classWithMembers("function GetValue: TResult;"), "TMyClass", listOf("TResult")),
            argumentSet("typed class-level const", classWithMembers("class const FOO: TBar = nil;"), "TMyClass", listOf("TBar")),
            argumentSet(
                "nothing for untyped class-level const",
                classWithMembers("class const PI = 3.14;"),
                "TMyClass",
                emptyList<String>()
            ),
            argumentSet("property declared type", classWithMembers("property Foo: TBar read FValue;"), "TMyClass", listOf("TBar")),
            argumentSet(
                "rightmost segment of qualified property type",
                classWithMembers("property Q: System.TDateTime read FQ;"),
                "TMyClass",
                listOf("TDateTime")
            ),
            argumentSet("class property type", classWithMembers("class property CFoo: TBaz read FBaz;"), "TMyClass", listOf("TBaz")),
            argumentSet(
                "indexed property type before its parameter type",
                classWithMembers("property Indexed[Index: Integer]: TElement read GetItem;"),
                "TMyClass",
                listOf("TElement", "Integer")
            ),
            argumentSet(
                "default array property types unaffected by default attribute",
                classWithMembers("property Items[Index: Integer]: TItem read GetItem; default;"),
                "TMyClass",
                listOf("TItem", "Integer")
            )
        )

        @JvmStatic
        fun elementTypeCases(): List<Arguments> = listOf(
            argumentSet("unbounded array field", classWithMembers("FBuf: array of Byte;"), "TMyClass", listOf("Byte")),
            argumentSet("bounded array field", classWithMembers("FArr: array[0..9] of Integer;"), "TMyClass", listOf("Integer")),
            argumentSet(
                "bounded array field without its non-literal bounds",
                classWithMembers("FArr: array[Low..High] of TFoo;"),
                "TMyClass",
                listOf("TFoo")
            ),
            argumentSet(
                "innermost type of nested array field",
                classWithMembers("FNested: array of array of TFoo;"),
                "TMyClass",
                listOf("TFoo")
            ),
            argumentSet("set field", classWithMembers("FSet: set of TColor;"), "TMyClass", listOf("TColor")),
            argumentSet("array property", classWithMembers("property Buf: array of Byte read FBuf;"), "TMyClass", listOf("Byte")),
            argumentSet("set property", classWithMembers("property Colors: set of TColor read FColors;"), "TMyClass", listOf("TColor")),
            argumentSet("set class const", classWithMembers("class const Colors: set of TColor = [];"), "TMyClass", listOf("TColor")),
            argumentSet(
                "set class const inside a record",
                unitWithTypes("TFoo = record", "  class const Codes: set of TCode = [];", "end;"),
                "TFoo",
                listOf("TCode")
            )
        )

        @JvmStatic
        fun constraintAndAttributeCases(): List<Arguments> = listOf(
            argumentSet("single generic constraint", unitWithTypes("TFoo<T: TBase> = class", "end;"), "TFoo", listOf("TBase")),
            argumentSet(
                "only the trailing constraint of comma-separated type parameters, a tree-sitter-pascal limitation",
                unitWithTypes("TFoo<T: TBase, U: IFoo> = class", "end;"),
                "TFoo",
                listOf("IFoo")
            ),
            argumentSet("nothing for unconstrained type parameter", unitWithTypes("TFoo<T> = class", "end;"), "TFoo", emptyList<String>()),
            argumentSet("nothing for keyword constraint", unitWithTypes("TFoo<T: class> = class", "end;"), "TFoo", emptyList<String>()),
            argumentSet("bare RTTI attribute", unitWithTypes("[Inject]", "TFoo = class", "end;"), "TFoo", listOf("Inject")),
            argumentSet(
                "call-form RTTI attribute without argument types",
                unitWithTypes("[SomeAttr('x', 42)]", "TFoo = class", "end;"),
                "TFoo",
                listOf("SomeAttr")
            ),
            argumentSet(
                "member-level RTTI attribute in enclosing class",
                unitWithTypes("TFoo = class", "  [Validate]", "  procedure DoIt;", "end;"),
                "TFoo",
                listOf("Validate")
            )
        )

        @JvmStatic
        fun implementationBodyCases(): List<Arguments> = listOf(
            argumentSet(
                "method body variables before constructor calls",
                classWithDoItBody("var\n  Helper: TBodyOnlyType;", "Helper := TBodyCtor.Create;"),
                "TMyClass",
                listOf("TBodyOnlyType", "TBodyCtor")
            ),
            argumentSet(
                "method body of a nested class bound via TOuter.TInner.Method",
                """
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
                """.trimIndent(),
                "TInner",
                listOf("TBodyOnlyType")
            )
        )

        @JvmStatic
        fun unorderedCases(): List<Arguments> = listOf(
            argumentSet(
                "class operator body bound to its declaring record",
                """
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
                """.trimIndent(),
                "TAny",
                listOf("TMatcherFactory", "TAny", "TOperatorBodyType")
            ),
            argumentSet(
                "lambda parameter and local variable types in enclosing class",
                classWithDoItBody(
                    "",
                    "Run(procedure(P: TBar)\n  var\n    LambdaLocal: TLambdaLocalType;\n  begin\n  end);"
                ),
                "TMyClass",
                listOf("TBar", "TLambdaLocalType")
            ),
            argumentSet(
                "each constraint of semicolon-separated type parameters",
                unitWithTypes("TFoo<T: TBase; U: IFoo> = class", "end;"),
                "TFoo",
                listOf("TBase", "IFoo")
            ),
            argumentSet(
                "every name of a stacked RTTI attribute",
                unitWithTypes("[Inject, Singleton]", "TFoo = class", "end;"),
                "TFoo",
                listOf("Inject", "Singleton")
            ),
            argumentSet(
                "cast target type of as operator",
                classWithDoItBody("var Foo: TBase;", "(Foo as TBar).Name;"),
                "TMyClass",
                listOf("TBase", "TBar")
            ),
            argumentSet(
                "type-test target type of is operator",
                classWithDoItBody("var Foo: TBase;", "if Foo is TBar then Exit;"),
                "TMyClass",
                listOf("TBase", "TBar")
            )
        )

        @JvmStatic
        fun genericTypeCases(): List<Arguments> = listOf(
            argumentSet("generic field type", classWithMembers("FList: TList<TItem>;"), "TList", listOf("TItem")),
            argumentSet(
                "generic property type",
                classWithMembers("property Items: TList<TItem> read GetItems write SetItems;"),
                "TList",
                listOf("TItem")
            ),
            argumentSet(
                "two-argument generic property type",
                classWithMembers("property D: TDict<TKey, TValue> read FD;"),
                "TDict",
                listOf("TKey", "TValue")
            )
        )

        @JvmStatic
        fun excludedNameCases(): List<Arguments> = listOf(
            argumentSet(
                "property accessor names",
                classWithMembers("property Items: TList<TItem> read GetItems write SetItems;"),
                listOf("GetItems", "SetItems")
            ),
            argumentSet(
                "nil as right-hand side of a type test",
                classWithDoItBody("var Foo: TBase;", "if Foo is nil then Exit;"),
                listOf("nil")
            )
        )

        private fun classWithDoItBody(localDeclarations: String, statements: String): String =
            """
            |unit MyUnit;
            |interface
            |type
            |  TMyClass = class
            |    procedure DoIt;
            |  end;
            |implementation
            |procedure TMyClass.DoIt;
            |$localDeclarations
            |begin
            |  $statements
            |end;
            |end.
            """.trimMargin()
    }
}
