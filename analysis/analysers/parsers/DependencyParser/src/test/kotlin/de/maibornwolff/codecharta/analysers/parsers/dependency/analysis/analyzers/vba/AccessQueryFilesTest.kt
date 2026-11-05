package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AccessQueryFilesTest {
    @Test
    fun `should take a sql file in a folder named queries, in any case, for an Access query`() {
        // Arrange
        val queryFiles = listOf("app.src/queries/qryOrders.sql", "Queries\\qryStock.SQL")
        val otherFiles = listOf("scripts/qryOrders.sql", "queries/qryOrders.bas", "qryOrders.sql")

        // Act
        val found = (queryFiles + otherFiles).filter { AccessQueryFiles.isQueryFile(it) }

        // Assert
        assertThat(found).isEqualTo(queryFiles)
    }

    @Test
    fun `should name a query after its file in lower case, as SQL compares an unquoted name`() {
        // Arrange & Act
        val name = AccessQueryFiles.queryNameOf("app.src/queries/qryOrderTotal.sql")

        // Assert
        assertThat(name).isEqualTo("qryordertotal")
    }
}
