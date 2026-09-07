package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.kotlin.KotlinAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class KotlinAnalyzerTest {
    @Test
    fun `should extract property types correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                private val name: String = ""
                private var age: Int = 0
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("Int"))
        )
    }

    @Test
    fun `should extract function return types correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                fun getName(): String {
                    return "name"
                }

                fun getAge(): Int {
                    return 42
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("Int"))
        )
    }

    @Test
    fun `should extract function parameter types correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                fun setName(name: String) {
                }

                fun setAge(age: Int) {
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("Int"))
        )
    }

    @Test
    fun `should extract constructor parameter types correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest(val name: String, var age: Int)
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("Int"))
        )
    }

    @Test
    fun `should extract used annotation types correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            import kotlin.Deprecated
            import kotlin.Suppress

            class KotlinAnalyzerTest {
                @Deprecated("old")
                @Suppress("unused")
                fun setName(name: String) {
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("Deprecated"), Type.simple("Suppress"))
        )
    }

    @Test
    fun `should create node for each class and interface in a given file`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
            }

            interface TestInterface {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(2, nodes.size)
        assertEquals("KotlinAnalyzerTest", nodes[0].pathWithName.parts.last())
        assertEquals("TestInterface", nodes[1].pathWithName.parts.last())
    }

    @Test
    fun `should create node for object declaration`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            object MySingleton {
                val name: String = "singleton"
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals("MySingleton", nodes[0].pathWithName.parts.last())
        assertEquals(NodeType.CLASS, nodes[0].nodeType)
    }

    @Test
    fun `should extract types of generics correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                private val names: List<String> = emptyList()
                private val nameToAge: Map<String, Int> = emptyMap()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.generic("List", listOf(Type.simple("String"))),
                Type.generic("Map", listOf(Type.simple("String"), Type.simple("Int")))
            )
        )
    }

    @Test
    fun `should parse imports and add them to the node's dependencies`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            import kotlin.collections.List
            import kotlin.collections.Map

            class KotlinAnalyzerTest {
                private val names: List<String> = emptyList()
                private val nameToAge: Map<String, Int> = emptyMap()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(3, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.maibornwolff.dependacharta.analysis.analyzers"), true),
            Dependency(Path.fromStringWithDots("kotlin.collections.List")),
            Dependency(Path.fromStringWithDots("kotlin.collections.Map"))
        )
    }

    @Test
    fun `should add implicit dependency on the class's package`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(1, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.maibornwolff.dependacharta.analysis.analyzers"), true)
        )
    }

    @Test
    fun `should extract the superclass of a class correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest : SuperClass() {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.simple("SuperClass")
        )
    }

    @Test
    fun `should extract the interfaces of a class correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest : Interface1, Interface2 {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("Interface1"), Type.simple("Interface2"))
        )
    }

    @Test
    fun `should extract superclass and interfaces together`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest : SuperClass(), Interface1, Interface2 {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("SuperClass"), Type.simple("Interface1"), Type.simple("Interface2"))
        )
    }

    @Test
    fun `should extract constructor calls to usedTypes correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                fun someMethod() {
                    val instance = SomeClass()
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.simple("SomeClass")
        )
    }

    @Test
    fun `should extract static method calls to usedTypes correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                fun someMethod() {
                    SomeClass.someStaticMethod()
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.simple("SomeClass")
        )
    }

    @Test
    fun `should extract companion object access to usedTypes correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                fun someMethod() {
                    val value = SomeClass.CONSTANT
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.simple("SomeClass")
        )
    }

    @Test
    fun `should handle nullable types correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                private val name: String? = null
                private val age: Int? = null
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("Int"))
        )
    }

    @Test
    fun `should handle data class correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            data class Person(val name: String, val age: Int)
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals("Person", nodes[0].pathWithName.parts.last())
        assertEquals(NodeType.CLASS, nodes[0].nodeType)

        val usedTypes = nodes[0].usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("Int"))
        )
    }

    @Test
    fun `should handle wildcard imports correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            import kotlin.collections.*

            class KotlinAnalyzerTest {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(
            Dependency(Path.fromStringWithDots("kotlin.collections"), true)
        )
    }

    @Test
    fun `should detect interface node type correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            interface MyInterface {
                fun doSomething()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals(NodeType.INTERFACE, nodes[0].nodeType)
    }

    @Test
    fun `should handle generic inheritance correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest : BaseClass<String>() {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.generic("BaseClass", listOf(Type.simple("String")))
        )
    }

    @Test
    fun `should handle multiple classes in one file`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class ClassA {
                private val b: ClassB? = null
            }

            class ClassB {
                private val a: ClassA? = null
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        assertEquals(2, report.nodes.size)

        val classA = report.nodes[0]
        assertEquals("ClassA", classA.pathWithName.parts.last())
        assertThat(classA.usedTypes).contains(Type.simple("ClassB"))

        val classB = report.nodes[1]
        assertEquals("ClassB", classB.pathWithName.parts.last())
        assertThat(classB.usedTypes).contains(Type.simple("ClassA"))
    }

    @Test
    fun `should set correct language for nodes`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        assertEquals(SupportedLanguage.KOTLIN, report.nodes.first().language)
    }

    @Test
    fun `should set correct physical path for nodes`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./my/path/File.kt", kotlinCode)).analyze()

        // Assert
        assertEquals("./my/path/File.kt", report.nodes.first().physicalPath)
    }

    @Test
    fun `should handle empty file without declarations`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        assertEquals(0, report.nodes.size)
    }

    @Test
    fun `should extract nested generic types correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class KotlinAnalyzerTest {
                private val data: Map<String, List<Int>> = emptyMap()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.generic(
                "Map",
                listOf(
                    Type.simple("String"),
                    Type.generic("List", listOf(Type.simple("Int")))
                )
            )
        )
    }

    @Test
    fun `should handle enum class correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            enum class Status {
                ACTIVE, INACTIVE, PENDING
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(
            nodes
                .first()
                .pathWithName.parts
                .last()
        ).isEqualTo("Status")
        assertThat(nodes.first().nodeType).isEqualTo(NodeType.ENUM)
    }

    @Test
    fun `should handle enum class implementing interface`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            enum class Status : Comparable<Status> {
                ACTIVE, INACTIVE
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.generic("Comparable", listOf(Type.simple("Status")))
        )
    }

    @Test
    fun `should handle sealed class correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            sealed class Result {
                data class Success(val data: String) : Result()
                data class Error(val message: String) : Result()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(3, nodes.size)
        assertThat(nodes.map { it.pathWithName.parts.last() })
            .containsExactly("Result", "Success", "Error")
    }

    @Test
    fun `should include parent class in path for sealed class nested types`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.excavation.extraction

            sealed class ExtractionStrategy {
                data class FirstChildByType(val type: String) : ExtractionStrategy()
                data class AllChildrenByType(val type: String) : ExtractionStrategy()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(3, nodes.size)

        // The full paths should include the parent class
        val paths = nodes.map { it.pathWithName.withDots() }
        assertThat(paths).containsExactlyInAnyOrder(
            "de.maibornwolff.excavation.extraction.ExtractionStrategy",
            "de.maibornwolff.excavation.extraction.ExtractionStrategy.FirstChildByType",
            "de.maibornwolff.excavation.extraction.ExtractionStrategy.AllChildrenByType"
        )
    }

    @Test
    fun `should handle nested class correctly`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Outer {
                class Inner {
                    val value: String = ""
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(2, nodes.size)
        assertThat(nodes.map { it.pathWithName.parts.last() })
            .containsExactly("Outer", "Inner")
    }

    @Test
    fun `should handle inner class with dependency on outer`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Outer {
                inner class Inner {
                    fun getOuter(): Outer = this@Outer
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(2, nodes.size)

        val innerClass = nodes.last()
        assertThat(innerClass.pathWithName.parts.last()).isEqualTo("Inner")
        assertThat(innerClass.usedTypes).contains(Type.simple("Outer"))
    }

    @Test
    fun `should handle function type properties`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class FunctionHolder {
                val callback: (String) -> Int = { it.length }
                val action: () -> Unit = {}
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals("FunctionHolder", nodes[0].pathWithName.parts.last())
    }

    @Test
    fun `should handle file without package declaration`() {
        // Arrange
        val kotlinCode = """
            class NoPackageClass {
                val name: String = ""
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals("NoPackageClass", nodes[0].pathWithName.parts.last())
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
        assertThat(nodes[0].dependencies).noneMatch { it.path.parts.isEmpty() }
    }

    @Test
    fun `should handle class with companion object`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class WithCompanion {
                companion object {
                    const val CONSTANT: String = "value"
                    fun create(): WithCompanion = WithCompanion()
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals("WithCompanion", nodes[0].pathWithName.parts.last())
    }

    @Test
    fun `should handle function without return type`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class NoReturnType {
                fun doSomething() {
                    println("hello")
                }

                fun withParam(value: String) {
                    println(value)
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
    }

    @Test
    fun `should handle property without explicit type`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class InferredType {
                val name = "test"
                val number = 42
                val list = listOf(1, 2, 3)
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle suspend functions`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class SuspendClass {
                suspend fun fetchData(): String {
                    return "data"
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
    }

    @Test
    fun `should handle extension functions`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class ExtensionHolder {
                fun String.addPrefix(): String = "prefix_" + this
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle class annotation without parameters`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            @Deprecated
            class DeprecatedClass {
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("Deprecated"))
    }

    @Test
    fun `should handle class with init block`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class WithInit {
                val value: String

                init {
                    value = "initialized"
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
    }

    @Test
    fun `should handle lateinit property`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class WithLateinit {
                lateinit var name: String
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
    }

    @Test
    fun `should handle by lazy property`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class WithLazy {
                val name: String by lazy { "lazy value" }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
    }

    @Test
    fun `should handle vararg parameter`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class WithVararg {
                fun process(vararg values: String) {}
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
    }

    @Test
    fun `should handle star projection in generics`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class WithStarProjection {
                val items: List<*> = emptyList<Any>()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle type alias usage`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class WithTypeUsage {
                val map: HashMap<String, Int> = hashMapOf()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(
            Type.generic("HashMap", listOf(Type.simple("String"), Type.simple("Int")))
        )
    }

    @Test
    fun `should handle abstract class`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            abstract class AbstractClass {
                abstract fun doSomething(): String
                fun concreteMethod(): Int = 42
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals(NodeType.CLASS, nodes[0].nodeType)
    }

    @Test
    fun `should handle interface with default implementation`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            interface DefaultInterface {
                fun required(): String
                fun optional(): Int = 42
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals(NodeType.INTERFACE, nodes[0].nodeType)
    }

    @Test
    fun `should handle class with secondary constructor`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class WithSecondaryConstructor(val name: String) {
                var age: Int = 0

                constructor(name: String, age: Int) : this(name) {
                    this.age = age
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("Int"))
        )
    }

    @Test
    fun `should handle value class`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            @JvmInline
            value class Password(val value: String)
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
    }

    @Test
    fun `should handle operator overloading`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Vector(val x: Int, val y: Int) {
                operator fun plus(other: Vector): Vector = Vector(x + other.x, y + other.y)
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).containsAll(
            listOf(Type.simple("Int"), Type.simple("Vector"))
        )
    }

    @Test
    fun `should handle infix function`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Pair(val first: Int, val second: Int) {
                infix fun and(other: Pair): Pair = Pair(first + other.first, second + other.second)
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).containsAll(
            listOf(Type.simple("Int"), Type.simple("Pair"))
        )
    }

    @Test
    fun `should handle reified type parameter`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class TypeChecker {
                inline fun <reified T> isInstance(value: Any): Boolean = value is T
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle expression body function`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class ExpressionBody {
                fun double(x: Int): Int = x * 2
                fun greet(name: String): String = "Hello, " + name
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).containsAll(
            listOf(Type.simple("Int"), Type.simple("String"))
        )
    }

    @Test
    fun `should handle generic class with constraints`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class GenericClass<T : Comparable<T>>(val value: T) {
                fun compare(other: T): Int = value.compareTo(other)
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle delegation pattern`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            interface Base {
                fun print()
            }

            class BaseImpl(val x: Int) : Base {
                override fun print() {}
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(2, nodes.size)
    }

    @Test
    fun `should handle multiple annotations on same element`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class MultiAnnotated {
                @Deprecated("old")
                @Suppress("UNCHECKED_CAST")
                @JvmField
                val field: String = ""
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).containsAll(
            listOf(Type.simple("Deprecated"), Type.simple("Suppress"), Type.simple("JvmField"))
        )
    }

    @Test
    fun `should handle class delegation with by keyword`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            interface Printable {
                fun print()
            }

            class PrintableDelegate : Printable {
                override fun print() {}
            }

            class DelegatingClass(delegate: Printable) : Printable by delegate
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(3, nodes.size)
        assertThat(nodes.map { it.pathWithName.parts.last() })
            .containsExactly("Printable", "PrintableDelegate", "DelegatingClass")
    }

    @Test
    fun `should handle functional interface`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            interface Clickable {
                fun onClick()
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals(NodeType.INTERFACE, nodes[0].nodeType)
    }

    @Test
    fun `should handle annotation class`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            annotation class MyAnnotation(val message: String)
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertEquals(NodeType.ANNOTATION, nodes[0].nodeType)
    }

    @Test
    fun `should handle open class`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            open class OpenClass {
                open fun doSomething(): String = "base"
            }

            class ChildClass : OpenClass() {
                override fun doSomething(): String = "child"
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(2, nodes.size)
        assertThat(nodes[1].usedTypes).contains(Type.simple("OpenClass"))
    }

    @Test
    fun `should handle property with getter and setter`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class PropertyClass {
                var name: String = ""
                    get() = field.uppercase()
                    set(value) {
                        field = value.trim()
                    }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).contains(Type.simple("String"))
    }

    @Test
    fun `should handle class with type parameters`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Container<T>(val item: T) {
                fun get(): T = item
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle crossinline and noinline lambdas`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class LambdaClass {
                inline fun execute(crossinline action: () -> Unit, noinline callback: () -> Unit) {
                    action()
                    callback()
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle expect and actual declarations stub`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Platform {
                val name: String = "JVM"
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle out and in variance`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            interface Producer<out T> {
                fun produce(): T
            }

            interface Consumer<in T> {
                fun consume(item: T)
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(2, nodes.size)
    }

    @Test
    fun `should handle where clause constraints`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Processor<T> where T : Comparable<T>, T : CharSequence {
                fun process(item: T): Int = item.length
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle destructuring declarations`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            data class Point(val x: Int, val y: Int)

            class Processor {
                fun process(p: Point) {
                    val (x, y) = p
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(2, nodes.size)
    }

    @Test
    fun `should handle context receivers`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class ContextClass {
                fun String.printWithLength(): Unit = println(this)
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle typealias`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class TypeUser {
                val handler: (String) -> Int = { it.length }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
    }

    @Test
    fun `should handle backing property pattern`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class BackingProp {
                private var _items: MutableList<String> = mutableListOf()
                val items: List<String>
                    get() = _items
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(1, nodes.size)
        assertThat(nodes[0].usedTypes).containsAll(
            listOf(
                Type.generic("MutableList", listOf(Type.simple("String"))),
                Type.generic("List", listOf(Type.simple("String")))
            )
        )
    }

    @Test
    fun `should extract qualified nested type constructor call`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Consumer {
                fun useNestedType() {
                    val strategy = ExtractionStrategy.AllChildrenByType("identifier")
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        val typeNames = usedTypes.map { it.name }
        assertThat(typeNames).contains("ExtractionStrategy.AllChildrenByType")
        assertThat(typeNames).contains("ExtractionStrategy")
    }

    @Test
    fun `should extract qualified nested type in map value - real world case`() {
        // Arrange
        // This reproduces the exact pattern from JavaExtractionDictionary.kt:
        // INFERRED_PARAMETERS to ExtractionStrategy.AllChildrenByType(IDENTIFIER)
        val kotlinCode = """
            package de.maibornwolff.treesitter.excavationsite.languages.java.extraction

            import de.maibornwolff.treesitter.excavationsite.extraction.ExtractionStrategy

            object JavaExtractionDictionary {
                private const val IDENTIFIER = "identifier"
                private const val INFERRED_PARAMETERS = "inferred_parameters"

                val multiIdentifierMethods: Map<String, ExtractionStrategy> = mapOf(
                    INFERRED_PARAMETERS to ExtractionStrategy.AllChildrenByType(IDENTIFIER)
                )
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        val typeNames = usedTypes.map { it.name }
        // Must extract the qualified nested type
        assertThat(typeNames).contains("ExtractionStrategy.AllChildrenByType")
    }

    @Test
    fun `should extract qualified nested type property access`() {
        // Arrange
        val kotlinCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers

            class Consumer {
                fun useNestedType() {
                    val value = MyEnum.Entry.CONSTANT
                }
            }
        """.trimIndent()

        // Act
        val report = KotlinAnalyzer(FileInfo(SupportedLanguage.KOTLIN, "./path", kotlinCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        val typeNames = usedTypes.map { it.name }
        // MyEnum.Entry.CONSTANT should extract MyEnum.Entry as the type
        assertThat(typeNames).contains("MyEnum.Entry")
        assertThat(typeNames).contains("MyEnum")
    }
}
