package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class FileReportGenericModuleResolutionTest {
    @Test
    fun `generic module resolution works for all languages with complex import patterns`() {
        val testCases = listOf(
            Triple(
                SupportedLanguage.GO,
                "Go module: github.com/myuser/myproject/internal/models → internal.models",
                Triple(
                    listOf("myproject", "internal", "models", "User"),
                    listOf("github", "com", "myuser", "myproject", "internal", "models"),
                    "User"
                )
            ),
            Triple(
                SupportedLanguage.PHP,
                "PHP composer: MyCompany\\MyProject\\Domain\\Models → Domain.Models",
                Triple(listOf("Domain", "Models", "User"), listOf("MyCompany", "MyProject", "Domain", "Models"), "User")
            ),
            Triple(
                SupportedLanguage.PYTHON,
                "Python package: myproject.domain.models.user → domain.models.user",
                Triple(listOf("domain", "models", "user", "User"), listOf("myproject", "domain", "models", "user"), "User")
            ),
            Triple(
                SupportedLanguage.TYPESCRIPT,
                "TypeScript path mapping: @/src/domain/entities → domain.entities",
                Triple(listOf("domain", "entities", "User"), listOf("src", "app", "domain", "entities"), "User")
            ),
            Triple(
                SupportedLanguage.JAVA,
                "Java multi-module: com.company.project.domain.models → domain.models",
                Triple(listOf("domain", "models", "User"), listOf("com", "company", "project", "domain", "models"), "User")
            ),
            Triple(
                SupportedLanguage.C_SHARP,
                "C# namespace: MyCompany.MyProject.Domain.Models → Domain.Models",
                Triple(listOf("Domain", "Models", "User"), listOf("MyCompany", "MyProject", "Domain", "Models"), "User")
            )
        )

        testCases.forEach { (language, description, testData) ->
            val (typePath, importPath, typeName) = testData

            val projectDictionary = mapOf(
                typeName to listOf(Path(typePath))
            )
            val languageDictionary = emptyMap<String, Path>()

            val node = Node.build(
                pathWithName = Path(listOf("services", "UserService")),
                physicalPath = "services/UserService.${language.suffixes.first()}",
                language = language,
                dependencies = setOf(
                    Dependency(Path(importPath))
                ),
                usedTypes = setOf(Type.simple(typeName))
            )

            // Act
            val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

            // Assert - Generic module resolution should work for all languages
            val resolvedPath = resolvedNode.usedTypes.first().resolvedPath
            val expectedPath = Path(typePath)

            assertThat(resolvedPath)
                .withFailMessage("$description: Expected $expectedPath but got $resolvedPath")
                .isEqualTo(expectedPath)
            assertThat(resolvedNode.dependencies).contains(Dependency(expectedPath))
        }
    }

    @Test
    fun `module resolution patterns work correctly`() {
        // Arrange - Test the two valid resolution patterns: exact and suffix match
        val exactMatchTest = mapOf(
            "User" to listOf(Path(listOf("exact", "match", "User")))
        )
        val suffixMatchTest = mapOf(
            "User" to listOf(Path(listOf("domain", "models", "User")))
        )
        val languageDictionary = emptyMap<String, Path>()

        val testCases = listOf(
            // Exact match: import path equals type package
            Triple("Exact match", exactMatchTest, Pair(listOf("exact", "match"), Path(listOf("exact", "match", "User")))),
            // Suffix match: import path is longer but ends with type package
            Triple(
                "Suffix match",
                suffixMatchTest,
                Pair(listOf("com", "company", "project", "domain", "models"), Path(listOf("domain", "models", "User")))
            )
        )

        testCases.forEach { (testName, projectDict, importAndExpected) ->
            val (importPath, expectedPath) = importAndExpected
            val node = Node.build(
                pathWithName = Path(listOf("services", "UserService")),
                physicalPath = "services/UserService.go",
                language = SupportedLanguage.GO,
                dependencies = setOf(Dependency(Path(importPath))),
                usedTypes = setOf(Type.simple("User"))
            )

            // Act
            val resolvedNode = node.resolveTypes(projectDict, languageDictionary, setOf())

            // Assert
            val resolvedPath = resolvedNode.usedTypes.first().resolvedPath
            assertThat(resolvedPath)
                .withFailMessage("$testName: Expected $expectedPath but got $resolvedPath")
                .isEqualTo(expectedPath)
        }
    }

    @Test
    fun `suffix matching should not match when class package has different prefix`() {
        // This test verifies that a class with package "A.B.Problem"
        // does NOT match a dependency import "Foo.Problem"
        // The suffix matching logic should require the import path to end with the type package

        // Arrange - Class "MyClass" in package "A.B.Problem"
        val projectDictionary = mapOf(
            "MyClass" to listOf(Path(listOf("A", "B", "Problem", "MyClass")))
        )
        val languageDictionary = emptyMap<String, Path>()

        val node = Node.build(
            pathWithName = Path(listOf("services", "UserService")),
            physicalPath = "services/UserService.java",
            language = SupportedLanguage.JAVA,
            dependencies = setOf(
                // Non-wildcard dependency import "Foo.Problem"
                Dependency(Path(listOf("Foo", "Problem")))
            ),
            usedTypes = setOf(Type.simple("MyClass"))
        )

        // Act
        val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())

        // Assert - The class should NOT be resolved because "Foo.Problem" does not match "A.B.Problem"
        // The suffix matching logic should require the full package path to match, not just the suffix
        val resolvedPath = resolvedNode.usedTypes.first().resolvedPath

        // The class "A.B.Problem.MyClass" should NOT be matched to dependency "Foo.Problem"
        // because the suffix matching logic requires the import path to end with the type package
        // Since "Foo.Problem" doesn't end with "A.B.Problem", it should fall back to unknown
        assertThat(resolvedPath?.withDots())
            .withFailMessage("Class 'A.B.Problem.MyClass' should not match dependency 'Foo.Problem'")
            .isNotEqualTo("A.B.Problem.MyClass")

        // Verify that it falls back to unknown path as expected
        assertThat(resolvedPath?.withDots())
            .isEqualTo("<unknown>.MyClass")
    }

    @Test
    fun `realistic Go import scenarios - comprehensive test`() {
        // Test realistic Go import scenarios that should and shouldn't match

        val projectDictionary = mapOf(
            // Scenario 1: Valid suffix match - fully qualified import
            "User" to listOf(Path(listOf("internal", "domain", "models", "User"))),
            // Scenario 2: Invalid match - different packages with same suffix
            "Handler" to listOf(Path(listOf("api", "Handler"))),
            // Scenario 3: Valid suffix match - external module
            "Logger" to listOf(Path(listOf("pkg", "logging", "Logger"))),
            // Scenario 4: Invalid match - single element collision
            "Error" to listOf(Path(listOf("errors", "Error")))
        )
        val languageDictionary = emptyMap<String, Path>()

        data class TestCase(val description: String, val importPath: List<String>, val typeName: String, val expectedPath: String)

        val testCases = listOf(
            // VALID: github.com/myproject/internal/domain/models should match internal.domain.models.User
            TestCase(
                "Valid Go module import",
                listOf("github", "com", "myproject", "internal", "domain", "models"),
                "User",
                "internal.domain.models.User"
            ),
            // INVALID: github.com/otherproject/api should NOT match api.Handler (different projects)
            TestCase(
                "Invalid cross-project match",
                listOf("github", "com", "otherproject", "api"),
                "Handler",
                "<unknown>.Handler"
            ),
            // VALID: myproject/pkg/logging should match pkg.logging.Logger
            TestCase(
                "Valid internal module import",
                listOf("myproject", "pkg", "logging"),
                "Logger",
                "pkg.logging.Logger"
            ),
            // INVALID: some.other.errors should NOT match errors.Error (different packages)
            TestCase(
                "Invalid package collision",
                listOf("some", "other", "errors"),
                "Error",
                "<unknown>.Error"
            )
        )

        testCases.forEach { testCase ->
            val node = Node.build(
                pathWithName = Path(listOf("main", "main")),
                physicalPath = "main/main.go",
                language = SupportedLanguage.GO,
                dependencies = setOf(Dependency(Path(testCase.importPath))),
                usedTypes = setOf(Type.simple(testCase.typeName))
            )

            val resolvedNode = node.resolveTypes(projectDictionary, languageDictionary, setOf())
            val resolvedPath = resolvedNode.usedTypes.first().resolvedPath

            assertThat(resolvedPath?.withDots())
                .withFailMessage("${testCase.description}: Expected '${testCase.expectedPath}' but got '${resolvedPath?.withDots()}'")
                .isEqualTo(testCase.expectedPath)
        }
    }
}
