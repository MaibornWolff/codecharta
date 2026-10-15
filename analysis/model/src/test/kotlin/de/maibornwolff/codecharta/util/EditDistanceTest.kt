package de.maibornwolff.codecharta.util

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class EditDistanceTest {
    @Test
    fun `should count the single edits that turn one text into the other`() {
        // Arrange
        val misspelt = "rlco"

        // Act
        val distance = EditDistance.between(misspelt, "rloc")

        // Assert
        assertThat(distance).isEqualTo(2)
    }

    @Test
    fun `should be zero for equal texts`() {
        // Arrange
        val text = "complexity"

        // Act
        val distance = EditDistance.between(text, text)

        // Assert
        assertThat(distance).isZero()
    }
}
