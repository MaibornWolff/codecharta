package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.writeText
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * Integration tests for path-scoped framework keyword filtering.
 *
 * Verifies that framework keywords (Angular, React, etc.) are only filtered
 * from files within the framework's directory scope, not globally.
 */
class PathScopedFrameworkFilteringIntegrationTest {
    @Test
    fun `should filter Angular keywords only from files under Angular directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange: monorepo structure with Angular frontend and Kotlin backend
        // Create Angular frontend directory with package.json
        val frontendDir = tempDir.resolve("frontend").createDirectories()
        frontendDir.resolve("package.json").writeText(
            """{"dependencies": {"@angular/core": "^17.0.0"}}"""
        )

        // Create backend directory (no package.json)
        val backendDir = tempDir.resolve("backend").createDirectories()

        // Setup framework detection
        val frameworksByPath = mapOf(frontendDir to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val stopWordFilter =
            StopWordFilter(
                languageKeywords =
                    listOf(
                        ResourceKeywords("keywords/kotlin-keywords.txt"),
                        ResourceKeywords("keywords/typescript-keywords.txt")
                    ),
                pathScopedKeywordProvider = provider
            )

        // Test words - "component" and "selector" are Angular keywords
        val testWords = listOf("component", "selector", "user", "profile", "class")

        // Act: Filter for frontend TypeScript file
        val frontendPath = frontendDir.resolve("src/app.component.ts")
        val filteredFrontend = stopWordFilter.filter(testWords, frontendPath)

        // Act: Filter for backend Kotlin file
        val backendPath = backendDir.resolve("src/Main.kt")
        val filteredBackend = stopWordFilter.filter(testWords, backendPath)

        // Assert: Frontend should have Angular keywords filtered
        assertFalse(filteredFrontend.contains("component"), "Angular keyword 'component' should be filtered from frontend")
        assertFalse(filteredFrontend.contains("selector"), "Angular keyword 'selector' should be filtered from frontend")
        assertTrue(filteredFrontend.contains("user"), "'user' should NOT be filtered from frontend")
        assertTrue(filteredFrontend.contains("profile"), "'profile' should NOT be filtered from frontend")
        assertFalse(filteredFrontend.contains("class"), "Kotlin keyword 'class' should be filtered from frontend")

        // Assert: Backend should NOT have Angular keywords filtered
        assertTrue(filteredBackend.contains("component"), "Angular keyword 'component' should NOT be filtered from backend")
        assertTrue(filteredBackend.contains("selector"), "Angular keyword 'selector' should NOT be filtered from backend")
        assertTrue(filteredBackend.contains("user"), "'user' should NOT be filtered from backend")
        assertTrue(filteredBackend.contains("profile"), "'profile' should NOT be filtered from backend")
        assertFalse(filteredBackend.contains("class"), "Kotlin keyword 'class' should be filtered from backend")
    }

    @Test
    fun `should filter React keywords only from React directory in monorepo`(
        @TempDir tempDir: Path
    ) {
        // Arrange: monorepo with separate React and Angular apps
        val reactDir = tempDir.resolve("apps/react-app").createDirectories()
        val angularDir = tempDir.resolve("apps/angular-app").createDirectories()
        val sharedDir = tempDir.resolve("shared/utils").createDirectories()

        val frameworksByPath =
            mapOf(
                reactDir to setOf(Framework.REACT),
                angularDir to setOf(Framework.ANGULAR)
            )
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val stopWordFilter = StopWordFilter(pathScopedKeywordProvider = provider)

        // "usestate" is a React keyword, "directive" is Angular-only (not in React)
        val testWords = listOf("usestate", "directive", "user")

        // Act
        val filteredReact = stopWordFilter.filter(testWords, reactDir.resolve("src/App.tsx"))
        val filteredAngular = stopWordFilter.filter(testWords, angularDir.resolve("src/app.ts"))
        val filteredShared = stopWordFilter.filter(testWords, sharedDir.resolve("helpers.ts"))

        // Assert: React directory - only React keywords filtered
        assertFalse(filteredReact.contains("usestate"), "React keyword 'usestate' should be filtered in React dir")
        assertTrue(filteredReact.contains("directive"), "Angular-only keyword 'directive' should NOT be filtered in React dir")

        // Assert: Angular directory - only Angular keywords filtered
        assertTrue(filteredAngular.contains("usestate"), "React keyword 'usestate' should NOT be filtered in Angular dir")
        assertFalse(filteredAngular.contains("directive"), "Angular keyword 'directive' should be filtered in Angular dir")

        // Assert: Shared directory - no framework keywords filtered
        assertTrue(filteredShared.contains("usestate"), "React keyword should NOT be filtered in shared dir")
        assertTrue(filteredShared.contains("directive"), "Angular keyword should NOT be filtered in shared dir")
    }

    @Test
    fun `should filter ASP NET keywords only from dotnet directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange: fullstack with C# backend
        val backendDir = tempDir.resolve("backend").createDirectories()
        val frontendDir = tempDir.resolve("frontend").createDirectories()

