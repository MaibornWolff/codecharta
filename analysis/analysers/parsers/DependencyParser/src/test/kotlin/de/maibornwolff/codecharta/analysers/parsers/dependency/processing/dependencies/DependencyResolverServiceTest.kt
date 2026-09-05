package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeDependencies
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.build
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model.NodeInformation
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class DependencyResolverServiceTest {
    @Test
    fun `should resolve used type from same file`() {
        // Arrange
        val aClass = Node.build(
            pathWithName = Path(listOf("de", "mw", "A")),
            physicalPath = "de/mw/A.java",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(
                Dependency(Path(listOf("de", "mw")), true)
            ),
            usedTypes = setOf(Type("B", TypeOfUsage.USAGE, emptyList()))
        )

        val bClass = Node.build(
            pathWithName = Path(listOf("de", "mw", "B")),
            physicalPath = "de/mw/B.java",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(
                Dependency(Path(listOf("de", "mw")), true)
            ),
            usedTypes = setOf()
        )

        val report = FileReport(
            nodes = listOf(aClass, bClass)
        )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val expected = aClass.copy(
            resolvedNodeDependencies = NodeDependencies(
                internalDependencies = setOf(Dependency(bClass.pathWithName)),
                externalDependencies = emptySet()
            )
        )
        val actual = resolvedNodes.first { it.pathWithName.parts.last() == "A" }

        assertEquals(actual.resolvedNodeDependencies.internalDependencies, expected.resolvedNodeDependencies.internalDependencies)
    }

    @Test
    fun `should resolve used type from relative wildcard dependency`() {
        // Arrange
        val address = Node.build(
            pathWithName = Path(listOf("cpu", "aarch64", "assembler_aarch64_inline_hpp", "Address")),
            physicalPath = "cpu/aarch64/assembler_aarch64.inline.hpp",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.CPP,
            dependencies = setOf(
                Dependency(Path(listOf("asm", "assembler_inline_hpp")), true)
            ),
            usedTypes = setOf(Type("Assembler", TypeOfUsage.USAGE, emptyList()))
        )
        val assembler = Node.build(
            pathWithName = Path(listOf("foo", "bar", "anywhere", "asm", "assembler_inline_hpp", "Assembler")),
            physicalPath = "foo/bar/anywhere/asm/assembler.inline.hpp",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.CPP,
            dependencies = setOf(),
            usedTypes = setOf()
        )
        val anotherAssembler = Node.build(
            pathWithName = Path(listOf("de", "somewhere", "cpu", "assembler_aarch64_inline_hpp", "Assembler")),
            physicalPath = "de/somewhere/cpu/assembler_aarch64.inline.hpp",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.CPP,
            dependencies = setOf(),
            usedTypes = setOf()
        )
        val report = FileReport(
            nodes = listOf(anotherAssembler, address, assembler)
        )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val expected = address.copy(
            resolvedNodeDependencies = NodeDependencies(
                internalDependencies = setOf(Dependency(assembler.pathWithName)),
                externalDependencies = emptySet()
            )
        )
        val actual = resolvedNodes.first { it.pathWithName.parts.last() == "Address" }

        assertEquals(actual.resolvedNodeDependencies.internalDependencies, expected.resolvedNodeDependencies.internalDependencies)
    }

    @Test
    fun `Transforms lists of nodes to correct dictionary`() {
        // Arrange
        val node1 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "main")),
            physicalPath = "de/maibornwolff/main"
        )

        val node2 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "helper")),
            physicalPath = "de/maibornwolff/helper"
        )

        // Act
        val dictionary = DependencyResolverService.getDictionary(listOf(node1, node2))

        // Assert
        val expectedDictionary = mapOf("main" to listOf(node1.pathWithName), "helper" to listOf(node2.pathWithName))
        assertThat(dictionary).isEqualTo(expectedDictionary)
    }

    @Test
    fun `Transforms lists of nodes to correct known paths`() {
        // Arrange
        val node1 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "main")),
            physicalPath = "de/maibornwolff/main"
        )

        val node2 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "helper")),
            physicalPath = "de/maibornwolff/helper"
        )

        // Act
        val dictionary = DependencyResolverService.getKnownNodePaths(listOf(node1, node2))

        // Assert
        val expectedDictionary = setOf(node1.pathWithName.withDots(), node2.pathWithName.withDots())
        assertThat(dictionary).isEqualTo(expectedDictionary)
    }

    @Test
    fun `Correctly resolves nodes with dictionary and known paths`() {
        // Arrange
        val node1 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "main")),
            physicalPath = "de/maibornwolff/main"
        )

        val node2 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "helper")),
            physicalPath = "de/maibornwolff/helper"
        )

        val fileReport1 = FileReport(listOf(node1))
        val fileReport2 = FileReport(listOf(node2))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(fileReport1, fileReport2))

        // Assert
        val expectedResolvedNodes = resolvedNodes.map { it.pathWithName }
        assertThat(resolvedNodes).hasSize(2)
        assertThat(expectedResolvedNodes).containsExactlyInAnyOrder(node1.pathWithName, node2.pathWithName)
    }

    @Test
    fun `should resolve Kotlin node and filter out standard library types`() {
        // Arrange
        val kotlinClass = Node.build(
            pathWithName = Path(listOf("com", "example", "MyClass")),
            physicalPath = "com/example/MyClass.kt",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.KOTLIN,
            dependencies = setOf(
                Dependency(Path(listOf("com", "example")), true)
            ),
            usedTypes = setOf(
                Type("String", TypeOfUsage.USAGE, emptyList()),
                Type("List", TypeOfUsage.USAGE, emptyList()),
                Type("OtherClass", TypeOfUsage.USAGE, emptyList())
            )
        )

        val otherClass = Node.build(
            pathWithName = Path(listOf("com", "example", "OtherClass")),
            physicalPath = "com/example/OtherClass.kt",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.KOTLIN,
            dependencies = setOf(
                Dependency(Path(listOf("com", "example")), true)
            ),
            usedTypes = setOf()
        )

        val report = FileReport(
            nodes = listOf(kotlinClass, otherClass)
        )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val myClassResolved = resolvedNodes.first { it.pathWithName.parts.last() == "MyClass" }
        assertThat(myClassResolved.resolvedNodeDependencies.internalDependencies)
            .containsExactly(Dependency(otherClass.pathWithName))
        assertThat(myClassResolved.resolvedNodeDependencies.externalDependencies)
            .isEmpty()
    }

    @Test
    fun `should resolve Go node and filter out standard library types`() {
        // Arrange
        val goStruct = Node.build(
            pathWithName = Path(listOf("myapp", "handler", "Server")),
            physicalPath = "handler/server.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                Dependency(Path(listOf("myapp", "handler")), true)
            ),
            usedTypes = setOf(
                Type("error", TypeOfUsage.USAGE, emptyList()),
                Type("string", TypeOfUsage.USAGE, emptyList()),
                Type("Handler", TypeOfUsage.USAGE, emptyList())
            )
        )

        val handler = Node.build(
            pathWithName = Path(listOf("myapp", "handler", "Handler")),
            physicalPath = "handler/handler.go",
            nodeType = NodeType.INTERFACE,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                Dependency(Path(listOf("myapp", "handler")), true)
            ),
            usedTypes = setOf()
        )

        val report = FileReport(nodes = listOf(goStruct, handler))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val serverResolved = resolvedNodes.first { it.pathWithName.parts.last() == "Server" }
        assertThat(serverResolved.resolvedNodeDependencies.internalDependencies)
            .containsExactly(Dependency(handler.pathWithName))
        assertThat(serverResolved.resolvedNodeDependencies.externalDependencies)
            .isEmpty()
    }

    @Test
    fun `should resolve C# node and filter out standard library types`() {
        // Arrange
        val csClass = Node.build(
            pathWithName = Path(listOf("MyApp", "Services", "UserService")),
            physicalPath = "Services/UserService.cs",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.C_SHARP,
            dependencies = setOf(
                Dependency(Path(listOf("MyApp", "Services")), true)
            ),
            usedTypes = setOf(
                Type("string", TypeOfUsage.USAGE, emptyList()),
                Type("bool", TypeOfUsage.USAGE, emptyList()),
                Type("UserRepository", TypeOfUsage.USAGE, emptyList())
            )
        )

        val repository = Node.build(
            pathWithName = Path(listOf("MyApp", "Services", "UserRepository")),
            physicalPath = "Services/UserRepository.cs",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.C_SHARP,
            dependencies = setOf(
                Dependency(Path(listOf("MyApp", "Services")), true)
            ),
            usedTypes = setOf()
        )

        val report = FileReport(nodes = listOf(csClass, repository))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val serviceResolved = resolvedNodes.first { it.pathWithName.parts.last() == "UserService" }
        assertThat(serviceResolved.resolvedNodeDependencies.internalDependencies)
            .containsExactly(Dependency(repository.pathWithName))
        assertThat(serviceResolved.resolvedNodeDependencies.externalDependencies)
            .isEmpty()
    }

    @Test
    fun `Maps Node to NodeInformation`() {
        // Arrange
        val node = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "main")),
            resolvedNodeDependencies = NodeDependencies(
                setOf(Dependency(Path(listOf("de", "maibornwolff", "helper")))),
                emptySet()
            )
        )

        // Act
        val nodeInformation = DependencyResolverService.mapNodeInfo(node)

        // Assert
        val expected = NodeInformation(
            id = "de.maibornwolff.main",
            dependencies = setOf("de.maibornwolff.helper")
        )

        assertThat(nodeInformation).isEqualTo(expected)
    }
}
