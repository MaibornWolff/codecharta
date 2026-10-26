package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.AliasDeclarationFinder.ALIAS
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations.ForwardDeclarationFinder.FORWARD_DECLARATION
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

class CppDependencyDeclarationTest {
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
    fun `should report a forward class declaration below the forward declaration marker`() {
        // Arrange
        val code = "class Foo;"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations).containsExactly(
            Declaration(name = "Foo", type = DeclarationType.CLASS, usedTypes = emptySet(), parentPath = listOf(FORWARD_DECLARATION))
        )
    }

    @Test
    fun `should report forward declarations in a namespace, a class and of an enum with their scope`() {
        // Arrange
        val code = "namespace g { struct C; enum E : int; }\nstruct H { class Inner; };"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations).containsExactlyInAnyOrder(
            Declaration(name = "C", type = DeclarationType.CLASS, usedTypes = emptySet(), parentPath = listOf(FORWARD_DECLARATION, "g")),
            Declaration(name = "E", type = DeclarationType.ENUM, usedTypes = emptySet(), parentPath = listOf(FORWARD_DECLARATION, "g")),
            Declaration(name = "H", type = DeclarationType.CLASS, usedTypes = emptySet(), parentPath = emptyList()),
            Declaration(name = "Inner", type = DeclarationType.CLASS, usedTypes = emptySet(), parentPath = listOf(FORWARD_DECLARATION, "H"))
        )
    }

    @Test
    fun `should report the tag a typedef names without a body as a forward declaration`() {
        // Arrange
        val code = "typedef struct Stable Stable;"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations).containsExactly(
            Declaration(name = "Stable", type = DeclarationType.CLASS, usedTypes = emptySet(), parentPath = listOf(FORWARD_DECLARATION))
        )
    }

    @Test
    fun `should report typedefs of another name and using aliases below the alias marker with the type they name`() {
        // Arrange
        val code = """
            typedef struct Size Area;
            typedef int Meters, *MetersPtr;
            typedef struct Foo { int a; } Bar;
            namespace n { using Entity = lib::CreatureEntity; }
        """.trimIndent()

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.filter { it.parentPath.firstOrNull() == ALIAS }).containsExactlyInAnyOrder(
            Declaration(name = "Area", type = DeclarationType.CLASS, usedTypes = setOf(UsedType("Size")), parentPath = listOf(ALIAS)),
            Declaration(name = "Meters", type = DeclarationType.CLASS, usedTypes = setOf(UsedType("int")), parentPath = listOf(ALIAS)),
            Declaration(name = "MetersPtr", type = DeclarationType.CLASS, usedTypes = setOf(UsedType("int")), parentPath = listOf(ALIAS)),
            Declaration(name = "Bar", type = DeclarationType.CLASS, usedTypes = setOf(UsedType("Foo")), parentPath = listOf(ALIAS)),
            Declaration(
                name = "Entity",
                type = DeclarationType.CLASS,
                usedTypes = setOf(UsedType("CreatureEntity", namespacePrefix = listOf("lib"))),
                parentPath = listOf(ALIAS, "n")
            )
        )
    }

    @Test
    fun `should report no alias for a typedef of a struct of the same name or of a function pointer`() {
        // Arrange
        val code = "typedef struct Size Size;\ntypedef struct Point { int x; } Point;\ntypedef int (*Callback)(int);"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.filter { it.parentPath.firstOrNull() == ALIAS }).isEmpty()
    }

    @Test
    fun `should report the class an unqualified friend declaration names as forward declared in its namespace`() {
        // Arrange
        val code = "namespace app { class T { friend class Util; friend struct lib::Other; friend Third; }; }"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.filter { it.parentPath.firstOrNull() == FORWARD_DECLARATION }).containsExactly(
            Declaration(
                name = "Util",
                type = DeclarationType.CLASS,
                usedTypes = emptySet(),
                parentPath = listOf(FORWARD_DECLARATION, "app")
            )
        )
    }

    @Test
    fun `should report no forward declaration for a class named in the type of a field`() {
        // Arrange
        val code = "struct Nest { struct Roost *held; };"

        // Act
        val result = TreeSitterDependencies.analyze(code, Language.CPP)

        // Assert
        assertThat(result.declarations.map { it.name }).containsExactly("Nest")
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
