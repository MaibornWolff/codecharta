package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class SqlDependencyTest {
    private fun usedTypes(vararg names: String): Set<UsedType> = names.map { UsedType(it) }.toSet()

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should declare tables, views and routines with the objects they use and their schema as parent`() {
            // Arrange
            val code = """
                CREATE TABLE dbo.Orders (id INT, customer_id INT REFERENCES dbo.Customers(id));
                CREATE VIEW big_orders AS SELECT * FROM [dbo].[Orders] WHERE total > 100;
                CREATE PROCEDURE archive_orders AS BEGIN DELETE FROM Orders; EXEC dbo.log_archive; END
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("orders", DeclarationType.CLASS, usedTypes("dbo.customers"), listOf("dbo")),
                Declaration("big_orders", DeclarationType.CLASS, usedTypes("dbo.orders")),
                Declaration("archive_orders", DeclarationType.FUNCTION, usedTypes("orders", "dbo.log_archive"))
            )
        }

        @Test
        fun `should keep the last two parts of a name the object is used by`() {
            // Arrange
            val code = """CREATE VIEW v AS SELECT * FROM warehouse.dbo."Stock" JOIN pricing.discount(1) d ON 1 = 1;"""

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("v", DeclarationType.CLASS, usedTypes("dbo.Stock", "pricing.discount"))
            )
        }

        @Test
        fun `should keep the case of a name quoted in mixed case and fold every other name to lower case`() {
            // Arrange
            val code = """
                CREATE TABLE "Orders" (id INT);
                CREATE VIEW v AS
                  SELECT * FROM "Orders" JOIN ORDERS ON 1 = 1 JOIN "orders" ON 1 = 1 JOIN "ITEMS" ON 1 = 1 JOIN [Stock] ON 1 = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("Orders", DeclarationType.CLASS, usedTypes()),
                Declaration("v", DeclarationType.CLASS, usedTypes("Orders", "orders", "items", "stock"))
            )
        }

        @Test
        fun `should give the routines of a package the package as parent`() {
            // Arrange
            val code = """
                CREATE OR REPLACE PACKAGE BODY quest_pkg AS
                  c_reward CONSTANT NUMBER := reward_rules.base_reward();
                  PROCEDURE start_quest(p_hero IN NUMBER) IS
                  BEGIN
                    INSERT INTO quests (hero_id) VALUES (p_hero);
                  END start_quest;
                END quest_pkg;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("quest_pkg", DeclarationType.CLASS, usedTypes("reward_rules.base_reward")),
                Declaration("start_quest", DeclarationType.FUNCTION, usedTypes("quests"), listOf("quest_pkg"))
            )
        }

        @Test
        fun `should give the routines of an Oracle type body the type as parent`() {
            // Arrange
            val code = """
                CREATE OR REPLACE TYPE BODY money_t AS
                  MEMBER PROCEDURE book IS BEGIN INSERT INTO ledger (id) VALUES (1); END;
                  STATIC FUNCTION zero RETURN money_t IS BEGIN RETURN money_t(0); END;
                END;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("money_t", DeclarationType.CLASS, usedTypes()),
                Declaration("book", DeclarationType.FUNCTION, usedTypes("ledger"), listOf("money_t")),
                Declaration("zero", DeclarationType.FUNCTION, usedTypes("money_t"), listOf("money_t"))
            )
        }

        @Test
        fun `should declare no temporary view, while what its query uses counts for the script`() {
            // Arrange
            val code = """
                CREATE TABLE orders (id INT);
                CREATE OR REPLACE TEMP VIEW recent_orders AS SELECT * FROM orders;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("orders", DeclarationType.CLASS, usedTypes()),
                Declaration("", DeclarationType.SCRIPT, usedTypes("orders"))
            )
        }

        @Test
        fun `should declare a trigger without a body with its table and its function`() {
            // Arrange
            val code = "CREATE TRIGGER items_touch BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.touch();"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("items_touch", DeclarationType.FUNCTION, usedTypes("public.items", "public.touch"))
            )
        }

        @Test
        fun `should make a table use the tables it inherits from or copies`() {
            // Arrange
            val code = """
                CREATE TABLE centaur (hoof_size INT) INHERITS (creature);
                CREATE TABLE orders_copy LIKE orders;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("centaur", DeclarationType.CLASS, usedTypes("creature")),
                Declaration("orders_copy", DeclarationType.CLASS, usedTypes("orders"))
            )
        }

        @Test
        fun `should declare an Oracle global temporary table that routines use`() {
            // Arrange
            val code = """
                CREATE GLOBAL TEMPORARY TABLE staging_orders (id NUMBER) ON COMMIT DELETE ROWS;
                CREATE OR REPLACE PROCEDURE load_orders IS BEGIN INSERT INTO staging_orders (id) VALUES (1); END;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("staging_orders", DeclarationType.CLASS, usedTypes()),
                Declaration("load_orders", DeclarationType.FUNCTION, usedTypes("staging_orders"))
            )
        }

        @Test
        fun `should declare a synonym that uses the object it stands for`() {
            // Arrange
            val code = "CREATE OR REPLACE PUBLIC SYNONYM creature_entity FOR &owner..creature;"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(Declaration("creature_entity", DeclarationType.CLASS, usedTypes("creature")))
        }

        @Test
        fun `should count the table a type is anchored to as used`() {
            // Arrange
            val code = """
                CREATE PROCEDURE p(p_id IN orders.id%TYPE) IS
                  v_row heroes%ROWTYPE;
                  v_copy v_row%TYPE;
                BEGIN
                  NULL;
                END;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(Declaration("p", DeclarationType.FUNCTION, usedTypes("orders", "heroes")))
        }

        @Test
        fun `should declare nothing for altering, granting or dropping an object`() {
            // Arrange
            val code = """
                ALTER PROCEDURE archive_orders COMPILE;
                GRANT EXECUTE ON archive_orders TO clerks;
                DROP VIEW IF EXISTS big_orders;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).isEmpty()
        }

        @Test
        fun `should leave out the definitions inside a routine`() {
            // Arrange
            val code = """
                CREATE PROCEDURE p AS
                BEGIN
                  CREATE TABLE #batch (id INT);
                  INSERT INTO #batch SELECT id FROM orders;
                END
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(Declaration("p", DeclarationType.FUNCTION, usedTypes("orders")))
        }
    }

    @Nested
    inner class UsedObjects {
        @Test
        fun `should not count a common table expression as a used object`() {
            // Arrange
            val code = """
                CREATE VIEW rich AS
                  WITH totals AS (SELECT hero_id FROM hoards)
                  SELECT * FROM heroes JOIN totals ON totals.hero_id = heroes.id;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(Declaration("rich", DeclarationType.CLASS, usedTypes("hoards", "heroes")))
        }

        @Test
        fun `should not count variables, temporary tables or template placeholders as used objects`() {
            // Arrange
            val code = """
                CREATE PROCEDURE p AS
                BEGIN
                  SELECT 1 INTO @total FROM #scratch;
                  SELECT * FROM {{ ref('orders') }};
                  UPDATE :new SET x = 1;
                END
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(Declaration("p", DeclarationType.FUNCTION, emptySet()))
        }

        @Test
        fun `should not count the types of columns and parameters as used objects`() {
            // Arrange
            val code = """
                CREATE TABLE heroes (id INT, name VARCHAR(100), gold DECIMAL(10, 2) DEFAULT 0);
                CREATE FUNCTION greet(p_name VARCHAR(20)) RETURNS TEXT AS ${'$'}${'$'} SELECT 'hi' ${'$'}${'$'} LANGUAGE sql;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("heroes", DeclarationType.CLASS, emptySet()),
                Declaration("greet", DeclarationType.FUNCTION, emptySet())
            )
        }

        @Test
        fun `should collect what a script uses outside any definition into one script declaration`() {
            // Arrange
            val code = """
                INSERT INTO heroes SELECT * FROM staging_heroes;
                CREATE VIEW v AS SELECT * FROM heroes;
                EXEC refresh_rankings;
            """.trimIndent()

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.declarations).containsExactly(
                Declaration("v", DeclarationType.CLASS, usedTypes("heroes")),
                Declaration("", DeclarationType.SCRIPT, usedTypes("heroes", "staging_heroes", "refresh_rankings"))
            )
        }
    }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should support dependency analysis for SQL`() {
            // Arrange
            val language = Language.SQL

            // Act
            val isSupported = TreeSitterDependencies.isDependencyAnalysisSupported(language)

            // Assert
            assertThat(isSupported).isTrue()
        }

        @Test
        fun `should report neither a package nor imports for SQL`() {
            // Arrange
            val code = "CREATE TABLE heroes (id INT);"

            // Act
            val result = TreeSitterDependencies.analyze(code, Language.SQL)

            // Assert
            assertThat(result.packagePath).isEmpty()
            assertThat(result.imports).isEmpty()
        }
    }
}
