package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.Arguments.argumentSet
import org.junit.jupiter.params.provider.MethodSource

class CppDeclarationDependencyTest {
    @ParameterizedTest
    @MethodSource("typeDeclarationCases", "scopedDeclarationCases", "outOfClassDefinitionCases")
    fun `should extract declarations`(code: String, expectedDeclarations: List<Declaration>) {
        // Act
        val result = analyzeCpp(code)

        // Assert
        assertThat(result.declarations).containsExactlyElementsOf(expectedDeclarations)
    }

    companion object {
        @JvmStatic
        fun typeDeclarationCases(): List<Arguments> = listOf(
            argumentSet("class_specifier as CLASS", "class Foo {};", listOf(classDeclaration("Foo"))),
            argumentSet("struct_specifier as CLASS", "struct Bar {};", listOf(classDeclaration("Bar"))),
            argumentSet("union_specifier as CLASS", "union Variant {};", listOf(classDeclaration("Variant"))),
            argumentSet("plain enum as ENUM", "enum Color { RED };", listOf(enumDeclaration("Color"))),
            argumentSet("enum class as ENUM", "enum class Status { OK, ERROR };", listOf(enumDeclaration("Status"))),
            argumentSet("enum struct as ENUM", "enum struct Phase { A, B };", listOf(enumDeclaration("Phase"))),
            argumentSet("nothing for anonymous struct", "struct { int x; int y; } point;", emptyList<Declaration>()),
            argumentSet("nothing for forward class declaration without body", "class Foo;", emptyList<Declaration>()),
            argumentSet("nothing for namespace alias", "namespace Short = Long::Nested::Namespace;", emptyList<Declaration>()),
            argumentSet(
                "nothing for C++20 concept definition",
                "template<typename T>\nconcept Integral = std::is_integral_v<T>;",
                emptyList<Declaration>()
            )
        )

        @JvmStatic
        fun scopedDeclarationCases(): List<Arguments> = listOf(
            argumentSet(
                "C++17 nested namespace split into parentPath segments",
                "namespace Outer::Middle::Inner {\n    class Foo {};\n}",
                listOf(classDeclaration("Foo", listOf("Outer", "Middle", "Inner")))
            ),
            argumentSet(
                "physically nested namespaces aggregated into parentPath chain",
                """
                    namespace Outer {
                        namespace Middle::Inner {
                            class Foo {};
                        }
                    }
                """.trimIndent(),
                listOf(classDeclaration("Foo", listOf("Outer", "Middle", "Inner")))
            ),
            argumentSet(
                "nested class inside outer class and namespace",
                """
                    namespace MyApp {
                        class Outer {
                            class Inner {};
                        };
                    }
                """.trimIndent(),
                listOf(classDeclaration("Outer", listOf("MyApp")), classDeclaration("Inner", listOf("MyApp", "Outer")))
            ),
            argumentSet(
                "extern C block transparent for declarations",
                """
                    namespace MyApp {
                        extern "C" {
                            struct Bar {};
                        }
                    }
                """.trimIndent(),
                listOf(classDeclaration("Bar", listOf("MyApp")))
            ),
            argumentSet(
                "class wrapped in ifdef preprocessor directive",
                """
                    namespace MyApp {
                        #ifdef ENABLE_FEATURE
                        class Foo {};
                        #endif
                    }
                """.trimIndent(),
                listOf(classDeclaration("Foo", listOf("MyApp")))
            )
        )

        @JvmStatic
        fun outOfClassDefinitionCases(): List<Arguments> = listOf(
            argumentSet(
                "synthetic declaration for out-of-class method definition",
                "void Foo::bar() {}",
                listOf(classDeclaration("Foo", usedTypes = setOf(UsedType(name = "void"))))
            ),
            argumentSet(
                "overloaded out-of-class methods merged into single declaration",
                "void Foo::bar(int) {}\nvoid Foo::bar(double) {}",
                listOf(
                    classDeclaration("Foo", usedTypes = setOf(UsedType(name = "void"), UsedType(name = "int"), UsedType(name = "double")))
                )
            ),
            argumentSet(
                "nested-class constructor, destructor and method definitions inside namespace",
                """
                    namespace Catch {
                        TestSpec::Pattern::Pattern(std::string const& name) : m_name(name) {}
                        TestSpec::Pattern::~Pattern() = default;
                        std::string const& TestSpec::Pattern::name() const { return m_name; }
                    }
                """.trimIndent(),
                listOf(
                    classDeclaration(
                        "Pattern",
                        parentPath = listOf("Catch", "TestSpec"),
                        usedTypes = setOf(UsedType(name = "string", namespacePrefix = listOf("std")))
                    )
                )
            )
        )

        private fun classDeclaration(name: String, parentPath: List<String> = emptyList(), usedTypes: Set<UsedType> = emptySet()) =
            Declaration(name = name, type = DeclarationType.CLASS, usedTypes = usedTypes, parentPath = parentPath)

        private fun enumDeclaration(name: String) =
            Declaration(name = name, type = DeclarationType.ENUM, usedTypes = emptySet(), parentPath = emptyList())
    }
}
