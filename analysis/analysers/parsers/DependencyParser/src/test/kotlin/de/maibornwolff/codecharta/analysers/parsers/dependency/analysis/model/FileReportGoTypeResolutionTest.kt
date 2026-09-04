package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FileReportGoTypeResolutionTest {
    @Test
    fun `resolveTypes should handle Go qualified types with package prefix`() {
        // given
        val projectDictionary = mapOf(
            "User" to listOf(Path(listOf("github", "com", "myproject", "models", "User")))
        )
        val languageDictionary = emptyMap<String, Path>()
        val node = Node.build(
            pathWithName = Path(listOf("github", "com", "myproject", "services", "UserService")),
            physicalPath = "services/UserService.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                Dependency(Path(listOf("github", "com", "myproject", "models")))
            ),
            usedTypes = setOf(Type.simple("models.User"))
        )

        // when
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // then
        val expectedUserPath = Path(listOf("github", "com", "myproject", "models", "User"))
        assertThat(resolvedNode.usedTypes.first().resolvedPath).isEqualTo(expectedUserPath)
        assertThat(resolvedNode.dependencies).contains(Dependency(expectedUserPath))
    }

    @Test
    fun `resolveTypes should handle Go qualified types with complex module imports`() {
        // given
        val projectDictionary = mapOf(
            "Response" to listOf(Path(listOf("github", "com", "gin-gonic", "gin", "Response")))
        )
        val languageDictionary = emptyMap<String, Path>()
        val node = Node.build(
            pathWithName = Path(listOf("github", "com", "myproject", "handlers", "UserHandler")),
            physicalPath = "handlers/UserHandler.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                Dependency(Path(listOf("github", "com", "gin-gonic", "gin")))
            ),
            usedTypes = setOf(Type.simple("gin.Response"))
        )

        // when
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // then
        val expectedResponsePath = Path(listOf("github", "com", "gin-gonic", "gin", "Response"))
        assertThat(resolvedNode.usedTypes.first().resolvedPath).isEqualTo(expectedResponsePath)
        assertThat(resolvedNode.dependencies).contains(Dependency(expectedResponsePath))
    }

    @Test
    fun `resolveTypes should handle simple Go types with wildcard imports`() {
        // given
        val projectDictionary = mapOf(
            "User" to listOf(Path(listOf("github", "com", "myproject", "models", "User")))
        )
        val languageDictionary = emptyMap<String, Path>()
        val node = Node.build(
            pathWithName = Path(listOf("github", "com", "myproject", "services", "UserService")),
            physicalPath = "services/UserService.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                Dependency(Path(listOf("github", "com", "myproject", "models")), isWildcard = true)
            ),
            usedTypes = setOf(Type.simple("User")) // No package qualifier
        )

        // when
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // then
        val expectedUserPath = Path(listOf("github", "com", "myproject", "models", "User"))
        assertThat(resolvedNode.usedTypes.first().resolvedPath).isEqualTo(expectedUserPath)
        assertThat(resolvedNode.dependencies).contains(Dependency(expectedUserPath))
    }

    @Test
    fun `resolveTypes should handle complex Go qualified types with full module paths`() {
        // given - This demonstrates the power of the generic approach
        val projectDictionary = mapOf(
            "User" to listOf(Path(listOf("github", "com", "myproject", "models", "User")))
        )
        val languageDictionary = emptyMap<String, Path>()
        val node = Node.build(
            pathWithName = Path(listOf("github", "com", "myproject", "services", "UserService")),
            physicalPath = "services/UserService.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                Dependency(Path(listOf("github", "com", "myproject", "models")), isWildcard = true)
            ),
            usedTypes = setOf(Type.simple("github.com.myproject.models.User"))
        )

        // when
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // then - Generic approach extracts "User" and resolves it correctly
        val expectedUserPath = Path(listOf("github", "com", "myproject", "models", "User"))
        assertThat(resolvedNode.usedTypes.first().resolvedPath).isEqualTo(expectedUserPath)
        assertThat(resolvedNode.dependencies).contains(Dependency(expectedUserPath))
    }

    @Test
    fun `resolveTypes should handle Go dot imports with unqualified types`() {
        // given - Go dot import: import . "github.com/myproject/models"
        val projectDictionary = mapOf(
            "User" to listOf(Path(listOf("github", "com", "myproject", "models", "User")))
        )
        val languageDictionary = emptyMap<String, Path>()
        val node = Node.build(
            pathWithName = Path(listOf("github", "com", "myproject", "services", "UserService")),
            physicalPath = "services/UserService.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                // Dot import - all exports available without qualification
                Dependency(Path(listOf("github", "com", "myproject", "models")), isDotImport = true)
            ),
            usedTypes = setOf(Type.simple("User")) // Unqualified usage due to dot import
        )

        // when
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // then - Should resolve User to models.User even though it's unqualified
        val expectedUserPath = Path(listOf("github", "com", "myproject", "models", "User"))
        assertThat(resolvedNode.usedTypes.first().resolvedPath).isEqualTo(expectedUserPath)
        assertThat(resolvedNode.dependencies).contains(Dependency(expectedUserPath))
    }

    @Test
    fun `resolveTypes should handle Go dot imports with multiple packages`() {
        // given - Multiple dot imports: import . "math"; import . "github.com/myproject/models"
        val projectDictionary = mapOf(
            "Sin" to listOf(Path(listOf("math", "Sin"))), // Built-in math package
            "User" to listOf(Path(listOf("github", "com", "myproject", "models", "User")))
        )
        val languageDictionary = mapOf(
            "Sin" to Path(listOf("math", "Sin")) // Math is a language built-in
        )
        val node = Node.build(
            pathWithName = Path(listOf("github", "com", "myproject", "services", "UserService")),
            physicalPath = "services/UserService.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                // Dot import for math (built-in)
                Dependency(Path(listOf("math")), isDotImport = true),
                // Dot import for models (project package)
                Dependency(Path(listOf("github", "com", "myproject", "models")), isDotImport = true)
            ),
            usedTypes = setOf(
                Type.simple("Sin"), // From math package - should resolve to language built-in
                Type.simple("User") // From models package - should resolve to project type
            )
        )

        // when
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // then - Should resolve both types correctly via their respective dot imports
        val resolvedTypes = resolvedNode.usedTypes.associateBy { it.name }

        // Sin should resolve to language built-in (not project type due to language dictionary priority)
        assertThat(resolvedTypes["Sin"]?.resolvedPath).isEqualTo(Path(listOf("math", "Sin")))

        // User should resolve to project type via dot import
        val expectedUserPath = Path(listOf("github", "com", "myproject", "models", "User"))
        assertThat(resolvedTypes["User"]?.resolvedPath).isEqualTo(expectedUserPath)
        assertThat(resolvedNode.dependencies).contains(Dependency(expectedUserPath))
    }

    @Test
    fun `resolveTypes should handle Go unknown qualified types`() {
        // given
        val projectDictionary = mapOf<String, List<Path>>()
        val languageDictionary = emptyMap<String, Path>()
        val node = Node.build(
            pathWithName = Path(listOf("github", "com", "myproject", "services", "UserService")),
            physicalPath = "services/UserService.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(),
            usedTypes = setOf(Type.simple("unknown.UnknownType"))
        )

        // when
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // then - Generic approach extracts "UnknownType" and creates unknown type
        assertThat(resolvedNode.usedTypes.first().resolvedPath).isEqualTo(Path.unknown("UnknownType"))
        assertThat(resolvedNode.dependencies).contains(Dependency(Path.unknown("UnknownType")))
    }
}
