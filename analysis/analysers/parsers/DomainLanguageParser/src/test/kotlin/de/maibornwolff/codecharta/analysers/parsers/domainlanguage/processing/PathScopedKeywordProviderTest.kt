package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import java.nio.file.Paths
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PathScopedKeywordProviderTest {
    @Test
    fun `should return empty list when no frameworks detected`() {
        // Arrange
        val provider = PathScopedKeywordProvider(emptyMap())
        val filePath = Paths.get("/project/src/main.kt")

        // Act
        val keywords = provider.getFrameworkKeywordsForFile(filePath)

        // Assert
        assertTrue(keywords.isEmpty())
    }

    @Test
    fun `should return framework keywords when file is under framework directory`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filePath = Paths.get("/project/frontend/src/app.component.ts")

        // Act
        val keywords = provider.getFrameworkKeywordsForFile(filePath)

        // Assert
        assertEquals(1, keywords.size)
        assertTrue(keywords[0] is ResourceKeywords)
        // Verify Angular keywords are loaded
        assertTrue(keywords[0].getKeywords().contains("component"))
    }

    @Test
    fun `should return empty list when file is not under any framework directory`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filePath = Paths.get("/project/backend/src/Main.kt")

        // Act
        val keywords = provider.getFrameworkKeywordsForFile(filePath)

        // Assert
        assertTrue(keywords.isEmpty())
    }

    @Test
    fun `should return multiple framework keywords when file is under directory with multiple frameworks`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR, Framework.REACT))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filePath = Paths.get("/project/frontend/src/component.tsx")

        // Act
        val keywords = provider.getFrameworkKeywordsForFile(filePath)

        // Assert
        assertEquals(2, keywords.size)
    }

    @Test
    fun `should return correct framework for each directory in monorepo`() {
        // Arrange
        val angularPath = Paths.get("/project/apps/angular-app")
        val reactPath = Paths.get("/project/apps/react-app")
        val frameworksByPath =
            mapOf(
                angularPath to setOf(Framework.ANGULAR),
                reactPath to setOf(Framework.REACT)
            )
        val provider = PathScopedKeywordProvider(frameworksByPath)

        // Act
        val angularKeywords =
            provider.getFrameworkKeywordsForFile(
                Paths.get("/project/apps/angular-app/src/main.ts")
            )
        val reactKeywords =
            provider.getFrameworkKeywordsForFile(
                Paths.get("/project/apps/react-app/src/App.tsx")
            )
        val backendKeywords =
            provider.getFrameworkKeywordsForFile(
                Paths.get("/project/backend/src/Main.kt")
            )

        // Assert
        assertEquals(1, angularKeywords.size)
        assertTrue(angularKeywords[0].getKeywords().contains("component")) // Angular keyword

        assertEquals(1, reactKeywords.size)
        assertTrue(reactKeywords[0].getKeywords().contains("state")) // React keyword

        assertTrue(backendKeywords.isEmpty())
    }

    @Test
    fun `should union frameworks from all enclosing directories when a file is nested under several`() {
        // Arrange: React at the repo root, Angular in a sub-package the file also lives under
        val rootPath = Paths.get("/project")
        val subPackagePath = Paths.get("/project/apps/angular-app")
        val frameworksByPath =
            mapOf(
                rootPath to setOf(Framework.REACT),
                subPackagePath to setOf(Framework.ANGULAR)
            )
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filePath = Paths.get("/project/apps/angular-app/src/app.component.ts")

        // Act
        val keywords = provider.getFrameworkKeywordsForFile(filePath)

        // Assert: both enclosing directories contribute, regardless of map iteration order
        assertEquals(2, keywords.size)
        val allKeywords = keywords.flatMap { it.getKeywords() }.toSet()
        assertTrue(allKeywords.contains("component")) // Angular (sub-package)
        assertTrue(allKeywords.contains("state")) // React (root)
    }

    @Test
    fun `should match file at root of framework directory`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filePath = Paths.get("/project/frontend/package.json")

        // Act
        val keywords = provider.getFrameworkKeywordsForFile(filePath)

        // Assert
        assertEquals(1, keywords.size)
    }

    @Test
    fun `should match deeply nested files`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filePath = Paths.get("/project/frontend/src/app/components/shared/button/button.component.ts")

        // Act
        val keywords = provider.getFrameworkKeywordsForFile(filePath)

        // Assert
        assertEquals(1, keywords.size)
        assertTrue(keywords[0].getKeywords().contains("component"))
    }

    @Test
    fun `should return same keyword instance for multiple files`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val file1 = Paths.get("/project/frontend/src/app.component.ts")
        val file2 = Paths.get("/project/frontend/src/main.ts")
        val file3 = Paths.get("/project/frontend/src/index.ts")

        // Act
        val keywords1 = provider.getFrameworkKeywordsForFile(file1)
        val keywords2 = provider.getFrameworkKeywordsForFile(file2)
        val keywords3 = provider.getFrameworkKeywordsForFile(file3)

        // Assert - same instance should be returned (referential equality)
        assertTrue(keywords1[0] === keywords2[0])
        assertTrue(keywords2[0] === keywords3[0])
    }
}
