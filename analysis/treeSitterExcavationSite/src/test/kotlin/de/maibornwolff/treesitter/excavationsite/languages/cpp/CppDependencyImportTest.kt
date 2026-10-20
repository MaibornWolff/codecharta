package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class CppDependencyImportTest {
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
    inner class ApiSupportCheck {
        @Test
        fun `should report CPP as supported for dependency analysis`() {
            // Act & Assert
            assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.CPP)).isTrue()
        }
    }
}