        val frameworksByPath =
            mapOf(
                backendDir to setOf(Framework.ASPNET)
            )
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val stopWordFilter = StopWordFilter(pathScopedKeywordProvider = provider)

        // ASP.NET keywords use title case: "Controller", "Authorize"
        val testWords = listOf("Controller", "Authorize", "user", "service")

        // Act
        val filteredBackend = stopWordFilter.filter(testWords, backendDir.resolve("Controllers/UserController.cs"))
        val filteredFrontend = stopWordFilter.filter(testWords, frontendDir.resolve("src/App.tsx"))

        // Assert: Backend should have ASP.NET keywords filtered
        assertFalse(filteredBackend.contains("Controller"), "ASP.NET keyword 'Controller' should be filtered in backend")
        assertFalse(filteredBackend.contains("Authorize"), "ASP.NET keyword 'Authorize' should be filtered in backend")

        // Assert: Frontend should NOT have ASP.NET keywords filtered
        assertTrue(filteredFrontend.contains("Controller"), "ASP.NET keyword should NOT be filtered in frontend")
        assertTrue(filteredFrontend.contains("Authorize"), "ASP.NET keyword should NOT be filtered in frontend")
    }

    @Test
    fun `should work with FileAnalyzer for end-to-end filtering`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val frontendDir = tempDir.resolve("frontend").createDirectories()
        val frameworksByPath = mapOf(frontendDir to setOf(Framework.ANGULAR))

        val provider = PathScopedKeywordProvider(frameworksByPath)
        val stopWordFilter =
            StopWordFilter(
                languageKeywords = listOf(ResourceKeywords("keywords/typescript-keywords.txt")),
                pathScopedKeywordProvider = provider
            )
        val fileAnalyzer = FileAnalyzer(stopWordFilter)

        // Create a TypeScript file with Angular-specific identifiers
        val tsFile = frontendDir.resolve("app.component.ts").toFile()
        tsFile.parentFile.mkdirs()
        tsFile.writeText(
            """
            // User component for profile management
            class UserComponent {
                selector = 'app-user';
                userProfile = {};
            }
            """.trimIndent()
        )

        // Act
        val result = fileAnalyzer.extractWordsFromFile(tsFile, tsFile.readText())
        val words = (result as FileResult.Processed).words

        // Assert: Angular keywords should be filtered, domain words should remain
        assertFalse(words.containsKey("component"), "Angular keyword 'component' should be filtered")
        assertFalse(words.containsKey("selector"), "Angular keyword 'selector' should be filtered")
        assertTrue(words.containsKey("user"), "Domain word 'user' should remain")
        assertTrue(words.containsKey("profile"), "Domain word 'profile' should remain")
    }
}
