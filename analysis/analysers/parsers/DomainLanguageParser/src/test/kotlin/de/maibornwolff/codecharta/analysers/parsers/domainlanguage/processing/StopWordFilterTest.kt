package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywordLoader
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import java.nio.file.Paths
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class StopWordFilterTest {
    @Test
    fun `should filter out common English stop words`() {
        // Arrange
        val filter = StopWordFilter()
        val words = listOf("the", "hello", "a", "world", "and", "is", "kotlin")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world", "kotlin"), filtered)
    }

    @Test
    fun `should keep all words when none are stop words`() {
        // Arrange
        val filter = StopWordFilter()
        val words = listOf("hello", "world", "kotlin")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world", "kotlin"), filtered)
    }

    @Test
    fun `should return empty list when all words are stop words`() {
        // Arrange
        val filter = StopWordFilter()
        val words = listOf("the", "a", "and", "is", "of")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(emptyList(), filtered)
    }

    @Test
    fun `should filter language keywords when provided`() {
        // Arrange
        val globalKeywords = ResourceKeywords("keywords/typescript-keywords.txt")
        val filter = StopWordFilter(globalKeywords = listOf(globalKeywords))
        val words = listOf("function", "hello", "const", "world", "if", "kotlin")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world", "kotlin"), filtered)
    }

    @Test
    fun `should filter both stop words and language keywords`() {
        // Arrange
        val globalKeywords = ResourceKeywords("keywords/typescript-keywords.txt")
        val filter = StopWordFilter(globalKeywords = listOf(globalKeywords))
        val words = listOf("the", "function", "hello", "a", "const", "world")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world"), filtered)
    }

    @Test
    fun `should work with empty language keywords list`() {
        // Arrange
        val filter = StopWordFilter(globalKeywords = emptyList<LanguageKeywords>())
        val words = listOf("the", "function", "hello", "const", "world")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("function", "hello", "const", "world"), filtered)
    }

    @Test
    fun `should filter multiple language keywords when provided`() {
        // Arrange
        val tsKeywords = ResourceKeywords("keywords/typescript-keywords.txt")
        val ktKeywords = ResourceKeywords("keywords/kotlin-keywords.txt")
        val filter = StopWordFilter(globalKeywords = listOf(tsKeywords, ktKeywords))
        val words = listOf("function", "hello", "const", "fun", "world", "class", "kotlin")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world", "kotlin"), filtered)
    }

    @Test
    fun `should return true when word is excluded`() {
        // Arrange
        val filter = StopWordFilter()

        // Act & Assert
        assertTrue(filter.isExcluded("the"))
        assertTrue(filter.isExcluded("and"))
        assertTrue(filter.isExcluded("is"))
    }

    @Test
    fun `should return false when word is not excluded`() {
        // Arrange
        val filter = StopWordFilter()

        // Act & Assert
        assertFalse(filter.isExcluded("hello"))
        assertFalse(filter.isExcluded("world"))
        assertFalse(filter.isExcluded("kotlin"))
    }

    @Test
    fun `should return true when word is a language keyword`() {
        // Arrange
        val globalKeywords = ResourceKeywords("keywords/typescript-keywords.txt")
        val filter = StopWordFilter(globalKeywords = listOf(globalKeywords))

        // Act & Assert
        assertTrue(filter.isExcluded("function"))
        assertTrue(filter.isExcluded("const"))
        assertTrue(filter.isExcluded("if"))
    }

    @Test
    fun `should return false when word is not a stop word or keyword`() {
        // Arrange
        val globalKeywords = ResourceKeywords("keywords/typescript-keywords.txt")
        val filter = StopWordFilter(globalKeywords = listOf(globalKeywords))

        // Act & Assert
        assertFalse(filter.isExcluded("hello"))
        assertFalse(filter.isExcluded("world"))
        assertFalse(filter.isExcluded("kotlin"))
    }

    @Test
    fun `should load stop words from resource file`() {
        // Arrange
        val loader = ResourceKeywordLoader()
        val filter = StopWordFilter(keywordLoader = loader)

        // Act
        val filtered = filter.filter(listOf("the", "hello", "and", "world", "is"))

        // Assert
        assertEquals(listOf("hello", "world"), filtered)
    }

    @Test
    fun `should fail when resource file is missing`() {
        // Arrange
        val loader = ResourceKeywordLoader()

        // Act & Assert
        assertFailsWith<IllegalArgumentException> {
            loader.loadFromResource("stopwords/nonexistent.txt")
        }
    }

    @Test
    fun `should filter all stop words from resource file`() {
        // Arrange
        val filter = StopWordFilter()
        val allStopWords =
            listOf(
                "a",
                "an",
                "the",
                "and",
                "or",
                "but",
                "as",
                "at",
                "by",
                "for",
                "from",
                "in",
                "of",
                "on",
                "to",
                "with",
                "he",
                "i",
                "it",
                "its",
                "that",
                "these",
                "they",
                "this",
                "those",
                "we",
                "you",
                "are",
                "be",
                "can",
                "could",
                "has",
                "is",
                "may",
                "might",
                "must",
                "not",
                "shall",
                "should",
                "was",
                "were",
                "will",
                "would"
            )

        // Act
        val filtered = filter.filter(allStopWords + listOf("hello", "world"))

        // Assert
        assertEquals(listOf("hello", "world"), filtered)
    }

    @Test
    fun `should exclude bigram when any component is a stop word`() {
        // Arrange
        val filter = StopWordFilter()

        // Act & Assert
        assertTrue(filter.isExcluded("the user"))
        assertTrue(filter.isExcluded("user the"))
        assertTrue(filter.isExcluded("and profile"))
    }

    @Test
    fun `should not exclude bigram when no component is a stop word`() {
        // Arrange
        val filter = StopWordFilter()

        // Act & Assert
        assertFalse(filter.isExcluded("user profile"))
        assertFalse(filter.isExcluded("customer order"))
        assertFalse(filter.isExcluded("payment gateway"))
    }

    @Test
    fun `should exclude bigram when component is technical stop word`() {
        // Arrange
        val technicalStopWords = ResourceKeywords("keywords/technical-moderate.txt")
        val filter = StopWordFilter(globalKeywords = listOf(technicalStopWords))

        // Act & Assert
        assertTrue(filter.isExcluded("user handler"))
        assertTrue(filter.isExcluded("error service"))
        assertTrue(filter.isExcluded("test util"))
    }

    @Test
    fun `should not exclude bigram with valid domain terms`() {
        // Arrange
        val technicalStopWords = ResourceKeywords("keywords/technical-moderate.txt")
        val filter = StopWordFilter(globalKeywords = listOf(technicalStopWords))

        // Act & Assert
        assertFalse(filter.isExcluded("user profile"))
        assertFalse(filter.isExcluded("customer order"))
        assertFalse(filter.isExcluded("payment gateway"))
    }

    @Test
    fun `should filter custom stop words when provided`() {
        // Arrange
        val customStopWords = setOf("domain", "custom", "project")
        val filter = StopWordFilter(customStopWords = customStopWords)
        val words = listOf("hello", "domain", "world", "custom", "kotlin", "project")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world", "kotlin"), filtered)
    }

    @Test
    fun `should merge custom stop words with English stop words`() {
        // Arrange
        val customStopWords = setOf("custom")
        val filter = StopWordFilter(customStopWords = customStopWords)
        val words = listOf("the", "custom", "hello", "a", "world")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world"), filtered)
    }

    @Test
    fun `should merge custom stop words with language keywords`() {
        // Arrange
        val globalKeywords = listOf(ResourceKeywords("keywords/kotlin-keywords.txt"))
        val customStopWords = setOf("custom")
        val filter = StopWordFilter(globalKeywords, customStopWords)
        val words = listOf("class", "custom", "hello", "fun", "world")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world"), filtered)
    }

    @Test
    fun `should merge custom stop words with all filtering sources`() {
        // Arrange
        val globalKeywords = listOf(ResourceKeywords("keywords/kotlin-keywords.txt"), ResourceKeywords("keywords/technical-moderate.txt"))
        val customStopWords = setOf("custom", "domain")
        val filter = StopWordFilter(globalKeywords, customStopWords)
        val words = listOf("the", "class", "test", "custom", "hello", "domain", "world")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world"), filtered)
    }

    @Test
    fun `should exclude custom stop words in isExcluded check`() {
        // Arrange
        val customStopWords = setOf("custom", "domain")
        val filter = StopWordFilter(customStopWords = customStopWords)

        // Act & Assert
        assertTrue(filter.isExcluded("custom"))
        assertTrue(filter.isExcluded("domain"))
        assertFalse(filter.isExcluded("hello"))
    }

    @Test
    fun `should exclude compounds with custom stop words`() {
        // Arrange
        val customStopWords = setOf("custom")
        val filter = StopWordFilter(customStopWords = customStopWords)

        // Act & Assert
        assertTrue(filter.isExcluded("custom handler"))
        assertTrue(filter.isExcluded("user custom"))
        assertFalse(filter.isExcluded("user profile"))
    }

    @Test
    fun `should work with empty custom stop words set`() {
        // Arrange
        val filter = StopWordFilter(customStopWords = emptySet())
        val words = listOf("the", "hello", "world")

        // Act
        val filtered = filter.filter(words)

        // Assert
        assertEquals(listOf("hello", "world"), filtered)
    }

    @Test
    fun `should exclude trigram when any component is a stop word`() {
        // Arrange
        val filter = StopWordFilter()

        // Act & Assert
        assertTrue(filter.isExcluded("the user profile"))
        assertTrue(filter.isExcluded("user the profile"))
        assertTrue(filter.isExcluded("user profile the"))
        assertTrue(filter.isExcluded("and customer order"))
    }

    @Test
    fun `should not exclude trigram when no component is a stop word`() {
        // Arrange
        val filter = StopWordFilter()

        // Act & Assert
        assertFalse(filter.isExcluded("user profile data"))
        assertFalse(filter.isExcluded("customer order processor"))
        assertFalse(filter.isExcluded("payment gateway service"))
    }

    @Test
    fun `should exclude trigram when component is technical stop word`() {
        // Arrange
        val technicalStopWords = ResourceKeywords("keywords/technical-moderate.txt")
        val filter = StopWordFilter(globalKeywords = listOf(technicalStopWords))

        // Act & Assert
        assertTrue(filter.isExcluded("user profile handler"))
        assertTrue(filter.isExcluded("error customer service"))
        assertTrue(filter.isExcluded("test user util"))
    }

    @Test
    fun `should not exclude trigram with valid domain terms`() {
        // Arrange
        val technicalStopWords = ResourceKeywords("keywords/technical-moderate.txt")
        val filter = StopWordFilter(globalKeywords = listOf(technicalStopWords))

        // Act & Assert
        assertFalse(filter.isExcluded("customer order payment"))
        assertFalse(filter.isExcluded("user profile data"))
        assertFalse(filter.isExcluded("payment gateway integration"))
    }

    @Test
    fun `should exclude 4-gram when any component is a stop word`() {
        // Arrange
        val filter = StopWordFilter()

        // Act & Assert
        assertTrue(filter.isExcluded("the user profile data"))
        assertTrue(filter.isExcluded("user the profile data"))
        assertTrue(filter.isExcluded("user profile the data"))
        assertTrue(filter.isExcluded("user profile data the"))
    }

    @Test
    fun `should not exclude 4-gram when no component is a stop word`() {
        // Arrange
        val filter = StopWordFilter()

        // Act & Assert
        assertFalse(filter.isExcluded("user profile data manager"))
        assertFalse(filter.isExcluded("customer order payment gateway"))
    }

    @Test
    fun `should exclude 4-gram when component is technical stop word`() {
        // Arrange
        val technicalStopWords = ResourceKeywords("keywords/technical-moderate.txt")
        val filter = StopWordFilter(globalKeywords = listOf(technicalStopWords))

        // Act & Assert
        assertTrue(filter.isExcluded("user profile data handler"))
        assertTrue(filter.isExcluded("customer order service manager"))
    }

    @Test
    fun `should exclude n-grams with custom stop words`() {
        // Arrange
        val customStopWords = setOf("legacy")
        val filter = StopWordFilter(customStopWords = customStopWords)

        // Act & Assert
        assertTrue(filter.isExcluded("legacy user profile"))
        assertTrue(filter.isExcluded("user legacy profile"))
        assertTrue(filter.isExcluded("user profile legacy"))
        assertTrue(filter.isExcluded("legacy user profile data"))
        assertFalse(filter.isExcluded("user profile data"))
    }

    @Test
    fun `should exclude framework keyword when file is under framework directory`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filter = StopWordFilter(pathScopedKeywordProvider = provider)
        val filePath = Paths.get("/project/frontend/src/app.component.ts")

        // Act & Assert
        assertTrue(filter.isExcluded("component", filePath))
    }

    @Test
    fun `should not exclude framework keyword when file is outside framework directory`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filter = StopWordFilter(pathScopedKeywordProvider = provider)
        val filePath = Paths.get("/project/backend/src/Main.kt")

        // Act & Assert
        assertFalse(filter.isExcluded("component", filePath))
    }

    @Test
    fun `should still exclude global keywords regardless of file path`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val globalKeywords = listOf(ResourceKeywords("keywords/kotlin-keywords.txt"))
        val filter = StopWordFilter(globalKeywords, pathScopedKeywordProvider = provider)
        val backendPath = Paths.get("/project/backend/src/Main.kt")

        // Act & Assert
        assertTrue(filter.isExcluded("class", backendPath))
        assertTrue(filter.isExcluded("the", backendPath))
    }

    @Test
    fun `should filter path-scoped words from list`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val filter = StopWordFilter(pathScopedKeywordProvider = provider)
        val words = listOf("component", "user", "selector", "profile")

        // Act
        val filteredFrontend =
            filter.filter(
                words,
                Paths.get("/project/frontend/src/app.ts")
            )
        val filteredBackend =
            filter.filter(
                words,
                Paths.get("/project/backend/src/Main.kt")
            )

        // Assert
        assertEquals(listOf("user", "profile"), filteredFrontend)
        assertEquals(listOf("component", "user", "selector", "profile"), filteredBackend)
    }

    @Test
    fun `should combine path-scoped and global filtering`() {
        // Arrange
        val frontendPath = Paths.get("/project/frontend")
        val frameworksByPath = mapOf(frontendPath to setOf(Framework.ANGULAR))
        val provider = PathScopedKeywordProvider(frameworksByPath)
        val globalKeywords = listOf(ResourceKeywords("keywords/kotlin-keywords.txt"))
        val filter = StopWordFilter(globalKeywords, pathScopedKeywordProvider = provider)
        val words = listOf("component", "class", "the", "user", "fun")

        // Act
        val filteredFrontend =
            filter.filter(
                words,
                Paths.get("/project/frontend/src/app.ts")
            )
        val filteredBackend =
            filter.filter(
                words,
                Paths.get("/project/backend/src/Main.kt")
            )

        // Assert
        assertEquals(listOf("user"), filteredFrontend)
        assertEquals(listOf("component", "user"), filteredBackend)
    }
}
