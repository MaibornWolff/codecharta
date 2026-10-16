package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SqlExtractionTest {
    @Test
    fun `should extract the names of a routine, its parameters, variables and the tables it uses`() {
        // Arrange
        val code = """
            CREATE PROCEDURE dbo.ChargeCustomer @CustomerId INT, @Amount DECIMAL(10, 2)
            AS
            BEGIN
              DECLARE @Total DECIMAL(10, 2);
              INSERT INTO [dbo].[Invoices] (CustomerId) VALUES (@CustomerId);
            END
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SQL)

        // Assert
        assertThat(result.identifiers).containsExactly("ChargeCustomer", "CustomerId", "Amount", "Total", "Invoices")
    }

    @Test
    fun `should extract the names of a table and its columns`() {
        // Arrange
        val code = """
            CREATE TABLE "Dragon_Hoard" (
              hoard_id BIGINT PRIMARY KEY,
              `gold_coins` INT NOT NULL,
              CONSTRAINT positive_gold CHECK (gold_coins >= 0)
            );
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SQL)

        // Assert
        assertThat(result.identifiers).containsExactly("Dragon_Hoard", "hoard_id", "gold_coins")
    }

    @Test
    fun `should extract the names of a view, its common table expressions and the tables it reads`() {
        // Arrange
        val code = """
            CREATE VIEW rich_dragons AS
              WITH totals AS (SELECT dragon_id FROM hoards)
              SELECT d.name FROM dragons d JOIN totals t ON t.dragon_id = d.id;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SQL)

        // Assert
        assertThat(result.identifiers).containsExactly("rich_dragons", "totals", "hoards", "dragons", "totals")
    }

    @Test
    fun `should extract the names of a package and its routines`() {
        // Arrange
        val code = """
            CREATE OR REPLACE PACKAGE BODY quest_pkg AS
              PROCEDURE start_quest(p_hero IN NUMBER) IS
              BEGIN
                NULL;
              END start_quest;
            END quest_pkg;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SQL)

        // Assert
        assertThat(result.identifiers).containsExactly("quest_pkg", "start_quest", "p_hero")
    }

    @Test
    fun `should extract comments without their markers`() {
        // Arrange
        val code = """
            -- Heroes level up here
            /* Experience is
               counted in points */
            # MySQL style
            SELECT 1;
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SQL)

        // Assert
        assertThat(result.comments).containsExactly("Heroes level up here", "Experience is\ncounted in points", "MySQL style")
    }

    @Test
    fun `should extract strings without their quotes and prefixes`() {
        // Arrange
        val code = """
            SELECT 'it''s', N'Unicode', E'tab', q'[Oracle's]',
              ${'$'}${'$'}dollar${'$'}${'$'}, ${'$'}tag${'$'}tagged${'$'}tag${'$'};
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.SQL)

        // Assert
        assertThat(result.strings).containsExactly("it's", "Unicode", "tab", "Oracle's", "dollar", "tagged")
    }
}
