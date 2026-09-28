package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class NodeTest {
    @Test
    fun `should resolve types of usedTypes correctly`() {
        // Arrange
        val bookPath = Path(listOf("de", "maibornwolff", "dependacharta", "analysis", "Model", "Book"))
        val stringPath = Path(listOf("java", "lang", "String"))
        val intPath = Path(listOf("int"))

        val projectDictionary = mapOf(
            "Book" to listOf(bookPath)
        )

        val languageDictionary = mapOf(
            "String" to stringPath,
            "int" to intPath
        )

        val node = Node(
            pathWithName = Path(listOf("de", "maibornwolff", "dependacharta", "analysis", "analyzers", "JavaAnalyzerTest")),
            physicalPath = "./path",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(Dependency(bookPath)),
            usedTypes = setOf(
                Type.simple("String"),
                Type.simple("int"),
                Type.simple("Book")
            )
        )

        // Act
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // Assert
        val usedTypes = resolvedNode.usedTypes
        val paths = usedTypes.mapNotNull { it.resolvedPath }
        Assertions.assertThat(paths).containsExactlyInAnyOrder(stringPath, intPath, bookPath)
    }

    @Test
    fun `should resolve scoped types of usedTypes correctly`() {
        // Arrange
        val bookPath = Path(listOf("de", "maibornwolff", "dependacharta", "analysis", "Model", "Book"))
        val stringPath = Path(listOf("java", "lang", "String"))
        val intPath = Path(listOf("int"))

        val projectDictionary = mapOf(
            "Book" to listOf(bookPath)
        )

        val languageDictionary = mapOf(
            "String" to stringPath,
            "int" to intPath
        )

        val node = Node(
            pathWithName = Path(listOf("de", "maibornwolff", "dependacharta", "analysis", "analyzers", "JavaAnalyzerTest")),
            physicalPath = "./path",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(Dependency(bookPath)),
            usedTypes = setOf(
                Type.simple("String"),
                Type.simple("int"),
                Type.simple("Model.Book")
            )
        )

        // Act
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // Assert
        val usedTypes = resolvedNode.usedTypes
        val paths = usedTypes.mapNotNull { it.resolvedPath }
        Assertions.assertThat(paths).containsExactlyInAnyOrder(stringPath, intPath, bookPath)
        Assertions.assertThat(usedTypes.map { it.name }).containsExactlyInAnyOrder("String", "int", "Book")
    }

    @Test
    fun `should resolve fully qualified types of usedTypes correctly`() {
        // Arrange
        val bookPath = Path("analysis.Model.Book".split("."))
        val anotherBookPath = Path("analysis.OtherModel.Book".split("."))
        val projectDictionary = mapOf("Book" to listOf(bookPath, anotherBookPath))
        val node = Node(
            pathWithName = Path(listOf("de")),
            physicalPath = "./path",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = emptySet(),
            usedTypes = setOf(
                Type.simple("analysis.Model.Book")
            )
        )

        // Act
        val languageDictionary = emptyMap<String, Path>()
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // Assert
        val usedTypes = resolvedNode.usedTypes
        val paths = usedTypes.mapNotNull { it.resolvedPath }
        Assertions.assertThat(paths).containsExactlyInAnyOrder(bookPath)
        Assertions.assertThat(usedTypes.map { it.name }).containsExactlyInAnyOrder("Book")
    }

    @Test
    fun `should resolve partly qualified types of usedTypes correctly`() {
        // Arrange
        val bookPath = Path("analysis.Model.Book".split("."))
        val anotherBookPath = Path("analysis.OtherModel.Book".split("."))
        val analysisPath = Path("analysis".split("."))
        val projectDictionary = mapOf("Book" to listOf(bookPath, anotherBookPath))
        val node = Node(
            pathWithName = Path(listOf("de")),
            physicalPath = "./path",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(Dependency(analysisPath, true)),
            usedTypes = setOf(
                Type.simple("OtherModel.Book")
            )
        )

        // Act
        val languageDictionary = emptyMap<String, Path>()
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // Assert
        val usedTypes = resolvedNode.usedTypes
        val paths = usedTypes.mapNotNull { it.resolvedPath }
        Assertions.assertThat(paths).containsExactlyInAnyOrder(anotherBookPath)
        Assertions.assertThat(usedTypes.map { it.name }).containsExactlyInAnyOrder("Book")
    }

    @Test
    fun `should resolve qualified nested class types accessed via parent class`() {
        // Simulates: ExtractionStrategy.AllChildrenByType("identifier")
        // where AllChildrenByType is a nested class inside ExtractionStrategy
        val parentPath = Path("de.extraction.ExtractionStrategy".split("."))
        val nestedPath = Path("de.extraction.ExtractionStrategy.AllChildrenByType".split("."))
        val extractionImport = Path("de.extraction.ExtractionStrategy".split("."))

        val projectDictionary = mapOf(
            "ExtractionStrategy" to listOf(parentPath),
            "AllChildrenByType" to listOf(nestedPath)
        )
        val languageDictionary = emptyMap<String, Path>()

        val node = Node(
            pathWithName = Path(listOf("de", "consumer", "JavaExtractionDictionary")),
            physicalPath = "./path",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.KOTLIN,
            dependencies = setOf(Dependency(extractionImport)),
            usedTypes = setOf(
                // This is what gets extracted from: ExtractionStrategy.AllChildrenByType("identifier")
                Type.simple("ExtractionStrategy.AllChildrenByType"),
                Type.simple("ExtractionStrategy")
            )
        )

        // Act
        val resolvedNode = node.resolveTypes(
            projectDictionary,
            languageDictionary,
            setOf(parentPath.withDots(), nestedPath.withDots())
        )

        // Assert
        val internalDeps = resolvedNode.resolvedNodeDependencies.internalDependencies
        // Should resolve both the parent and nested class as dependencies
        Assertions.assertThat(internalDeps.map { it.path }).containsExactlyInAnyOrder(parentPath, nestedPath)
    }

    @Test
    fun `should resolve nested class when qualified name matches parent import path`() {
        // Edge case: When using Parent.Nested, the qualified name starts with the imported parent
        val parentPath = Path("pkg.Parent".split("."))
        val nestedPath = Path("pkg.Parent.Nested".split("."))

        val projectDictionary = mapOf(
            "Parent" to listOf(parentPath),
            "Nested" to listOf(nestedPath)
        )
        val languageDictionary = emptyMap<String, Path>()

        val node = Node(
            pathWithName = Path(listOf("consumer", "Consumer")),
            physicalPath = "./path",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.KOTLIN,
            dependencies = setOf(Dependency(parentPath)), // import pkg.Parent
            usedTypes = setOf(Type.simple("Parent.Nested"))
        )

        // Act
        val resolvedNode = node.resolveTypes(
            projectDictionary,
            languageDictionary,
            setOf(parentPath.withDots(), nestedPath.withDots())
        )

        // Assert
        val internalDeps = resolvedNode.resolvedNodeDependencies.internalDependencies
        Assertions.assertThat(internalDeps.map { it.path }).contains(nestedPath)
    }

    @Test
    fun `should resolve sealed class nested type - real world JavaExtractionDictionary case`() {
        // Exact scenario from TreesitterLibrary (after fix):
        // - ExtractionStrategy sealed class at: de.maibornwolff.treesitter.excavationsite.extraction.ExtractionStrategy
        // - AllChildrenByType nested class at: de.maibornwolff.treesitter.excavationsite.extraction.ExtractionStrategy.AllChildrenByType
        //   (now includes parent class in path)
        // - JavaExtractionDictionary imports ExtractionStrategy and uses ExtractionStrategy.AllChildrenByType(...)

        val extractionStrategyPath = Path("de.maibornwolff.treesitter.excavationsite.extraction.ExtractionStrategy".split("."))
        // After fix: nested class path includes parent class
        val allChildrenByTypePath =
            Path("de.maibornwolff.treesitter.excavationsite.extraction.ExtractionStrategy.AllChildrenByType".split("."))

        val projectDictionary = mapOf(
            "ExtractionStrategy" to listOf(extractionStrategyPath),
            "AllChildrenByType" to listOf(allChildrenByTypePath)
        )
        val languageDictionary = emptyMap<String, Path>()

        val node = Node(
            pathWithName = Path("de.maibornwolff.treesitter.excavationsite.languages.java.extraction.JavaExtractionDictionary".split(".")),
            physicalPath = "./path",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.KOTLIN,
            dependencies = setOf(Dependency(extractionStrategyPath)), // import ExtractionStrategy
            usedTypes = setOf(
                Type.simple("ExtractionStrategy.AllChildrenByType"),
                Type.simple("ExtractionStrategy"),
                Type.simple("Map")
            )
        )

        // Act
        val resolvedNode = node.resolveTypes(
            projectDictionary,
            languageDictionary,
            setOf(extractionStrategyPath.withDots(), allChildrenByTypePath.withDots())
        )

        // Assert
        val internalDeps = resolvedNode.resolvedNodeDependencies.internalDependencies

        // Should resolve BOTH ExtractionStrategy AND AllChildrenByType as dependencies
        Assertions.assertThat(internalDeps.map { it.path.withDots() }).containsExactlyInAnyOrder(
            extractionStrategyPath.withDots(),
            allChildrenByTypePath.withDots()
        )
    }

    @Test
    fun `should filter out self-references when resolving types`() {
        // Arrange
        val hitPointsPath = Path(listOf("de", "domain", "model", "HitPoints"))
        val packagePath = Path(listOf("de", "domain", "model"))

        val projectDictionary = mapOf(
            "HitPoints" to listOf(hitPointsPath)
        )
        val languageDictionary = emptyMap<String, Path>()

        val node = Node(
            pathWithName = hitPointsPath,
            physicalPath = "./HitPoints.java",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(Dependency(packagePath, isWildcard = true)),
            usedTypes = setOf(Type.simple("HitPoints"))
        )

        // Act
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf(hitPointsPath.withDots()))

        // Assert
        val internalDeps = resolvedNode.resolvedNodeDependencies.internalDependencies
        Assertions.assertThat(internalDeps).isEmpty()
    }

    @Test
    fun `should prefer an explicit import over a same-package type of the same name`() {
        // Arrange
        val importedFoo = Path(listOf("com", "b", "Foo"))
        val projectDictionary = mapOf("Foo" to listOf(Path(listOf("com", "a", "Foo")), importedFoo))
        val node = Node.build(
            pathWithName = Path(listOf("com", "a", "Bar")),
            dependencies = setOf(Dependency(importedFoo)),
            usedTypes = setOf(Type.simple("Foo"))
        )

        // Act
        val resolved = node.resolveTypes(projectDictionary, emptyMap(), setOf())

        // Assert
        Assertions.assertThat(resolved.usedTypes.single().resolvedPath).isEqualTo(importedFoo)
    }
}
