package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SqlMetricsTest {
    @Test
    fun `should count if and elsif for complexity`() {
        // Arrange
        val code = """
            BEGIN
              IF v_total > 1000 THEN
                v_rate := 0.1;
              ELSIF v_total > 500 THEN
                v_rate := 0.05;
              ELSE
                v_rate := 0;
              END IF;
            END;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count a T-SQL else if as a branch of its own`() {
        // Arrange
        val code = """
            IF @Mode = 0
            BEGIN
              SELECT 1
            END
            ELSE IF @Mode = 1
              SELECT 2
            ELSE
              SELECT 3
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count every loop of every dialect for complexity`() {
        // Arrange
        val code = """
            BEGIN
              WHILE @i < 10 BEGIN SET @i = @i + 1 END
              WHILE i < 5 DO SET i = i + 1; END WHILE;
              WHILE v_left > 0 LOOP v_left := v_left - 1; END LOOP;
              LOOP EXIT; END LOOP;
              FOR r IN 1..3 LOOP NULL; END LOOP;
              REPEAT SET i = i - 1; UNTIL i < 0 END REPEAT;
            END;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(6.0)
    }

    @Test
    fun `should count each when of a case for complexity`() {
        // Arrange
        val code = "SELECT CASE WHEN a = 1 THEN 'x' WHEN a = 2 THEN 'y' ELSE 'z' END FROM t;"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count and and or but not the and of between for complexity`() {
        // Arrange
        val code = "SELECT * FROM t WHERE a = 1 AND b = 2 OR c BETWEEN 1 AND 5;"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count exception handlers of every dialect for complexity`() {
        // Arrange
        val code = """
            BEGIN
              NULL;
            EXCEPTION
              WHEN NO_DATA_FOUND THEN NULL;
              WHEN OTHERS THEN NULL;
            END;
            BEGIN TRY SELECT 1 END TRY BEGIN CATCH SELECT 2 END CATCH
            BEGIN
              DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
            END
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(4.0)
    }

    @Test
    fun `should not count if exists of a ddl statement for complexity`() {
        // Arrange
        val code = """
            DROP TABLE IF EXISTS old_orders;
            CREATE TABLE IF NOT EXISTS orders (id INT);
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(0.0)
    }

    @Test
    fun `should count routines with a body as functions`() {
        // Arrange
        val code = """
            CREATE OR REPLACE PACKAGE BODY billing AS
              PROCEDURE charge(p_id IN NUMBER);
              PROCEDURE charge(p_id IN NUMBER) IS BEGIN NULL; END charge;
              FUNCTION total RETURN NUMBER IS BEGIN RETURN 0; END total;
            END billing;
            /
            CREATE TRIGGER items_touch BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION touch();
            ALTER PROCEDURE charge COMPILE;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
    }

    @Test
    fun `should add one complexity per routine and count its branches per function`() {
        // Arrange
        val code = """
            CREATE PROCEDURE dbo.archive @days INT
            AS
            BEGIN
              IF @days > 30 AND @days < 365
                DELETE FROM orders WHERE age > @days
            END
            GO
            CREATE FUNCTION public.touch() RETURNS trigger LANGUAGE plpgsql AS ${'$'}${'$'}
            BEGIN
              NEW.updated_at := now();
              RETURN NEW;
            END;
            ${'$'}${'$'};
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(4.0)
        assertThat(result.perFunctionMetrics["max_complexity_per_function"]).isEqualTo(2.0)
        assertThat(result.perFunctionMetrics["min_complexity_per_function"]).isEqualTo(0.0)
    }

    @Test
    fun `should count the parameters of each routine`() {
        // Arrange
        val code = """
            CREATE PROCEDURE dbo.archive @days INT, @dry_run BIT = 0 AS SELECT 1
            GO
            DELIMITER //
            CREATE PROCEDURE p_count(IN p_min INT, IN p_max INT, OUT p_total INT)
            BEGIN
              SELECT COUNT(*) INTO p_total FROM orders WHERE amount BETWEEN p_min AND p_max;
            END //
            DELIMITER ;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(3.0)
        assertThat(result.perFunctionMetrics["min_parameters_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should count the code lines of a routine body`() {
        // Arrange
        val code = """
            CREATE PROCEDURE p
            AS
            BEGIN
              SELECT 1;
              -- a comment
              SELECT 2;
            END
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(4.0)
    }

    @Test
    fun `should count comment lines of every comment style`() {
        // Arrange
        val code = """
            -- line comment
            /* block
               comment */
            # MySQL comment
            SELECT #temp_id FROM #temp;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.commentLines).isEqualTo(4.0)
        assertThat(result.realLinesOfCode).isEqualTo(1.0)
    }
}
