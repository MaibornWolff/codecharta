package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.stages

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.ExtractionContext
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.pipeline.WeightedText
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class NgramsStageTest {
    @Test
    fun `should return individual words when ngrams is 1`() {
        // Arrange
        val stage = NgramsStage(ngrams = 1)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("user", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("profile", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("user", "profile"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        assertEquals(2, result.size)
        assertEquals("user", result[0].text)
        assertEquals("profile", result[1].text)
    }

    @Test
    fun `should generate bigrams from identifier with ngrams 2`() {
        // Arrange
        val stage = NgramsStage(ngrams = 2)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("user", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("profile", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("user", "profile"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        assertEquals(3, result.size)
        assertEquals("user", result[0].text)
        assertEquals("profile", result[1].text)
        assertEquals("user profile", result[2].text)
        assertEquals(3, result[2].weight)
        assertEquals(ExtractionContext.IDENTIFIER, result[2].context)
    }

    @Test
    fun `should generate trigrams from identifier with ngrams 3`() {
        // Arrange
        val stage = NgramsStage(ngrams = 3)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("customer", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("order", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("processor", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("customer", "order", "processor"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert - SSR removes bigrams when trigram has equal frequency
        assertEquals(4, result.size)
        assertEquals("customer", result[0].text)
        assertEquals("order", result[1].text)
        assertEquals("processor", result[2].text)
        assertEquals("customer order processor", result[3].text)
    }

    @Test
    fun `should not generate ngrams from comments`() {
        // Arrange
        val stage = NgramsStage(ngrams = 2)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("process", 2, ExtractionContext.COMMENT),
                            WeightedText("customer", 2, ExtractionContext.COMMENT),
                            WeightedText("orders", 2, ExtractionContext.COMMENT)
                        ),
                    sourceWords = listOf("process", "customer", "orders"),
                    weight = 2,
                    context = ExtractionContext.COMMENT
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        assertEquals(3, result.size)
        assertEquals("process", result[0].text)
        assertEquals("customer", result[1].text)
        assertEquals("orders", result[2].text)
    }

    @Test
    fun `should not generate ngrams from strings`() {
        // Arrange
        val stage = NgramsStage(ngrams = 2)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("hello", 1, ExtractionContext.STRING),
                            WeightedText("world", 1, ExtractionContext.STRING)
                        ),
                    sourceWords = listOf("hello", "world"),
                    weight = 1,
                    context = ExtractionContext.STRING
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        assertEquals(2, result.size)
        assertEquals("hello", result[0].text)
        assertEquals("world", result[1].text)
    }

    @Test
    fun `should handle empty input`() {
        // Arrange
        val stage = NgramsStage(ngrams = 2)
        val splitResults = emptyList<SplitStage.SplitResult>()

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        assertTrue(result.isEmpty())
    }

    @Test
    fun `should handle single word identifier without generating ngrams`() {
        // Arrange
        val stage = NgramsStage(ngrams = 2)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("user", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("user"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        assertEquals(1, result.size)
        assertEquals("user", result[0].text)
    }

    @Test
    fun `should limit ngrams to available words count`() {
        // Arrange
        val stage = NgramsStage(ngrams = 5)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("user", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("profile", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("user", "profile"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        assertEquals(3, result.size)
        assertEquals("user", result[0].text)
        assertEquals("profile", result[1].text)
        assertEquals("user profile", result[2].text)
    }

    @Test
    fun `should generate all ngrams up to specified size`() {
        // Arrange
        val stage = NgramsStage(ngrams = 4)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("user", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("profile", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("data", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("manager", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("user", "profile", "data", "manager"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert - SSR removes all shorter n-grams when 4-gram has equal frequency
        assertEquals(5, result.size)
        assertEquals("user", result[0].text)
        assertEquals("profile", result[1].text)
        assertEquals("data", result[2].text)
        assertEquals("manager", result[3].text)
        assertEquals("user profile data manager", result[4].text)
    }

    @Test
    fun `should handle multiple split results with mixed contexts`() {
        // Arrange
        val stage = NgramsStage(ngrams = 2)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("user", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("profile", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("user", "profile"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                ),
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("process", 2, ExtractionContext.COMMENT),
                            WeightedText("data", 2, ExtractionContext.COMMENT)
                        ),
                    sourceWords = listOf("process", "data"),
                    weight = 2,
                    context = ExtractionContext.COMMENT
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        assertEquals(5, result.size)
        assertEquals("user", result[0].text)
        assertEquals("profile", result[1].text)
        assertEquals("user profile", result[2].text)
        assertEquals("process", result[3].text)
        assertEquals("data", result[4].text)
    }

    @Test
    fun `should remove bigram when trigram has equal frequency via SSR`() {
        // Arrange - "customer order" and "customer order service" each appear once with weight 3
        val stage = NgramsStage(ngrams = 3)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("customer", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("order", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("service", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("customer", "order", "service"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert - should keep unigrams and trigram, remove bigrams that are substrings of trigram
        val texts = result.map { it.text }
        assertTrue("customer" in texts, "unigram 'customer' should be kept")
        assertTrue("order" in texts, "unigram 'order' should be kept")
        assertTrue("service" in texts, "unigram 'service' should be kept")
        assertTrue("customer order service" in texts, "trigram should be kept")
        assertTrue("customer order" !in texts, "bigram 'customer order' should be removed by SSR")
        assertTrue("order service" !in texts, "bigram 'order service' should be removed by SSR")
    }

    @Test
    fun `should keep both ngrams when shorter has higher frequency`() {
        // Arrange - "customer order" appears twice (weight=6), "customer order service" appears once (weight=3)
        val stage = NgramsStage(ngrams = 3)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("customer", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("order", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("service", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("customer", "order", "service"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                ),
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("customer", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("order", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("customer", "order"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert - "customer order" has frequency 6 (3+3), trigram has 3, so both kept
        val texts = result.map { it.text }
        assertTrue("customer order" in texts, "bigram should be kept when it has higher frequency")
        assertTrue("customer order service" in texts, "trigram should always be kept")
    }

    @Test
    fun `should never remove unigrams via SSR`() {
        // Arrange - unigrams should never be removed, even if contained in n-grams with equal frequency
        val stage = NgramsStage(ngrams = 2)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("user", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("profile", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("user", "profile"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert - unigrams should be kept even though bigram has same frequency
        val texts = result.map { it.text }
        assertTrue("user" in texts, "unigram 'user' should never be removed")
        assertTrue("profile" in texts, "unigram 'profile' should never be removed")
    }

    @Test
    fun `should remove all substrings of longest ngram when frequencies equal`() {
        // Arrange - all ngrams appear once with same frequency
        val stage = NgramsStage(ngrams = 3)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("customer", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("order", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("service", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("customer", "order", "service"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert
        val texts = result.map { it.text }
        assertEquals(4, texts.size, "should have 3 unigrams + 1 trigram")
        assertTrue("customer order" !in texts, "'customer order' should be removed")
        assertTrue("order service" !in texts, "'order service' should be removed")
    }

    @Test
    fun `should not apply SSR when ngrams is 1`() {
        // Arrange - SSR only applies when ngrams > 1
        val stage = NgramsStage(ngrams = 1)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("customer", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("order", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("customer", "order"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert - just unigrams, no SSR needed
        assertEquals(2, result.size)
        assertEquals("customer", result[0].text)
        assertEquals("order", result[1].text)
    }

    @Test
    fun `should not apply SSR when enableSsr is false`() {
        // Arrange - SSR can be disabled with enableSsr=false
        val stage = NgramsStage(ngrams = 3, enableSsr = false)
        val splitResults =
            listOf(
                SplitStage.SplitResult(
                    words =
                        listOf(
                            WeightedText("customer", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("order", 3, ExtractionContext.IDENTIFIER),
                            WeightedText("service", 3, ExtractionContext.IDENTIFIER)
                        ),
                    sourceWords = listOf("customer", "order", "service"),
                    weight = 3,
                    context = ExtractionContext.IDENTIFIER
                )
            )

        // Act
        val result = stage.generateNgrams(splitResults)

        // Assert - with SSR disabled, all n-grams are kept
        val texts = result.map { it.text }
        assertEquals(6, texts.size)
        assertTrue("customer" in texts)
        assertTrue("order" in texts)
        assertTrue("service" in texts)
        assertTrue("customer order" in texts)
        assertTrue("order service" in texts)
        assertTrue("customer order service" in texts)
    }
}
