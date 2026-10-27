package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.api.SqlMemberKind
import de.maibornwolff.treesitter.excavationsite.api.SqlName
import de.maibornwolff.treesitter.excavationsite.api.SqlNameKind
import de.maibornwolff.treesitter.excavationsite.api.SqlObjectKind
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class SqlScriptTest {
    private fun objectsOf(code: String) = TreeSitterDependencies.sqlScript(code.trimIndent()).objects

    private fun namesOf(code: String) = objectsOf(code).single().names

    private fun name(written: String, kind: SqlNameKind) = SqlName(written.split("."), kind)

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
            assertThat(specification.members).extracting({ it.name }, { it.kind }).containsExactly(
                tuple("c_max", SqlMemberKind.CONSTANT),
                tuple("g_calls", SqlMemberKind.VARIABLE),
                tuple("t_rec", SqlMemberKind.TYPE),
                tuple("c_orders", SqlMemberKind.CURSOR),
                tuple("e_too_big", SqlMemberKind.EXCEPTION),
                tuple("total", SqlMemberKind.ROUTINE)
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

    @Nested
    inner class Names {
        @Test
        fun `should ask a relation, a routine, a type or a sequence by the position of a name`() {
            // Arrange
            val code = """
                CREATE FUNCTION report(r orders, m mood) RETURNS money_amount AS $$
                BEGIN
                    PERFORM warm_up();
                    INSERT INTO order_log SELECT id, nextval('order_seq') FROM recent_orders(7) JOIN dbo.customers c ON c.id = id;
                    RETURN ROW(1)::money_amount;
                END $$ LANGUAGE plpgsql;
            """

            // Act
            val names = namesOf(code)

            // Assert
            assertThat(names).containsExactly(
                name("orders", SqlNameKind.TYPE),
                name("mood", SqlNameKind.TYPE),
                name("money_amount", SqlNameKind.TYPE),
                name("warm_up", SqlNameKind.ROUTINE),
                name("order_log", SqlNameKind.RELATION),
                name("order_seq", SqlNameKind.SEQUENCE),
                name("nextval", SqlNameKind.ROUTINE),
                name("recent_orders", SqlNameKind.ROUTINE),
                name("dbo.customers", SqlNameKind.RELATION),
                name("c.id", SqlNameKind.MEMBER),
                name("row", SqlNameKind.ROUTINE)
            )
        }

        @Test
        fun `should read EXEC, NEXT VALUE FOR, NEXTVAL and a package member`() {
            // Arrange
            val code = """
                CREATE PROCEDURE dbo.add_order AS
                BEGIN
                    EXEC dbo.reset_dice;
                    SELECT NEXT VALUE FOR dbo.order_seq;
                    SELECT order_seq.NEXTVAL, pricing.c_max, warehouse.dbo.orders.id;
                END
            """

            // Act
            val names = namesOf(code)

            // Assert
            assertThat(names).containsExactly(
                name("dbo.reset_dice", SqlNameKind.ROUTINE),
                name("dbo.order_seq", SqlNameKind.SEQUENCE),
                name("order_seq", SqlNameKind.SEQUENCE),
                name("pricing.c_max", SqlNameKind.MEMBER),
                name("dbo.orders.id", SqlNameKind.MEMBER)
            )
        }

        @Test
        fun `should leave out the names locals hide`() {
            // Arrange
            val code = """
                CREATE FUNCTION report(scratch_id INT) RETURNS INT AS $$
                DECLARE
                    v_count INT;
                BEGIN
                    CREATE TEMP TABLE scratch AS SELECT id FROM orders;
                    WITH totals AS (SELECT id FROM scratch)
                    SELECT count(*) INTO v_count FROM totals;
                    RETURN v_count;
                END $$ LANGUAGE plpgsql;
            """

            // Act
            val names = namesOf(code)

            // Assert
            assertThat(names.map { it.parts.single() }).containsExactly("int", "orders", "count")
        }

        @Test
        fun `should leave out the rows a trigger sees`() {
            // Arrange
            val code = "CREATE TRIGGER logged ON dbo.orders AFTER UPDATE AS BEGIN INSERT INTO log SELECT id FROM inserted; END"

            // Act
            val names = namesOf(code)

            // Assert
            assertThat(names).containsExactly(name("dbo.orders", SqlNameKind.RELATION), name("log", SqlNameKind.RELATION))
        }

        @Test
        fun `should let a synonym stand for an object of any kind`() {
            // Arrange
            val code = "CREATE SYNONYM dice FOR roll;"

            // Act
            val names = namesOf(code)

            // Assert
            assertThat(names).containsExactly(name("roll", SqlNameKind.ANY))
        }

        @Test
        fun `should read a plain identifier inside a package as a possible member`() {
            // Arrange
            val code = """
                CREATE OR REPLACE PACKAGE BODY pricing AS
                    FUNCTION helper RETURN NUMBER IS
                        v NUMBER;
                    BEGIN
                        v := c_max;
                        RETURN v;
                    END helper;
                END pricing;
                /
            """

            // Act
            val helper = objectsOf(code).single().members.single()

            // Assert
            assertThat(helper.names).containsExactly(
                name("return", SqlNameKind.BARE),
                name("number", SqlNameKind.TYPE),
                name("c_max", SqlNameKind.BARE)
            )
        }

        @Test
        fun `should read the type of a package variable and the query of a cursor`() {
            // Arrange
            val code = """
                CREATE OR REPLACE PACKAGE pricing AS
                    g_mood mood;
                    CURSOR c_orders IS SELECT id FROM orders;
                END pricing;
                /
            """

            // Act
            val members = objectsOf(code).single().members

            // Assert
            assertThat(members[0].names).containsExactly(name("mood", SqlNameKind.TYPE))
            assertThat(members[1].names).containsExactly(name("id", SqlNameKind.BARE), name("orders", SqlNameKind.RELATION))
        }

        @Test
        fun `should read what an ALTER adds and the statements outside every object with their default schema`() {
            // Arrange
            val code = """
                ALTER TABLE orders ADD FOREIGN KEY (customer_id) REFERENCES customers (id);
                INSERT INTO orders SELECT * FROM staging;
                SET search_path TO sales;
                CALL refresh();
            """

            // Act
            val script = TreeSitterDependencies.sqlScript(code.trimIndent())

            // Assert
            assertThat(
                script.objects.single().names
            ).containsExactly(name("key", SqlNameKind.ROUTINE), name("customers", SqlNameKind.RELATION))
            assertThat(script.statements).extracting({ it.defaultSchema }, { it.names }).containsExactly(
                tuple(null, listOf(name("orders", SqlNameKind.RELATION), name("staging", SqlNameKind.RELATION))),
                tuple("sales", listOf(name("refresh", SqlNameKind.ROUTINE)))
            )
        }
    }
}
