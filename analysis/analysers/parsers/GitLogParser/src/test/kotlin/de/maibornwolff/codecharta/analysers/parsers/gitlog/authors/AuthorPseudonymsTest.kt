package de.maibornwolff.codecharta.analysers.parsers.gitlog.authors

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AuthorPseudonymsTest {
    private val firstCommit = "abcdef0123456789"
    private val pseudonyms = AuthorPseudonyms(firstCommit)
    private val pairsBeforeRepeating = AuthorPseudonyms.COLOURS.size * AuthorPseudonyms.ANIMALS.size

    @Test
    fun `should keep the names of a repository across runs`() {
        // Arrange
        val positions = 0..4

        // Act
        val names = positions.map { pseudonyms.nameOf(it) }

        // Assert
        assertThat(names).isEqualTo(PINNED_NAMES)
    }

    @Test
    fun `should give the same position another name in another repository`() {
        // Arrange
        val otherRepository = AuthorPseudonyms("0123456789abcdef")

        // Act
        val names = (0..9).map { otherRepository.nameOf(it) }

        // Assert
        assertThat(names).isNotEqualTo((0..9).map { pseudonyms.nameOf(it) })
    }

    @Test
    fun `should use neither a colour nor an animal twice until a list runs out`() {
        // Arrange
        val positions = 0 until minOf(AuthorPseudonyms.COLOURS.size, AuthorPseudonyms.ANIMALS.size)

        // Act
        val names = positions.map { pseudonyms.nameOf(it).split(" ") }

        // Assert
        assertThat(names.map { it[0] }).doesNotHaveDuplicates()
        assertThat(names.map { it[1] }).doesNotHaveDuplicates()
    }

    @Test
    fun `should give every person a name of their own, also past the last word pair`() {
        // Arrange
        val positions = 0 until pairsBeforeRepeating + 100

        // Act
        val names = positions.map { pseudonyms.nameOf(it) }

        // Assert
        assertThat(names).doesNotHaveDuplicates()
        assertThat(pseudonyms.nameOf(pairsBeforeRepeating)).isEqualTo("${pseudonyms.nameOf(0)} 2")
    }

    @Test
    fun `should freeze the word lists at sizes that share no divisor`() {
        // Arrange & Act
        val sizes = AuthorPseudonyms.COLOURS.size to AuthorPseudonyms.ANIMALS.size

        // Assert
        assertThat(sizes).isEqualTo(71 to 73)
        assertThat(AuthorPseudonyms.COLOURS + AuthorPseudonyms.ANIMALS).doesNotHaveDuplicates()
    }

    @Test
    fun `should hold no word that could read as an insult`() {
        // Arrange
        val rudeFragments = listOf("cock", "pig", "tit", "ass", "dick", "anal", "shit", "fuck", "bitch", "whore", "slut")
        val unwantedWords = listOf(
            "rat", "snake", "worm", "cow", "bull", "goat", "monkey", "ape", "donkey", "hog", "sloth", "skunk", "weasel", "leech",
            "maggot", "vulture", "hyena", "pink", "brown", "black", "white", "yellow", "red"
        )
        val words = AuthorPseudonyms.COLOURS + AuthorPseudonyms.ANIMALS

        // Act
        val rude = words.filter { word -> word in unwantedWords || rudeFragments.any { it in word } }

        // Assert
        assertThat(rude).isEmpty()
    }

    private companion object {
        val PINNED_NAMES = listOf("Terracotta Tiger", "Violet Otter", "Mulberry Lemur", "Ochre Owl", "Garnet Dolphin")
    }
}
