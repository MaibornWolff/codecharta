package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.junit.jupiter.params.provider.ValueSource

class CppDependencyTest {
    @Nested
    inner class PackageExtraction {
        @Test
        fun `should extract single namespace as package path`() {
            // Arrange
            val code = """
                namespace MyApp {
                    class Foo {};
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.packagePath).containsExactly("MyApp")
        }

        @Test
        fun `should use outermost namespace when physically nested`() {
            // Arrange
            val code = """
                namespace Outer {
                    namespace Inner {
                        class Foo {};
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.packagePath).containsExactly("Outer")
        }

        @Test
        fun `should return empty package path for anonymous namespace`() {
            // Arrange
            val code = """
                namespace {
                    class Foo {};
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }

        @Test
        fun `should return empty package path for file with no namespace`() {
            // Arrange
            val code = "class Foo {};"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }

        @Test
        fun `should split C++17 nested namespace into segments`() {
            // Arrange
            val code = """
                namespace Outer::Middle::Inner {
                    class Foo {};
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.packagePath).containsExactly("Outer", "Middle", "Inner")
        }

        @Test
        fun `should use first namespace when multiple top-level namespaces are present`() {
            // Arrange
            val code = """
                namespace A { class Foo {}; }
                namespace B { class Bar {}; }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.packagePath).containsExactly("A")
        }

        @Test
        fun `should find namespace wrapped in ifdef preprocessor directive`() {
            // Arrange
            val code = """
                #ifdef ENABLE_FEATURE
                namespace MyApp {
                    class Foo {};
                }
                #endif
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.packagePath).containsExactly("MyApp")
        }
    }

    @Nested
    inner class ImportExtraction {
        @Nested
        inner class IncludeDirectives {
            @Test
            fun `should extract system include as INCLUDE-kind import`() {
                // Arrange
                val code = """
                    #include <vector>
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("vector"), isWildcard = false, kind = ImportKind.INCLUDE)
                )
            }

            @Test
            fun `should extract quoted include as INCLUDE-kind import`() {
                // Arrange
                val code = """
                    #include "my/header.h"
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("my", "header.h"), isWildcard = false, kind = ImportKind.INCLUDE)
                )
            }

