package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.api.SqlMember
import de.maibornwolff.treesitter.excavationsite.api.SqlMemberKind
import de.maibornwolff.treesitter.excavationsite.api.SqlObjectKind
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class SqlScriptTest {
    private fun objectsOf(code: String) = TreeSitterDependencies.sqlScript(code.trimIndent()).objects

    @Nested
    inner class Objects {
        @Test
        fun `should read every object a statement creates with its kind and its name as written`() {
            // Arrange
            val code = """
                CREATE TABLE dbo.Orders (id INT);
                CREATE VIEW big_orders AS SELECT * FROM dbo.Orders;
                CREATE SYNONYM order_entity FOR dbo.Orders;
                CREATE SEQUENCE warehouse.dbo.order_seq START WITH 1;
                CREATE TYPE mood AS ENUM ('calm', 'angry');
                CREATE DOMAIN positive_int AS INT CHECK (VALUE > 0);
                CREATE FUNCTION roll() RETURNS INT AS $$ SELECT 4 $$ LANGUAGE sql;
                CREATE TRIGGER order_logged AFTER INSERT ON dbo.Orders FOR EACH ROW EXECUTE FUNCTION roll();
            """

            // Act
            val objects = objectsOf(code)

            // Assert
            assertThat(objects).extracting({ it.kind }, { it.name }).containsExactly(
                tuple(SqlObjectKind.TABLE, listOf("dbo", "orders")),
                tuple(SqlObjectKind.VIEW, listOf("big_orders")),
                tuple(SqlObjectKind.SYNONYM, listOf("order_entity")),
                tuple(SqlObjectKind.SEQUENCE, listOf("dbo", "order_seq")),
                tuple(SqlObjectKind.TYPE, listOf("mood")),
                tuple(SqlObjectKind.DOMAIN, listOf("positive_int")),
                tuple(SqlObjectKind.ROUTINE, listOf("roll")),
                tuple(SqlObjectKind.TRIGGER, listOf("order_logged"))
            )
        }

        @Test
        fun `should read a function that returns a trigger as a routine`() {
            // Arrange
            val code = "CREATE FUNCTION audit() RETURNS TRIGGER AS $$ BEGIN RETURN NEW; END $$ LANGUAGE plpgsql;"

            // Act
            val objects = objectsOf(code)

            // Assert
            assertThat(objects.map { it.kind }).containsExactly(SqlObjectKind.ROUTINE)
        }

        @Test
        fun `should give the objects after SET search_path or CURRENT_SCHEMA that schema as their default`() {
            // Arrange
            val code = """
                CREATE TABLE plain (id INT);
                SET search_path TO "${'$'}user", sales, public;
                CREATE TABLE orders (id INT);
                ALTER SESSION SET CURRENT_SCHEMA = app;
                CREATE TABLE customers (id INT);
                SET SCHEMA 'hr';
                CREATE TABLE staff (id INT);
            """

            // Act
            val objects = objectsOf(code)

            // Assert
            assertThat(objects).extracting({ it.name.single() }, { it.defaultSchema }).containsExactly(
                tuple("plain", null),
                tuple("orders", "sales"),
                tuple("customers", "app"),
                tuple("staff", "hr")
            )
        }

        @Test
        fun `should read no default schema from USE`() {
            // Arrange
            val code = "USE shop;\nCREATE TABLE orders (id INT);"

            // Act
            val objects = objectsOf(code)

            // Assert
            assertThat(objects.single().defaultSchema).isNull()
        }
    }

    @Nested
    inner class Changes {
        @Test
        fun `should read ALTER, CREATE INDEX and COMMENT ON as changes of the object they name`() {
            // Arrange
            val code = """
                ALTER TABLE IF EXISTS sales.orders ADD FOREIGN KEY (customer_id) REFERENCES customers (id);
                CREATE UNIQUE INDEX orders_by_customer ON orders (customer_id);
                COMMENT ON COLUMN refunds.total IS 'in cents';
                ALTER SEQUENCE order_seq RESTART;
                ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY';
            """

            // Act
            val objects = objectsOf(code)

            // Assert
            assertThat(objects).extracting({ it.kind }, { it.name }, { it.changedKind }).containsExactly(
                tuple(SqlObjectKind.CHANGE, listOf("sales", "orders"), null),
                tuple(SqlObjectKind.CHANGE, listOf("orders"), null),
                tuple(SqlObjectKind.CHANGE, listOf("refunds"), null),
                tuple(SqlObjectKind.CHANGE, listOf("order_seq"), SqlObjectKind.SEQUENCE)
            )
        }

        @Test
        fun `should end a T-SQL statement without a semicolon where the next one starts`() {
            // Arrange
            val code = """
                ALTER TABLE orders ADD total INT
                CREATE INDEX orders_by_total ON refunds (total)
            """

            // Act
            val objects = objectsOf(code)

            // Assert
            assertThat(objects.map { it.name }).containsExactly(listOf("orders"), listOf("refunds"))
        }
    }

    @Nested
    inner class Packages {
        @Test
        fun `should read the members of a package specification with their kinds`() {
            // Arrange
            val code = """
                CREATE OR REPLACE PACKAGE pricing AS
                    c_max CONSTANT NUMBER := 10;
                    g_calls NUMBER;
                    TYPE t_rec IS RECORD (amount NUMBER);
                    CURSOR c_orders IS SELECT id FROM orders;
                    e_too_big EXCEPTION;
                    PRAGMA EXCEPTION_INIT(e_too_big, -20001);
                    FUNCTION total(p_id NUMBER) RETURN NUMBER;
                END pricing;
                /
            """

            // Act
            val specification = objectsOf(code).single()

            // Assert
            assertThat(specification.kind).isEqualTo(SqlObjectKind.PACKAGE)
            assertThat(specification.members).containsExactly(
                SqlMember("c_max", SqlMemberKind.CONSTANT),
                SqlMember("g_calls", SqlMemberKind.VARIABLE),
                SqlMember("t_rec", SqlMemberKind.TYPE),
                SqlMember("c_orders", SqlMemberKind.CURSOR),
                SqlMember("e_too_big", SqlMemberKind.EXCEPTION),
                SqlMember("total", SqlMemberKind.ROUTINE)
            )
        }

        @Test
        fun `should read the routines of a package body and of an object type body`() {
            // Arrange
            val code = """
                CREATE OR REPLACE PACKAGE BODY pricing AS
                    FUNCTION helper RETURN NUMBER IS BEGIN RETURN 1; END helper;
                BEGIN
                    NULL;
                END pricing;
                /
                CREATE OR REPLACE TYPE BODY point_t AS
                    MEMBER FUNCTION len RETURN NUMBER IS BEGIN RETURN 1; END;
                END;
                /
            """

            // Act
            val objects = objectsOf(code)

            // Assert
            assertThat(objects).extracting({ it.kind }, { it.name }, { it.members.map { member -> member.name } }).containsExactly(
                tuple(SqlObjectKind.PACKAGE_BODY, listOf("pricing"), listOf("helper")),
                tuple(SqlObjectKind.TYPE_BODY, listOf("point_t"), listOf("len"))
            )
        }
    }
}
