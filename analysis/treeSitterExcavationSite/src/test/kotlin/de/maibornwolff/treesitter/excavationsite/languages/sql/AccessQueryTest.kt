package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.api.SqlName
import de.maibornwolff.treesitter.excavationsite.api.SqlNameKind
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class AccessQueryTest {
    private fun name(written: String, kind: SqlNameKind) = SqlName(written.split("."), kind)

    @Test
    fun `should read the forms and reports an Access query names with a bang, and no name of their controls`() {
        // Arrange
        val code = """
            SELECT Orders.OrderID FROM Orders
            WHERE Orders.OrderDate Between [Forms]![frmMainMenu]![sfrmMainMenu].[Form].[txtStartDate]
            And DateAdd("d", 1, Forms!frmFilter!txtEndDate) And Orders.Region = [Reports]![rptRegion]![txtRegion];
        """.trimIndent()

        // Act
        val query = TreeSitterDependencies.accessQuery(code)

        // Assert
        assertThat(query.forms).containsExactly("frmMainMenu", "frmFilter")
        assertThat(query.reports).containsExactly("rptRegion")
        assertThat(query.names).containsExactly(
            name("orders.orderid", SqlNameKind.MEMBER),
            name("orders", SqlNameKind.RELATION),
            name("orders.orderdate", SqlNameKind.MEMBER),
            name("dateadd", SqlNameKind.ROUTINE),
            name("orders.region", SqlNameKind.MEMBER)
        )
    }

    @Test
    fun `should read the tables, queries and functions of an action query`() {
        // Arrange
        val code = """
            UPDATE Orders INNER JOIN qryOrderTotal ON Orders.OrderID = qryOrderTotal.OrderID
            SET Orders.Total = ToCurrency(qryOrderTotal.OrderTotal);
        """.trimIndent()

        // Act
        val names = TreeSitterDependencies.accessQuery(code).names

        // Assert
        assertThat(names.filter { it.kind != SqlNameKind.MEMBER }).containsExactly(
            name("orders", SqlNameKind.RELATION),
            name("qryordertotal", SqlNameKind.RELATION),
            name("tocurrency", SqlNameKind.ROUTINE)
        )
    }
}
