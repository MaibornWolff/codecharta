package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class NaturalPathOrderTest {
    private fun path(vararg segments: String) = segments.toList()

    @Test
    fun `should compare the numbers in names as numbers`() {
        // Arrange
        val paths = listOf(path("db", "V10__a.sql"), path("db", "V2__a.sql"), path("db", "V9__a.sql"), path("db", "V1_1__a.sql"))

        // Act
        val sorted = paths.sortedWith(NaturalPathOrder)

        // Assert
        assertThat(sorted.map { it.last() }).containsExactly("V1_1__a.sql", "V2__a.sql", "V9__a.sql", "V10__a.sql")
    }

    @Test
    fun `should let folders take part in the order like file names`() {
        // Arrange
        val paths = listOf(path("db", "2", "a.sql"), path("db", "1", "z.sql"))

        // Act
        val sorted = paths.sortedWith(NaturalPathOrder)

        // Assert
        assertThat(sorted).containsExactly(path("db", "1", "z.sql"), path("db", "2", "a.sql"))
    }

    @Test
    fun `should put Flyway's repeatable migrations after the versioned ones of their folder`() {
        // Arrange
        val paths = listOf(path("db", "R__views.sql"), path("db", "V10__report.sql"), path("db", "V1__init.sql"))

        // Act
        val sorted = paths.sortedWith(NaturalPathOrder)

        // Assert
        assertThat(sorted.map { it.last() }).containsExactly("V1__init.sql", "V10__report.sql", "R__views.sql")
    }
}
