package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FileReportTest {
    @Test
    fun `resolveTypes should find project and filter out language dependencies`() {
        // Arrange
        val projectDictionary = mapOf(
            "TypeA" to listOf(Path(listOf("com", "example", "TypeA"))),
            "TypeB" to listOf(Path(listOf("com", "example", "TypeB")))
        )
        val languageDictionary = mapOf(
            "TypeC" to Path(listOf("java", "lang", "TypeC"))
        )
        val node = Node(
            pathWithName = Path(listOf("com", "example", "Node")),
            physicalPath = "src/com/example/Node.java",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(
                Dependency(Path(listOf("com", "example", "TypeA"))),
                Dependency(Path(listOf("com", "example")), isWildcard = true)
            ),
            usedTypes = setOf(Type.simple("TypeA"), Type.simple("TypeB"), Type.simple("TypeC"))
        )

        // Act
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // Assert
        assertThat(resolvedNode.dependencies).containsExactlyInAnyOrder(
            Dependency(Path(listOf("com", "example", "TypeA"))),
            Dependency(Path(listOf("com", "example", "TypeB"))),
            Dependency(Path(listOf("com", "example")), isWildcard = true)
        )
    }

    @Test
    fun `resolveTypes should differentiate between internal and external dependencies`() {
        // Arrange
        val internalPathTypeA = Path(listOf("com", "example", "TypeA"))
        val internalPathTypeB = Path(listOf("com", "example", "TypeB"))
        val projectDictionary = mapOf(
            "TypeA" to listOf(internalPathTypeA),
            "TypeB" to listOf(internalPathTypeB)
        )
        val externalPathTypeC = Path(listOf("some", "unknown", "TypeC"))
        val languageDictionary = mapOf<String, Path>()
        val node = Node(
            pathWithName = Path(listOf("com", "example", "Node")),
            physicalPath = "src/com/example/Node.java",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(
                Dependency(internalPathTypeA),
                Dependency(Path(listOf("com", "example")), isWildcard = true),
                Dependency(externalPathTypeC)
            ),
            usedTypes = setOf(Type.simple("TypeA"), Type.simple("TypeB"), Type.simple("TypeC"))
        )

        // Act
        val resolvedNode = node.resolveTypes(
            projectDictionary,
            languageDictionary,
            setOf(internalPathTypeA.withDots(), internalPathTypeB.withDots())
        )

        // Assert
        assertThat(resolvedNode.resolvedNodeDependencies.internalDependencies).containsExactlyInAnyOrder(
            Dependency(internalPathTypeA),
            Dependency(internalPathTypeB)
        )
        assertThat(resolvedNode.resolvedNodeDependencies.externalDependencies).containsExactlyInAnyOrder(
            Dependency(externalPathTypeC)
        )
    }

    @Test
    fun `resolveTypes with unknown type should create only unknown type dependency`() {
        // Arrange
        val unknownType = "UnknownType"
        val projectDictionary = emptyMap<String, List<Path>>()
        val languageDictionary = emptyMap<String, Path>()
        val node = Node(
            pathWithName = Path(listOf("com", "example", "Node")),
            physicalPath = "src/com/example/Node.java",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = emptySet(),
            usedTypes = setOf(Type.simple(unknownType))
        )

        // Act
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // Assert
        assertThat(resolvedNode.dependencies).containsExactly(Dependency(Path.unknown(unknownType)))
        assertThat(resolvedNode.usedTypes).containsExactly(
            Type.simple(unknownType).copy(resolvedPath = Path.unknown(unknownType))
        )
    }
}
