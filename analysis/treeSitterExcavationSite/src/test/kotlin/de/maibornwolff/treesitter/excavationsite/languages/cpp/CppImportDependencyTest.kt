package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class CppImportDependencyTest {
    @ParameterizedTest
    @MethodSource("packagePathCases")
    fun `should extract package path`(code: String, expectedPackagePath: List<String>) {
        // Act
        val result = analyzeCpp(code)

        // Assert
        assertThat(result.packagePath).containsExactlyElementsOf(expectedPackagePath)
    }

    @ParameterizedTest
    @MethodSource("includeCases", "usingCases")
    fun `should extract imports`(code: String, expectedImports: List<ImportDeclaration>) {
        // Act
        val result = analyzeCpp(code)

        // Assert
        assertThat(result.imports).containsExactlyElementsOf(expectedImports)
    }

    @Test
    fun `should report CPP as supported for dependency analysis`() {
        // Act & Assert
        assertThat(TreeSitterDependencies.isDependencyAnalysisSupported(Language.CPP)).isTrue()
    }

    companion object {
        @JvmStatic
        fun packagePathCases(): List<Arguments> = listOf(
            argumentSet("single namespace", "namespace MyApp {\n    class Foo {};\n}", listOf("MyApp")),
            argumentSet(
                "outermost of physically nested namespaces",
                """
                    namespace Outer {
                        namespace Inner {
                            class Foo {};
                        }
                    }
                """.trimIndent(),
                listOf("Outer")
            ),
            argumentSet("nothing for anonymous namespace", "namespace {\n    class Foo {};\n}", emptyList<String>()),
            argumentSet("nothing for file without namespace", "class Foo {};", emptyList<String>()),
            argumentSet(
                "segments of C++17 nested namespace",
                "namespace Outer::Middle::Inner {\n    class Foo {};\n}",
                listOf("Outer", "Middle", "Inner")
            ),
            argumentSet(
                "first of multiple top-level namespaces",
                "namespace A { class Foo {}; }\nnamespace B { class Bar {}; }",
                listOf("A")
            ),
            argumentSet(
                "namespace wrapped in ifdef preprocessor directive",
                """
                    #ifdef ENABLE_FEATURE
                    namespace MyApp {
                        class Foo {};
                    }
                    #endif
                """.trimIndent(),
                listOf("MyApp")
            )
        )

        @JvmStatic
        fun includeCases(): List<Arguments> = listOf(
            argumentSet("system include", "#include <vector>", listOf(include("vector"))),
            argumentSet("quoted include", "#include \"my/header.h\"", listOf(include("my", "header.h"))),
            argumentSet(
                "include wrapped in ifdef preprocessor directive",
                "#ifdef ENABLE_FEATURE\n#include \"feature.h\"\n#endif",
                listOf(include("feature.h"))
            ),
            argumentSet(
                "multiple includes in source order",
                "#include <vector>\n#include \"local.h\"\n#include <memory>",
                listOf(include("vector"), include("local.h"), include("memory"))
            ),
            argumentSet(
                "multiline include with backslash continuation",
                """
                    #include "dir/\
                        subdir/Foo.h"
                """.trimIndent(),
                listOf(include("dir", "subdir", "Foo.h"))
            )
        )

        @JvmStatic
        fun usingCases(): List<Arguments> = listOf(
            argumentSet("using namespace as wildcard", "using namespace std;", listOf(usingImport(listOf("std"), isWildcard = true))),
            argumentSet(
                "qualified using declaration as non-wildcard",
                "using A::B::Symbol;",
                listOf(usingImport(listOf("A", "B", "Symbol"), isWildcard = false))
            ),
            argumentSet(
                "using namespace path split on double colon",
                "using namespace A::B::C;",
                listOf(usingImport(listOf("A", "B", "C"), isWildcard = true))
            ),
            argumentSet(
                "globally qualified using directive without leading empty segment",
                "using namespace ::std;",
                listOf(usingImport(listOf("std"), isWildcard = true))
            ),
            argumentSet(
                "globally qualified using declaration without leading empty segment",
                "using ::std::vector;",
                listOf(usingImport(listOf("std", "vector"), isWildcard = false))
            ),
            argumentSet(
                "using directive inside a namespace with namespacePath",
                "namespace Outer::Middle {\n    using namespace Utils;\n}",
                listOf(usingImport(listOf("Utils"), isWildcard = true, namespacePath = listOf("Outer", "Middle")))
            ),
            argumentSet(
                "using declaration inside a namespace with namespacePath",
                "namespace App {\n    using Utils::Foo;\n}",
                listOf(usingImport(listOf("Utils", "Foo"), isWildcard = false, namespacePath = listOf("App")))
            ),
            argumentSet(
                "function-scope using inside a namespace with enclosing namespacePath",
                """
                    namespace App {
                        void doWork() {
                            using namespace Utils;
                        }
                    }
                """.trimIndent(),
                listOf(usingImport(listOf("Utils"), isWildcard = true, namespacePath = listOf("App")))
            ),
            argumentSet(
                "function-scope using inside out-of-class method with enclosing namespacePath",
                """
                    namespace App {
                        void Container::doWork() {
                            using namespace Utils;
                        }
                    }
                """.trimIndent(),
                listOf(usingImport(listOf("Utils"), isWildcard = true, namespacePath = listOf("App")))
            ),
            argumentSet(
                "nothing for function-scope using inside inline class method within a namespace",
                """
                    namespace App {
                        class Container {
                            void doWork() {
                                using namespace Utils;
                            }
                        };
                    }
                """.trimIndent(),
                emptyList<ImportDeclaration>()
            ),
            argumentSet(
                "nothing for in-class using enum declaration",
                """
                    enum class Color { RED, GREEN, BLUE };

                    class Widget {
                    public:
                        using enum Color;
                    };
                """.trimIndent(),
                emptyList<ImportDeclaration>()
            ),
            argumentSet(
                "nothing for inheriting constructor using declaration inside class body",
                """
                    class Base {
                    public:
                        Base(int);
                    };

                    class Derived : public Base {
                    public:
                        using Base::Base;
                    };
                """.trimIndent(),
                emptyList<ImportDeclaration>()
            ),
            argumentSet(
                "nothing for using declaration inside function body",
                "void foo() {\n    using std::cout;\n}",
                emptyList<ImportDeclaration>()
            ),
            argumentSet(
                "nothing for using directive inside nested block",
                """
                    void foo() {
                        if (true) {
                            using namespace std;
                        }
                    }
                """.trimIndent(),
                emptyList<ImportDeclaration>()
            )
        )

        private fun include(vararg path: String) = ImportDeclaration(path = path.toList(), isWildcard = false, kind = ImportKind.INCLUDE)

        private fun usingImport(path: List<String>, isWildcard: Boolean, namespacePath: List<String> = emptyList()) =
            ImportDeclaration(path = path, isWildcard = isWildcard, namespacePath = namespacePath, kind = ImportKind.STANDARD)
    }
}
