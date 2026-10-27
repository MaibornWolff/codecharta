package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SqlCopyRulesTest {
    private fun file(slashed: String) = FilePath(slashed.split("/"))

    private fun copies(vararg files: String) = files.map { DeclaringCopy(file(it), isFileScoped = false) }

    @Test
    fun `should point at the copy the using file creates itself rather than the latest migration`() {
        // Act
        val files = SqlCopyRules.filesFor(copies("db/init_structure.sql", "db/structure.sql"), file("db/init_structure.sql"))

        // Assert
        assertThat(files).containsExactly(file("db/init_structure.sql"))
    }

    @Test
    fun `should point at the latest migration when the using file creates no copy`() {
        // Act
        val files = SqlCopyRules.filesFor(copies("db/V2__items.sql", "db/V10__items.sql"), file("db/V3__report.sql"))

        // Assert
        assertThat(files).containsExactly(file("db/V10__items.sql"))
    }

    @Test
    fun `should point at another file's declaration rather than the own implementation part`() {
        // Arrange
        val ownPart = DeclaringCopy(file("db/V3__alter.sql"), isFileScoped = true)

        // Act
        val files = SqlCopyRules.filesFor(copies("db/V1__items.sql") + ownPart, file("db/V3__alter.sql"))

        // Assert
        assertThat(files).containsExactly(file("db/V1__items.sql"))
    }
}
