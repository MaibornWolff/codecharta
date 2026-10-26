package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.shared.domain.TypeUsage
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource

class CppDependencyUsedTypeInBodyTest {
    @Nested
    inner class ConstructorInitializers {
        @Test
        fun `should extract second-to-last segment from qualified constant in brace initializer`() {
            // Arrange
            val code = """
                class Foo {
                    Foo() : type_{A::B::GLOBAL_CONSTANT} {}
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val foo = result.declarations.single { it.name == "Foo" }
            assertThat(foo.usedTypes).containsExactly(
                UsedType(name = "B", namespacePrefix = listOf("A"))
            )
        }

        @Test
        fun `should extract single namespace segment from qualified constant in brace initializer`() {
            // Arrange
            val code = """
                class Foo {
                    Foo() : type_{A::GLOBAL_CONSTANT} {}
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val foo = result.declarations.single { it.name == "Foo" }
            assertThat(foo.usedTypes).containsExactly(UsedType(name = "A"))
        }

        @Test
        fun `should extract qualified identifier from base class argument list`() {
            // Arrange
            val code = """
                class FooClass : public BarClass {
                    FooClass(int base, int bonus)
                        : BarClass(base, bonus, A::B::C::GLOBAL_CONSTANT) {}
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val foo = result.declarations.single { it.name == "FooClass" }
            assertThat(foo.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "BarClass", usage = TypeUsage.INHERITANCE),
                UsedType(name = "C", namespacePrefix = listOf("A", "B")),
                UsedType(name = "int")
            )
        }

        @Test
        fun `should not emit used type when initializer list has no qualified identifiers`() {
            // Arrange
            val code = """
                class FooClass : public BarClass {
                    FooClass(int base, int bonus) : BarClass(base, bonus) {}
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val foo = result.declarations.single { it.name == "FooClass" }
            assertThat(foo.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "BarClass", usage = TypeUsage.INHERITANCE),
                UsedType(name = "int")
            )
        }

        @Test
        fun `should extract qualified identifier from nested call expression in argument list`() {
            // Arrange
            val code = """
                class Foo {
                    Foo() : member_(X::make()) {}
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val foo = result.declarations.single { it.name == "Foo" }
            assertThat(foo.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "X"),
                UsedType(name = "make", namespacePrefix = listOf("X"))
            )
        }
    }

    @Nested
    inner class Casts {
        @Test
        fun `should extract type from C-style cast expression`() {
            // Arrange
            val code = """
                class Container {
                    void doWork(void* p) {
                        auto result = (Foo)p;
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "void")
            )
        }

        @ParameterizedTest(name = "should extract type from {0}")
        @ValueSource(strings = ["static_cast", "reinterpret_cast", "const_cast"])
        fun `should extract type from explicit cast`(castName: String) {
            // Arrange
            val code = """
                class Container {
                    void doWork(Foo* p) {
                        auto x = $castName<Foo*>(p);
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract both source and target type from dynamic_cast`() {
            // Arrange — dynamic_cast across a polymorphic hierarchy; both Base (param)
            // and Derived (target) must be captured to verify the cast doesn't drop
            // the surrounding parameter type.
            val code = """
                class Container {
                    void doWork(Base* b) {
                        auto d = dynamic_cast<Derived*>(b);
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Base"),
                UsedType(name = "Derived"),
                UsedType(name = "void")
            )
        }
    }

    @Nested
    inner class InstantiationSites {
        @Test
        fun `should extract type from new expression`() {
            // Arrange
            val code = """
                class Container {
                    void doWork() {
                        auto p = new Foo();
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract template type from new expression`() {
            // Arrange
            val code = """
                class Container {
                    void doWork() {
                        auto p = new Vec<Foo>();
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo"))),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract template argument types from template function call`() {
            // Arrange
            val code = """
                class Container {
                    void doWork() {
                        auto x = make<Foo>();
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract rightmost segment and scope-as-type from single-scope qualified call`() {
            // Arrange — DC legacy (VariableDeclarationProcessor.kt:24-25) matches
            // (call_expression function: (qualified_identifier scope: (namespace_identifier)@type))
            // and emits the immediate scope as its own UsedType so the resolver can match
            // the referenced class (Catch), in addition to the rightmost segment.
            val code = """
                class Container {
                    void doWork() {
                        Catch::registerTest();
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Catch"),
                UsedType(name = "registerTest", namespacePrefix = listOf("Catch")),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract multi-segment prefix and outermost scope-as-type from qualified call`() {
            // Arrange
            val code = """
                class Container {
                    void doWork() {
                        A::B::C::helper();
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "helper", namespacePrefix = listOf("A", "B", "C")),
                UsedType(name = "A"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract bare-identifier callee when nested in argument list`() {
            // Arrange — DC's constructorCall TSQuery captures
            // (argument_list (call_expression function: (identifier)@potential_constructor))
            // for function-style constructor calls like Widget(x) passed as arguments
            // to other functions. This pattern is common in modern C++ for implicit
            // temporaries passed into container methods, std algorithms, etc.
            val code = """
                class Container {
                    void doWork(List& l) {
                        l.add(Widget(x));
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert — List from parameter type, Widget from constructor-style call in arg list.
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "List"),
                UsedType(name = "Widget"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should not extract bare-identifier callee at statement level`() {
            // Arrange — only argument-list-wrapped identifier calls are treated as
            // potential constructors; free-standing `foo();` at statement level is
            // just a function call and must not pollute usedTypes.
            val code = """
                class Container {
                    void doWork() {
                        helperFunction();
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert — only the return type is captured; no bare-identifier callee.
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactly(UsedType(name = "void"))
        }
    }

    @Nested
    inner class TypeOperands {
        @Test
        fun `should extract type from sizeof expression with pointer type`() {
            // Arrange
            val code = """
                class Container {
                    void doWork() {
                        auto s = sizeof(Foo*);
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract type from alignof expression`() {
            // Arrange
            val code = """
                class Container {
                    void doWork() {
                        auto a = alignof(Foo);
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "void")
            )
        }
    }

    @Nested
    inner class ThrowStatements {
        @Test
        fun `should extract bare-identifier callee from throw statement`() {
            // Arrange — DC legacy's VariableDeclarationProcessor throwCalls TSQuery
            // captures the call_expression's function field as @type for bare identifier,
            // qualified_identifier, template_function, and primitive_type cases.
            val code = """
                class Container {
                    void doWork() {
                        throw MyException(x);
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "MyException"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract qualified callee from throw statement`() {
            // Arrange — emits the rightmost segment with namespacePrefix,
            // plus the scope as its own UsedType (Issue 2 scope-as-type for qualified calls).
            val code = """
                class Container {
                    void doWork() {
                        throw std::runtime_error("x");
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "std"),
                UsedType(name = "runtime_error", namespacePrefix = listOf("std")),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract template-function callee from throw statement`() {
            // Arrange — DC emits the whole template_function as a Type.generic
            // with name + generics; the template_argument_list type_descriptor
            // is also captured separately, producing both the generic type and
            // its argument.
            val code = """
                class Container {
                    void doWork() {
                        throw make_ex<Detail>();
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Detail"),
                UsedType(name = "make_ex", genericTypes = listOf(UsedType(name = "Detail"))),
                UsedType(name = "void")
            )
        }
    }

    @Nested
    inner class OutOfClassMethodBodies {
        @Test
        fun `should extract parameter types from out-of-class method`() {
            // Arrange
            val code = """
                void Container::doWork(Foo f, Bar b) {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "Bar"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should extract parameter types from out-of-class constructor`() {
            // Arrange — constructors have no return type, so extractors must not require one
            val code = """
                Executor::Executor(const Settings& settings, ErrorLogger& errorLogger) {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val executor = result.declarations.single { it.name == "Executor" }
            assertThat(executor.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Settings"),
                UsedType(name = "ErrorLogger")
            )
        }

        @Test
        fun `should extract local variable types from out-of-class method body`() {
            // Arrange
            val code = """
                void Container::doWork() {
                    Foo local;
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "void")
            )
        }

        @Test
        fun `should merge used types across overloaded out-of-class methods`() {
            // Arrange
            val code = """
                void Container::doWork(Foo f) {}
                void Container::doWork(Bar b) {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val container = result.declarations.single { it.name == "Container" }
            assertThat(container.usedTypes).containsExactlyInAnyOrder(
                UsedType(name = "Foo"),
                UsedType(name = "Bar"),
                UsedType(name = "void")
            )
        }
    }
}
