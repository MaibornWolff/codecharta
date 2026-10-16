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
    fun `should count an IIF for complexity`() {
        // Arrange
        val code = "SELECT IIF(a > 1, 'x', 'y'), iif FROM t;"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(1.0)
    }

    @Test
    fun `should count an EXIT or CONTINUE with a condition but not one without for complexity`() {
        // Arrange
        val code = """
            BEGIN
              LOOP
                CONTINUE outer_loop WHEN c1%NOTFOUND;
                EXIT WHEN v_done;
                EXIT;
              END LOOP;
            END;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.complexity).isEqualTo(3.0)
    }

    @Test
    fun `should count a MySQL routine of a single statement as a function`() {
        // Arrange
        val code = """
            CREATE FUNCTION grade(p_hp INT) RETURNS INT DETERMINISTIC RETURN CASE WHEN p_hp > 0 THEN 1 ELSE 0 END;
            CREATE TRIGGER touch BEFORE UPDATE ON items FOR EACH ROW SET NEW.updated_at = NOW();
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(2.0)
        assertThat(result.complexity).isEqualTo(3.0)
        assertThat(result.perFunctionMetrics["max_complexity_per_function"]).isEqualTo(1.0)
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(1.0)
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
    fun `should count the stored procedures a file defines, alone or in a package body`() {
        // Arrange
        val code = """
            CREATE PROCEDURE dbo.archive AS BEGIN SELECT 1 END
            GO
            CREATE OR REPLACE PACKAGE billing AS
              PROCEDURE charge(p_id IN NUMBER);
            END billing;
            /
            CREATE OR REPLACE PACKAGE BODY billing AS
              PROCEDURE charge(p_id IN NUMBER) IS BEGIN NULL; END charge;
              PROCEDURE refund(p_id IN NUMBER) IS BEGIN NULL; END refund;
              FUNCTION total RETURN NUMBER IS BEGIN RETURN 0; END total;
            END billing;
            /
            ALTER PROCEDURE archive COMPILE;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfStoredProcedures).isEqualTo(3.0)
    }

    @Test
    fun `should count the triggers a file creates, with a body or calling a function`() {
        // Arrange
        val code = """
            CREATE TRIGGER audit AFTER INSERT ON items FOR EACH ROW BEGIN INSERT INTO log VALUES (NEW.id); END;
            CREATE TRIGGER touch BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION touch();
            ALTER TRIGGER audit DISABLE;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfTriggers).isEqualTo(2.0)
    }

    @Test
    fun `should count views, materialized ones included, and tables, but not a view a statement only renames`() {
        // Arrange
        val code = """
            CREATE TABLE orders (id INT);
            CREATE TABLE IF NOT EXISTS items (id INT);
            CREATE VIEW big_orders AS SELECT * FROM orders;
            CREATE MATERIALIZED VIEW order_totals AS SELECT COUNT(*) FROM orders;
            ALTER VIEW order_totals RENAME TO order_sums;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfTables).isEqualTo(2.0)
        assertThat(result.numberOfViews).isEqualTo(2.0)
    }

    @Test
    fun `should count no temporary table of any dialect and no table a routine creates`() {
        // Arrange
        val code = """
            CREATE TABLE orders (id INT);
            CREATE TABLE #scratch (id INT);
            CREATE TEMPORARY TABLE tmp1 (id INT);
            CREATE TEMP TABLE tmp2 AS SELECT 1;
            CREATE GLOBAL TEMPORARY TABLE gtt (id INT) ON COMMIT DELETE ROWS;
            CREATE FUNCTION load_staging() RETURNS void AS $$
            BEGIN
              CREATE TABLE staging_rows (id INT);
            END;
            $$ LANGUAGE plpgsql;
            CREATE PROCEDURE dbo.rebuild AS
            BEGIN
              CREATE TABLE dbo.rebuilt (id INT);
            END
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfTables).isEqualTo(1.0)
    }

    @Test
    fun `should count an object created and then altered or created again in one file once`() {
        // Arrange
        val code = """
            CREATE TABLE orders (id INT);
            CREATE TABLE IF NOT EXISTS ORDERS (id INT);
            CREATE VIEW big_orders AS SELECT * FROM orders;
            GO
            ALTER VIEW big_orders AS SELECT id FROM orders;
            GO
            CREATE PROCEDURE dbo.archive AS BEGIN SELECT 1 END
            GO
            ALTER PROCEDURE dbo.archive AS BEGIN SELECT 2 END
            GO
            CREATE TRIGGER dbo.touch ON dbo.orders AFTER UPDATE AS BEGIN SELECT 1 END
            GO
            ALTER TRIGGER dbo.touch ON dbo.orders AFTER UPDATE AS BEGIN SELECT 2 END
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfTables).isEqualTo(1.0)
        assertThat(result.numberOfViews).isEqualTo(1.0)
        assertThat(result.numberOfStoredProcedures).isEqualTo(1.0)
        assertThat(result.numberOfTriggers).isEqualTo(1.0)
    }

    @Test
    fun `should count an object named with its schema and then without it once`() {
        // Arrange
        val code = """
            CREATE PROCEDURE dbo.p1 AS BEGIN SELECT 1 END
            GO
            ALTER PROCEDURE p1 AS BEGIN SELECT 2 END
            GO
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfStoredProcedures).isEqualTo(1.0)
    }

    @Test
    fun `should count PostgreSQL triggers of one name on different tables apart`() {
        // Arrange
        val code = """
            CREATE TRIGGER set_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION touch();
            CREATE TRIGGER set_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION touch();
            CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION touch();
            CREATE OR REPLACE TRIGGER set_timestamp BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION touch();
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfTriggers).isEqualTo(3.0)
    }

    @Test
    fun `should leave parameter modes and defaults out of an overload`() {
        // Arrange
        val code = """
            CREATE PROCEDURE r(a IN NUMBER) IS BEGIN NULL; END;
            /
            CREATE OR REPLACE PROCEDURE r(a NUMBER DEFAULT 0) IS BEGIN NULL; END;
            /
            CREATE OR REPLACE PROCEDURE r(b IN OUT NOCOPY NUMBER) IS BEGIN NULL; END;
            /
            create procedure q(inout n int) as $$ begin n := 1; end; $$ language plpgsql;
            create or replace procedure q(n int) as $$ begin n := 2; end; $$ language plpgsql;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfStoredProcedures).isEqualTo(2.0)
    }

    @Test
    fun `should tell overloads with unnamed PostgreSQL parameters apart by their types`() {
        // Arrange
        val code = """
            CREATE PROCEDURE p(int) AS $$ BEGIN NULL; END; $$ LANGUAGE plpgsql;
            CREATE PROCEDURE p(text) AS $$ BEGIN NULL; END; $$ LANGUAGE plpgsql;
            CREATE PROCEDURE p(varchar(10)) AS $$ BEGIN NULL; END; $$ LANGUAGE plpgsql;
            CREATE OR REPLACE PROCEDURE p(v varchar(10)) AS $$ BEGIN NULL; END; $$ LANGUAGE plpgsql;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfStoredProcedures).isEqualTo(3.0)
    }

    @Test
    fun `should count a T-SQL procedure altered with other parameters once, as T-SQL has no overloads`() {
        // Arrange
        val code = """
            CREATE PROCEDURE dbo.s @a INT AS BEGIN SELECT 1 END
            GO
            ALTER PROCEDURE dbo.s @a INT, @b INT AS BEGIN SELECT 2 END
            GO
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfStoredProcedures).isEqualTo(1.0)
    }

    @Test
    fun `should count objects of one name in two schemas apart`() {
        // Arrange
        val code = """
            CREATE TABLE public.orders (id int);
            CREATE TABLE audit.orders (id int, changed_at timestamptz);
            CREATE VIEW public.open_orders AS SELECT * FROM public.orders;
            CREATE VIEW reporting.open_orders AS SELECT * FROM public.orders;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfTables).isEqualTo(2.0)
        assertThat(result.numberOfViews).isEqualTo(2.0)
    }

    @Test
    fun `should count an object without a schema apart when the file holds that name in several schemas`() {
        // Arrange
        val code = """
            CREATE TABLE public.orders (id int);
            CREATE TABLE audit.orders (id int);
            CREATE TABLE IF NOT EXISTS orders (id int);
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfTables).isEqualTo(3.0)
    }

    @Test
    fun `should tell names apart the way the dependencies do, a quoted name in mixed case keeping its case`() {
        // Arrange
        val code = """
            CREATE TABLE dbo.Orders (id INT);
            CREATE TABLE "Orders" (id INT);
            CREATE TABLE [orders] (id INT);
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfTables).isEqualTo(2.0)
    }

    @Test
    fun `should count overloaded routines of different parameter types apart`() {
        // Arrange
        val code = """
            CREATE OR REPLACE PACKAGE BODY pkg AS
              PROCEDURE p(a NUMBER) IS BEGIN NULL; END p;
              PROCEDURE p(a VARCHAR2) IS BEGIN NULL; END p;
              PROCEDURE p(b NUMBER) IS BEGIN NULL; END p;
            END pkg;
            /
            CREATE PROCEDURE pg_p(a int, b text) LANGUAGE plpgsql AS $$ BEGIN NULL; END $$;
            CREATE PROCEDURE pg_p(a text) LANGUAGE plpgsql AS $$ BEGIN NULL; END $$;
            CREATE OR REPLACE PROCEDURE pg_p(x INT, y TEXT = 'none') LANGUAGE plpgsql AS $$ BEGIN NULL; END $$;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfStoredProcedures).isEqualTo(4.0)
    }

    @Test
    fun `should count T-SQL objects that ALTER defines with a body`() {
        // Arrange
        val code = """
            ALTER PROCEDURE dbo.archive @days INT AS BEGIN SELECT @days END
            GO
            ALTER VIEW dbo.big_orders AS SELECT id FROM dbo.orders
            GO
            CREATE TRIGGER dbo.audit ON dbo.orders AFTER INSERT, UPDATE AS
            BEGIN
              SET NOCOUNT ON;
            END
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfStoredProcedures).isEqualTo(1.0)
        assertThat(result.numberOfViews).isEqualTo(1.0)
        assertThat(result.numberOfTriggers).isEqualTo(1.0)
    }

    @Test
    fun `should count no local procedure of a routine as a stored procedure, and each package of one name apart`() {
        // Arrange
        val code = """
            CREATE OR REPLACE PROCEDURE raise_salary IS
              PROCEDURE log_raise IS BEGIN NULL; END log_raise;
            BEGIN
              log_raise;
            END raise_salary;
            /
            CREATE OR REPLACE PACKAGE BODY billing AS
              PROCEDURE charge IS BEGIN NULL; END charge;
            END billing;
            /
            CREATE OR REPLACE PACKAGE BODY refunds AS
              PROCEDURE charge IS BEGIN NULL; END charge;
            END refunds;
            /
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfStoredProcedures).isEqualTo(3.0)
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
    fun `should count a parameter that follows one with a default value`() {
        // Arrange
        val code = "CREATE PROCEDURE edge_defaults @roll INT = 10, @result INT OUTPUT AS SELECT 1"

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should count the code lines of a routine body but not its END line`() {
        // Arrange
        val code = """
            CREATE PROCEDURE p
            AS
            BEGIN
              SELECT 1;
              -- a comment
              SELECT 2;
            END p;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(3.0)
    }

    @Test
    fun `should count neither the END line nor the closing dollar quote line of a PostgreSQL routine`() {
        // Arrange
        val code = """
            CREATE FUNCTION f() RETURNS int AS $$
            BEGIN
              SELECT 1;
              SELECT 2;
            END;
            $$ LANGUAGE plpgsql;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.perFunctionMetrics["max_rloc_per_function"]).isEqualTo(3.0)
    }

    @Test
    fun `should go on measuring after a dollar quote whose tag has capitals`() {
        // Arrange
        val code = """
            SELECT ${'$'}Q${'$'}hello${'$'}Q${'$'};
            CREATE FUNCTION f() RETURNS int AS ${'$'}BODY${'$'}
            BEGIN
              IF 1 = 1 THEN RETURN 1; END IF;
              RETURN ${'$'}body${'$'} not the end ${'$'}body${'$'};
            END;
            ${'$'}BODY${'$'} LANGUAGE plpgsql;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.numberOfFunctions).isEqualTo(1.0)
        assertThat(result.complexity).isEqualTo(2.0)
    }

    @Test
    fun `should count the conditions of a WHERE clause whose line starts with remark`() {
        // Arrange
        val code = """
            SELECT id FROM notes WHERE a = 1 AND
            remark IS NULL OR b = 2 OR c = 3;
        """.trimIndent()

        // Act
        val result = TreeSitterMetrics.parse(code, Language.SQL)

        // Assert
        assertThat(result.logicComplexity).isEqualTo(3.0)
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
