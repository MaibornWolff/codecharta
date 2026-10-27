package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql.SqlAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class SqlAnalyzerTest {
    @TempDir
    lateinit var root: File

    private fun withFiles(vararg files: Pair<String, String>) {
        files.forEach { (path, content) -> root.resolve(path).also { it.parentFile.mkdirs() }.writeText(content.trimIndent()) }
    }

    private fun analyze(physicalPath: String): FileReport =
        SqlAnalyzer(FileInfo(SupportedLanguage.SQL, physicalPath, root.resolve(physicalPath).readText(), root)).analyze()

    private fun usesOf(physicalPath: String, name: String): List<String> =
        analyze(physicalPath).nodes.single { it.pathWithName.parts.last() == name }.usedTypes.map { it.name }

    @Test
    fun `should declare every created object under its schema and name`() {
        // Arrange
        withFiles(
            "schema/heroes.sql" to """
                CREATE TABLE dbo.Heroes (id INT);
                CREATE PROCEDURE dbo.level_up AS BEGIN UPDATE dbo.Heroes SET level = level + 1; END
            """
        )

        // Act
        val report = analyze("schema/heroes.sql")

        // Assert
        assertThat(report.nodes).extracting({ it.pathWithName.withDots() }, { it.nodeType }, { it.kind }).containsExactly(
            tuple("dbo.heroes", NodeType.CLASS, "table"),
            tuple("dbo.level_up", NodeType.FUNCTION, "routine")
        )
        assertThat(report.nodes.last().usedTypes.map { it.name }).containsExactly("dbo.heroes")
    }

    @Test
    fun `should give the objects after SET search_path that schema`() {
        // Arrange
        withFiles("schema/orders.sql" to "SET search_path TO sales, public;\nCREATE TABLE orders (id INT);")

        // Act
        val report = analyze("schema/orders.sql")

        // Assert
        assertThat(report.nodes.map { it.pathWithName.withDots() }).containsExactly("sales.orders")
    }

    @Test
    fun `should resolve an unqualified name in the own schema, then the default schema, then the one other schema`() {
        // Arrange
        withFiles(
            "sales/orders.sql" to "CREATE TABLE sales.orders (id INT);",
            "plain/orders.sql" to "CREATE TABLE orders (id INT);",
            "hr/staff.sql" to "CREATE TABLE hr.staff (id INT);",
            "app/report.sql" to """
                CREATE VIEW sales.report AS SELECT id FROM orders;
                CREATE VIEW report AS SELECT id FROM orders JOIN staff ON 1 = 1;
            """
        )

        // Act
        val report = analyze("app/report.sql")

        // Assert
        assertThat(report.nodes.map { it.usedTypes.map { type -> type.name } }).containsExactly(
            listOf("sales.orders"),
            listOf("orders", "hr.staff")
        )
    }

    @Test
    fun `should draw no edge for a name several other schemas declare`() {
        // Arrange
        withFiles(
            "sales/orders.sql" to "CREATE TABLE sales.orders (id INT);",
            "hr/orders.sql" to "CREATE TABLE hr.orders (id INT);",
            "app/report.sql" to "CREATE VIEW report AS SELECT id FROM orders;"
        )

        // Act
        val uses = usesOf("app/report.sql", "report")

        // Assert
        assertThat(uses).isEmpty()
    }

    @Test
    fun `should resolve a name with a schema to an object created without one, never to another schema`() {
        // Arrange
        withFiles(
            "schema/orders.sql" to "CREATE TABLE orders (id INT);\nCREATE TABLE sales.customers (id INT);",
            "reports/report.sql" to "CREATE VIEW report AS SELECT id FROM app.orders JOIN hr.customers ON 1 = 1;"
        )

        // Act
        val uses = usesOf("reports/report.sql", "report")

        // Assert
        assertThat(uses).containsExactly("orders")
    }

    @Test
    fun `should ask the kind of object the position of a name asks for`() {
        // Arrange
        withFiles(
            "db/audit.sql" to """
                CREATE TABLE audit (id INT);
                CREATE FUNCTION recent_orders(days INT) RETURNS SETOF INT AS $$ SELECT days $$ LANGUAGE sql;
            """,
            "app/report.sql" to "CREATE VIEW report AS SELECT * FROM recent_orders(7) JOIN audit ON 1 = 1 WHERE audit() > 0;"
        )

        // Act
        val report = analyze("app/report.sql")

        // Assert
        assertThat(report.nodes.single().usedTypes).extracting({ it.name }, { it.kinds }).containsExactly(
            tuple("recent_orders", setOf("routine", "synonym")),
            tuple("audit", setOf("table", "view", "synonym"))
        )
    }

    @Test
    fun `should resolve a call of a package routine and a call inside the package`() {
        // Arrange
        withFiles(
            "packages/quest_pkg.pkb" to """
                CREATE OR REPLACE PACKAGE BODY quest_pkg AS
                  PROCEDURE start_quest(p_hero IN NUMBER) IS
                  BEGIN
                    log_quest(p_hero);
                  END start_quest;
                  PROCEDURE log_quest(p_hero IN NUMBER) IS BEGIN NULL; END log_quest;
                END quest_pkg;
            """,
            "jobs/daily.sql" to "CREATE PROCEDURE daily AS BEGIN quest_pkg.start_quest(1); END"
        )

        // Act
        val usesOfCaller = usesOf("jobs/daily.sql", "daily")
        val usesOfRoutine = usesOf("packages/quest_pkg.pkb", "start_quest")

        // Assert
        assertThat(usesOfCaller).containsExactly("quest_pkg.start_quest")
        assertThat(usesOfRoutine).containsExactly("quest_pkg.log_quest")
    }

    @Test
    fun `should name the statements outside any definition after their file`() {
        // Arrange
        withFiles(
            "schema/heroes.sql" to "CREATE TABLE heroes (id INT);",
            "migrations/V2__seed.sql" to "INSERT INTO heroes SELECT * FROM staging_heroes;"
        )

        // Act
        val report = analyze("migrations/V2__seed.sql")

        // Assert
        assertThat(report.nodes).extracting({ it.pathWithName }, { it.nodeType }).containsExactly(
            tuple(Path("migrations", "V2__seed", "V2__seed.script"), NodeType.SCRIPT)
        )
        assertThat(report.nodes.single().usedTypes.map { it.name }).containsExactly("heroes")
    }

    @Test
    fun `should analyse a file without an analysis root as a database of its own`() {
        // Arrange
        val code = "CREATE TABLE orders (id INT);\nCREATE VIEW report AS SELECT id FROM orders;"

        // Act
        val report = SqlAnalyzer(FileInfo(SupportedLanguage.SQL, "db/orders.sql", code)).analyze()

        // Assert
        assertThat(report.nodes.last().usedTypes.map { it.name }).containsExactly("orders")
    }
}
