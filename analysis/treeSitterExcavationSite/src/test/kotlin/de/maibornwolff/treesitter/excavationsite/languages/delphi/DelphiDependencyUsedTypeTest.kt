package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class DelphiDependencyUsedTypeTest {
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
