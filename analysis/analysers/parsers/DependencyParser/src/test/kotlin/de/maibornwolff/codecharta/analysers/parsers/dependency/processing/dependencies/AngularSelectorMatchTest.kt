package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.treesitter.excavationsite.api.AngularSelector
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AngularSelectorMatchTest {
    private val litButton = AngularSelector(
        element = "button",
        attributes = mapOf("appGlow" to "", "type" to "submit", "class" to "lit wide"),
        classNames = setOf("lit", "wide")
    )

    @Test
    fun `should match an element by its tag and attributes only together`() {
        // Arrange
        val selector = AngularSelector(element = "button", attributes = mapOf("appGlow" to ""))
        val linkWithGlow = AngularSelector(element = "a", attributes = mapOf("appGlow" to ""))

        // Act
        val matches = listOf(litButton, linkWithGlow, AngularSelector(element = "button")).map { selector.matches(it) }

        // Assert
        assertThat(matches).containsExactly(true, false, false)
    }

    @Test
    fun `should match an attribute value only when the selector names that value`() {
        // Arrange
        val submit = AngularSelector(attributes = mapOf("type" to "submit"))
        val reset = AngularSelector(attributes = mapOf("type" to "reset"))

        // Act
        val matches = listOf(submit, reset).map { it.matches(litButton) }

        // Assert
        assertThat(matches).containsExactly(true, false)
    }

    @Test
    fun `should match the classes of an element`() {
        // Arrange
        val lit = AngularSelector(classNames = setOf("lit"))
        val litAndDark = AngularSelector(classNames = setOf("lit", "dark"))

        // Act
        val matches = listOf(lit, litAndDark).map { it.matches(litButton) }

        // Assert
        assertThat(matches).containsExactly(true, false)
    }

    @Test
    fun `should not match an element that matches a not part of the selector`() {
        // Arrange
        val glowNotButton = AngularSelector(attributes = mapOf("appGlow" to ""), notSelectors = listOf(AngularSelector(element = "button")))
        val anyNotLink = AngularSelector(notSelectors = listOf(AngularSelector(element = "a")))

        // Act
        val matches = listOf(glowNotButton, anyNotLink).map { it.matches(litButton) }

        // Assert
        assertThat(matches).containsExactly(false, true)
    }
}