            @Test
            fun `should extract include wrapped in ifdef preprocessor directive`() {
                // Arrange
                val code = """
                    #ifdef ENABLE_FEATURE
                    #include "feature.h"
                    #endif
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("feature.h"), isWildcard = false, kind = ImportKind.INCLUDE)
                )
            }

            @Test
            fun `should extract multiple includes in source order`() {
                // Arrange
                val code = """
                    #include <vector>
                    #include "local.h"
                    #include <memory>
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("vector"), isWildcard = false, kind = ImportKind.INCLUDE),
                    ImportDeclaration(path = listOf("local.h"), isWildcard = false, kind = ImportKind.INCLUDE),
                    ImportDeclaration(path = listOf("memory"), isWildcard = false, kind = ImportKind.INCLUDE)
                )
            }

            @Test
            fun `should normalize multiline include with backslash continuation`() {
                // Arrange — C/C++ preprocessor splices `\<newline>` and continuation indent.
                val code = """
                    #include "dir/\
                        subdir/Foo.h"
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("dir", "subdir", "Foo.h"), isWildcard = false, kind = ImportKind.INCLUDE)
                )
            }
        }

        @Nested
        inner class Usings {
            @Test
            fun `should extract using namespace as wildcard STANDARD import`() {
                // Arrange
                val code = """
                    using namespace std;
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("std"), isWildcard = true, kind = ImportKind.STANDARD)
                )
            }

            @Test
            fun `should skip in-class using enum declaration`() {
                // Arrange
                val code = """
                    enum class Color { RED, GREEN, BLUE };

                    class Widget {
                    public:
                        using enum Color;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).isEmpty()
            }

            @Test
            fun `should skip inheriting constructor using declaration inside class body`() {
                // Arrange
                val code = """
                    class Base {
                    public:
                        Base(int);
                    };

                    class Derived : public Base {
                    public:
                        using Base::Base;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).isEmpty()
            }

            @Test
            fun `should skip using declaration inside function body`() {
                // Arrange
                val code = """
                    void foo() {
                        using std::cout;
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).isEmpty()
            }

            @Test
            fun `should skip using directive inside nested block`() {
                // Arrange
                val code = """
                    void foo() {
                        if (true) {
                            using namespace std;
                        }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).isEmpty()
            }

            @Test
            fun `should populate namespacePath for using directive inside a namespace`() {
                // Arrange
                val code = """
                    namespace Outer::Middle {
                        using namespace Utils;
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(
                        path = listOf("Utils"),
                        isWildcard = true,
                        namespacePath = listOf("Outer", "Middle"),
                        kind = ImportKind.STANDARD
                    )
                )
            }

            @Test
            fun `should populate namespacePath for using declaration inside a namespace`() {
                // Arrange
                val code = """
                    namespace App {
                        using Utils::Foo;
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(
                        path = listOf("Utils", "Foo"),
                        isWildcard = false,
                        namespacePath = listOf("App"),
                        kind = ImportKind.STANDARD
                    )
                )
            }

            @Test
            fun `should emit function-scope using inside namespace with enclosing namespacePath`() {
                // Arrange — function-local using inside a namespace contributes to that
                // namespace's file-level dependency surface; downstream adapters scope it
                // by matching namespacePath against each declaration's parentPath.
                val code = """
                    namespace App {
                        void doWork() {
                            using namespace Utils;
                        }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(
                        path = listOf("Utils"),
                        isWildcard = true,
                        namespacePath = listOf("App"),
                        kind = ImportKind.STANDARD
                    )
                )
            }

            @Test
            fun `should emit function-scope using inside out-of-class method with enclosing namespacePath`() {
                // Arrange — the realistic DC scenario: function-local using inside an
                // out-of-class method definition (no class_specifier ancestor) inside a
                // namespace. Same code path as the free-function case but mirrors how the
                // pattern actually appears in real-world C++ source.
                val code = """
                    namespace App {
                        void Container::doWork() {
                            using namespace Utils;
                        }
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(
                        path = listOf("Utils"),
                        isWildcard = true,
                        namespacePath = listOf("App"),
                        kind = ImportKind.STANDARD
                    )
                )
            }

            @Test
            fun `should skip function-scope using inside inline class method even within a namespace`() {
                // Arrange — class_specifier exclusion takes precedence over the namespace
                // emission rule, so an inline class member function inside a namespace
                // still drops its function-local using.
                val code = """
                    namespace App {
                        class Container {
                            void doWork() {
                                using namespace Utils;
                            }
                        };
                    }
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).isEmpty()
            }

            @Test
            fun `should extract qualified using declaration as non-wildcard import`() {
                // Arrange
                val code = """
                    using A::B::Symbol;
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("A", "B", "Symbol"), isWildcard = false, kind = ImportKind.STANDARD)
                )
            }

            @Test
            fun `should split using namespace qualified path on double colon`() {
                // Arrange
                val code = """
                    using namespace A::B::C;
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("A", "B", "C"), isWildcard = true, kind = ImportKind.STANDARD)
                )
            }

            @Test
            fun `should drop leading empty segment from globally qualified using directive`() {
                // Arrange
                val code = """
                    using namespace ::std;
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("std"), isWildcard = true, kind = ImportKind.STANDARD)
                )
            }

            @Test
            fun `should drop leading empty segment from globally qualified using declaration`() {
                // Arrange
                val code = """
                    using ::std::vector;
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                assertThat(result.imports).containsExactly(
                    ImportDeclaration(path = listOf("std", "vector"), isWildcard = false, kind = ImportKind.STANDARD)
                )
            }
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @ParameterizedTest(name = "should extract {0}_specifier as CLASS declaration")
        @CsvSource(
            "class,Foo",
            "struct,Bar",
            "union,Variant"
        )
        fun `should extract class-like specifier as CLASS declaration`(keyword: String, name: String) {
            // Arrange
            val code = "$keyword $name {};"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(name = name, type = DeclarationType.CLASS, usedTypes = emptySet(), parentPath = emptyList())
            )
        }

        @ParameterizedTest(name = "should extract `{0}` form as ENUM declaration")
        @CsvSource(
            "'enum Color { RED };',Color",
            "'enum class Status { OK, ERROR };',Status",
            "'enum struct Phase { A, B };',Phase"
        )
        fun `should extract enum form as ENUM declaration`(code: String, name: String) {
            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(name = name, type = DeclarationType.ENUM, usedTypes = emptySet(), parentPath = emptyList())
            )
        }

        @Test
        fun `should skip anonymous struct declaration`() {
            // Arrange
            val code = "struct { int x; int y; } point;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should skip forward class declaration without body`() {
            // Arrange
            val code = "class Foo;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should split C++17 nested namespace into parentPath segments`() {
            // Arrange
            val code = """
                namespace Outer::Middle::Inner {
                    class Foo {};
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "Foo",
                    type = DeclarationType.CLASS,
                    usedTypes = emptySet(),
                    parentPath = listOf("Outer", "Middle", "Inner")
                )
            )
        }

        @Test
        fun `should aggregate physically nested namespaces into parentPath chain`() {
            // Arrange
            val code = """
                namespace Outer {
                    namespace Middle::Inner {
                        class Foo {};
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "Foo",
                    type = DeclarationType.CLASS,
                    usedTypes = emptySet(),
                    parentPath = listOf("Outer", "Middle", "Inner")
                )
            )
        }

        @Test
        fun `should set parentPath for nested class inside outer class and namespace`() {
            // Arrange
            val code = """
                namespace MyApp {
                    class Outer {
                        class Inner {};
                    };
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "Outer",
                    type = DeclarationType.CLASS,
                    usedTypes = emptySet(),
                    parentPath = listOf("MyApp")
                ),
                Declaration(
                    name = "Inner",
                    type = DeclarationType.CLASS,
                    usedTypes = emptySet(),
                    parentPath = listOf("MyApp", "Outer")
                )
            )
        }

        @Test
        fun `should treat extern C block as transparent for declarations`() {
            // Arrange
            val code = """
                namespace MyApp {
                    extern "C" {
                        struct Bar {};
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "Bar",
                    type = DeclarationType.CLASS,
                    usedTypes = emptySet(),
                    parentPath = listOf("MyApp")
                )
            )
        }

        @Test
        fun `should extract class wrapped in ifdef preprocessor directive`() {
            // Arrange
            val code = """
                namespace MyApp {
                    #ifdef ENABLE_FEATURE
                    class Foo {};
                    #endif
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "Foo",
                    type = DeclarationType.CLASS,
                    usedTypes = emptySet(),
                    parentPath = listOf("MyApp")
                )
            )
        }

        @Test
        fun `should emit synthetic declaration for out-of-class method definition`() {
            // Arrange
            val code = """
                void Foo::bar() {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "Foo",
                    type = DeclarationType.CLASS,
                    usedTypes = setOf(UsedType(name = "void")),
                    parentPath = emptyList()
                )
            )
        }

        @Test
        fun `should merge overloaded out-of-class methods into single declaration`() {
            // Arrange
            val code = """
                void Foo::bar(int) {}
                void Foo::bar(double) {}
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "Foo",
                    type = DeclarationType.CLASS,
                    usedTypes = setOf(UsedType(name = "void"), UsedType(name = "int"), UsedType(name = "double")),
                    parentPath = emptyList()
                )
            )
        }

        @Test
        fun `should emit no declaration for a namespace alias`() {
            // Arrange
            val code = """
                namespace Short = Long::Nested::Namespace;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should extract nested-class constructor destructor and method definitions inside namespace`() {
            // Arrange — mirrors Catch2's catch_test_spec.cpp
            val code = """
                namespace Catch {
                    TestSpec::Pattern::Pattern(std::string const& name) : m_name(name) {}
                    TestSpec::Pattern::~Pattern() = default;
                    std::string const& TestSpec::Pattern::name() const { return m_name; }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert — std::string is captured from constructor parameter and method return type
            assertThat(result.declarations).containsExactly(
                Declaration(
                    name = "Pattern",
                    type = DeclarationType.CLASS,
                    usedTypes = setOf(UsedType(name = "string", namespacePrefix = listOf("std"))),
                    parentPath = listOf("Catch", "TestSpec")
                )
            )
        }

        @Test
        fun `should emit no declaration for a C++20 concept definition`() {
            // Arrange
            val code = """
                template<typename T>
                concept Integral = std::is_integral_v<T>;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            assertThat(result.declarations).isEmpty()
        }
    }

    @Nested
    inner class UsedTypeExtraction {
        @Nested
        inner class Inheritance {
            @Test
            fun `should extract single public base class as used type`() {
                // Arrange
                val code = """
                    class Parent {};
                    class Child : public Parent {};
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val child = result.declarations.single { it.name == "Child" }
                assertThat(child.usedTypes).containsExactly(UsedType(name = "Parent"))
            }

            @Test
            fun `should extract all base classes from multiple inheritance`() {
                // Arrange
                val code = """
                    class Child : public Base1, protected Base2 {};
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val child = result.declarations.single { it.name == "Child" }
                assertThat(child.usedTypes).containsExactlyInAnyOrder(
                    UsedType(name = "Base1"),
                    UsedType(name = "Base2")
                )
            }

            @Test
            fun `should extract template specialization as base class`() {
                // Arrange
                val code = """
                    class Child : public Base<int> {};
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val child = result.declarations.single { it.name == "Child" }
                assertThat(child.usedTypes).containsExactly(
                    UsedType(name = "Base", genericTypes = listOf(UsedType(name = "int")))
                )
            }
        }

        @Nested
        inner class MethodReturnAndParameterTypes {
            @Test
            fun `should extract method return type and parameter types`() {
                // Arrange
                val code = """
                    class Service {
                        Result doWork(Input arg, Other o) {}
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val svc = result.declarations.single { it.name == "Service" }
                assertThat(svc.usedTypes).containsExactlyInAnyOrder(
                    UsedType(name = "Result"),
                    UsedType(name = "Input"),
                    UsedType(name = "Other")
                )
            }

            @Test
            fun `should extract param types from pure method declaration in header`() {
                // Arrange
                val code = """
                    class Service {
                        Result process(Input arg, Other o);
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val svc = result.declarations.single { it.name == "Service" }
                assertThat(svc.usedTypes).containsExactlyInAnyOrder(
                    UsedType(name = "Result"),
                    UsedType(name = "Input"),
                    UsedType(name = "Other")
                )
            }

            @Test
            fun `should extract trailing return type`() {
                // Arrange
                val code = """
                    class Service {
                        auto doWork() -> Foo {}
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val svc = result.declarations.single { it.name == "Service" }
                assertThat(svc.usedTypes).containsExactly(UsedType(name = "Foo"))
            }
        }

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
                    UsedType(name = "BarClass"),
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
                    UsedType(name = "BarClass"),
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
        inner class TypeAliases {
            @Test
            fun `should extract aliased type from typedef`() {
                // Arrange
                val code = """
                    class Container {
                        typedef Foo Bar;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(UsedType(name = "Foo"))
            }

            @Test
            fun `should extract template aliased type from typedef`() {
                // Arrange
                val code = """
                    class Container {
                        typedef Vec<Foo> Items;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo")))
                )
            }

            @Test
            fun `should extract aliased type from using alias declaration`() {
                // Arrange
                val code = """
                    class Container {
                        using Bar = Foo;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(UsedType(name = "Foo"))
            }

            @Test
            fun `should extract template aliased type from using alias declaration`() {
                // Arrange
                val code = """
                    class Container {
                        using Items = Vec<Foo>;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo")))
                )
            }
        }

        @Nested
        inner class TemplateConstraints {
            @Test
            fun `should extract type from requires clause on template class`() {
                // Arrange
                val code = """
                    template<typename T>
                    requires Foo<T>
                    class Container {};
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(name = "Foo", genericTypes = listOf(UsedType(name = "T")))
                )
            }

            @Test
            fun `should extract both sides of constraint conjunction`() {
                // Arrange
                val code = """
                    template<typename T>
                    requires Foo<T> && Bar<T>
                    class Container {};
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactlyInAnyOrder(
                    UsedType(name = "Foo", genericTypes = listOf(UsedType(name = "T"))),
                    UsedType(name = "Bar", genericTypes = listOf(UsedType(name = "T")))
                )
            }

            @Test
            fun `should extract both sides of constraint disjunction`() {
                // Arrange
                val code = """
                    template<typename T>
                    requires Foo<T> || Bar<T>
                    class Container {};
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactlyInAnyOrder(
                    UsedType(name = "Foo", genericTypes = listOf(UsedType(name = "T"))),
                    UsedType(name = "Bar", genericTypes = listOf(UsedType(name = "T")))
                )
            }
        }

        @Nested
        inner class FieldAndVariableTypes {
            @Test
            fun `should extract type from member field declaration`() {
                // Arrange
                val code = """
                    class Container {
                        Foo field_;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(UsedType(name = "Foo"))
            }

            @Test
            fun `should extract template type from member field declaration`() {
                // Arrange
                val code = """
                    class Container {
                        Vec<Foo> items_;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(name = "Vec", genericTypes = listOf(UsedType(name = "Foo")))
                )
            }

            @Test
            fun `should extract type from local variable declaration inside method body`() {
                // Arrange
                val code = """
                    class Container {
                        void doWork() {
                            Foo local;
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
            fun `should extract qualified type from member field declaration`() {
                // Arrange — qualified_identifier as a declaration's type (e.g. tinyxml2::XMLDocument doc)
                // is the dominant pattern for std::* and cross-namespace field/var types in real C++.
                val code = """
                    class Container {
                        tinyxml2::XMLDocument doc_;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(name = "XMLDocument", namespacePrefix = listOf("tinyxml2"))
                )
            }
        }

        @Nested
        inner class NamespacedTemplateGenerics {
            @Test
            fun `should extract simple generic from namespaced template as nested generic type`() {
                // Arrange — tree-sitter-cpp parses std::list<Foo> as qualified_identifier whose name
                // field is a template_type, not another qualified_identifier. Walker must dispatch
                // through extractTemplateType when the chain exits on a template_type leaf.
                val code = """
                    class Container {
                        std::list<Foo> items_;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(name = "list", namespacePrefix = listOf("std"), genericTypes = listOf(UsedType(name = "Foo")))
                )
            }

            @Test
            fun `should extract qualified generic from namespaced template as nested generic type`() {
                // Arrange — the cppcheck exemplar: std::list<ErrorMessage::FileLocation>.
                val code = """
                    class Container {
                        std::list<ErrorMessage::FileLocation> callStack_;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(
                        name = "list",
                        namespacePrefix = listOf("std"),
                        genericTypes = listOf(
                            UsedType(name = "FileLocation", namespacePrefix = listOf("ErrorMessage"))
                        )
                    )
                )
            }

            @Test
            fun `should extract both type arguments from two-argument namespaced template`() {
                // Arrange
                val code = """
                    class Container {
                        std::map<Key, Value> items_;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(
                        name = "map",
                        namespacePrefix = listOf("std"),
                        genericTypes = listOf(UsedType(name = "Key"), UsedType(name = "Value"))
                    )
                )
            }

            @Test
            fun `should extract nested namespaced templates recursively`() {
                // Arrange — std::shared_ptr<std::string>: both container and inner are namespaced.
                val code = """
                    class Container {
                        std::shared_ptr<std::string> payload_;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(
                        name = "shared_ptr",
                        namespacePrefix = listOf("std"),
                        genericTypes = listOf(
                            UsedType(name = "string", namespacePrefix = listOf("std"))
                        )
                    )
                )
            }

            @Test
            fun `should extract namespaced template from method return type`() {
                // Arrange — same pattern when used as a method return type rather than field.
                val code = """
                    class Container {
                        std::list<ErrorMessage::FileLocation> getCallStack();
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(
                        name = "list",
                        namespacePrefix = listOf("std"),
                        genericTypes = listOf(
                            UsedType(name = "FileLocation", namespacePrefix = listOf("ErrorMessage"))
                        )
                    )
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
        inner class FriendDeclarations {
            @Test
            fun `should extract friend class type`() {
                // Arrange
                val code = """
                    class Container {
                        friend class Tester;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(UsedType(name = "Tester"))
            }

            @Test
            fun `should extract qualified friend class type`() {
                // Arrange
                val code = """
                    class Container {
                        friend class Outer::Tester;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val container = result.declarations.single { it.name == "Container" }
                assertThat(container.usedTypes).containsExactly(
                    UsedType(name = "Tester", namespacePrefix = listOf("Outer"))
                )
            }
        }

        @Nested
        inner class InClassUsingDeclarations {
            @Test
            fun `should extract base class from using declaration inside class body`() {
                // Arrange
                val code = """
                    class Derived : public Base {
                        using Base::method;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val derived = result.declarations.single { it.name == "Derived" }
                assertThat(derived.usedTypes).containsExactly(UsedType(name = "Base"))
            }

            @Test
            fun `should capture namespace prefix on multi-segment qualified using declaration`() {
                // Arrange
                val code = """
                    class Derived {
                        using Outer::Inner::method;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val derived = result.declarations.single { it.name == "Derived" }
                assertThat(derived.usedTypes).containsExactly(
                    UsedType(name = "Inner", namespacePrefix = listOf("Outer"))
                )
            }

            @Test
            fun `should not extract using declaration nested in member function body as in-class type`() {
                // Arrange — using std::cout is local to doWork's block scope, not Container's class scope.
                val code = """
                    class Container {
                        void doWork() {
                            using std::cout;
                        }
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
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

        @Nested
        inner class BoundaryExclusion {
            @Test
            fun `should not leak nested class types into outer used types`() {
                // Arrange
                val code = """
                    class Outer {
                        class Inner {
                            Foo innerField;
                        };
                        Bar outerField;
                    };
                """.trimIndent()

                // Act
                val result = TreeSitterDependencies.analyze(code, Language.CPP)

                // Assert
                val outer = result.declarations.single { it.name == "Outer" }
                val inner = result.declarations.single { it.name == "Inner" }
                assertThat(outer.usedTypes).containsExactly(UsedType(name = "Bar"))
                assertThat(inner.usedTypes).containsExactly(UsedType(name = "Foo"))
            }
        }

        @Test
        fun `should extract used types from every category in a comprehensive class`() {
            // Arrange
            val code = """
                class Widget : public Base {
                    using BaseAlias = Wrapped;
                    typedef Counter Count;
                    Field field_;
                    friend class Friend;

                    Widget() : field_{Init::Value} {}

                    Result doWork(Param p) {
                        Local local;
                        auto casted = static_cast<Casted>(local);
                        auto created = new Created();
                        Namespace::helper();
                        auto s = sizeof(Sized*);
                    }
                };
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.CPP)

            // Assert
            val widget = result.declarations.single { it.name == "Widget" }
            assertThat(widget.usedTypes.map { it.name }.toSet()).containsExactlyInAnyOrder(
                "Base",
                "Wrapped",
                "Counter",
                "Field",
                "Friend",
                "Result",
                "Param",
                "Local",
                "Casted",
                "Created",
                "Namespace",
                "helper",
                "Sized",
                "Init"
            )
        }
    }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report CPP as supported for dependency analysis`() {
            // Act & Assert
            assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.CPP)).isTrue()
        }
    }
}
