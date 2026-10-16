package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql.SqlAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.DependencyResolverService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class SqlAnalyzerTest {
    private fun analyze(physicalPath: String, code: String): FileReport =
        SqlAnalyzer(FileInfo(SupportedLanguage.SQL, physicalPath, code)).analyze()

    private fun resolvedDependenciesOf(name: String, vararg reports: FileReport): List<String> = DependencyResolverService
        .resolveNodes(reports.toList())
        .single { it.name() == name }
        .resolvedNodeDependencies.internalDependencies
        .map { it.path.withDots() }

    @Test
    fun `should declare every created object under its schema and name`() {
        // Arrange
        val code = """
            CREATE TABLE dbo.Heroes (id INT);
            CREATE PROCEDURE dbo.level_up AS BEGIN UPDATE dbo.Heroes SET level = level + 1; END
        """.trimIndent()

        // Act
        val report = analyze("schema/heroes.sql", code)

        // Assert
        assertThat(report.nodes.map { it.pathWithName.withDots() }).containsExactly("dbo.heroes", "dbo.level_up")
        assertThat(report.nodes.map { it.nodeType }).containsExactly(NodeType.CLASS, NodeType.FUNCTION)
    }

    @Test
    fun `should resolve the use of an object to the file that creates it`() {
        // Arrange
        val schema = analyze("schema/heroes.sql", "CREATE TABLE dbo.Heroes (id INT);")
        val report = analyze("reports/strong_heroes.sql", "CREATE VIEW strong_heroes AS SELECT * FROM [dbo].[HEROES] WHERE level > 9;")

        // Act
        val dependencies = resolvedDependenciesOf("strong_heroes", schema, report)

        // Assert
        assertThat(dependencies).containsExactly("dbo.heroes")
    }

    @Test
    fun `should tell apart two objects of one name in two schemas`() {
        // Arrange
        val domainTable = analyze("schema/creature.sql", "CREATE TABLE creature (id INT);")
        val dtoTable = analyze("dto/creature.sql", "CREATE TABLE dto.creature (id INT);")
        val facade =
            analyze("application/facade.sql", "CREATE PROCEDURE facade AS BEGIN INSERT INTO dto.creature SELECT * FROM creature; END")

        // Act
        val dependencies = resolvedDependenciesOf("facade", domainTable, dtoTable, facade)

        // Assert
        assertThat(dependencies).containsExactlyInAnyOrder("dto.creature", "creature")
    }

    @Test
    fun `should resolve a call of a package routine and a use from inside a package`() {
        // Arrange
        val schema = analyze("schema/heroes.sql", "CREATE TABLE heroes (id INT);")
        val packageBody = analyze(
            "packages/quest_pkg.pkb",
            """
            CREATE OR REPLACE PACKAGE BODY quest_pkg AS
              PROCEDURE start_quest(p_hero IN NUMBER) IS
              BEGIN
                UPDATE app.heroes SET on_quest = 1 WHERE id = p_hero;
              END start_quest;
            END quest_pkg;
            """.trimIndent()
        )
        val caller = analyze("jobs/daily.sql", "CREATE PROCEDURE daily AS BEGIN quest_pkg.start_quest(1); END")

        // Act
        val dependenciesOfCaller = resolvedDependenciesOf("daily", schema, packageBody, caller)
        val dependenciesOfRoutine = resolvedDependenciesOf("start_quest", schema, packageBody, caller)

        // Assert
        assertThat(dependenciesOfCaller).containsExactly("quest_pkg.start_quest")
        assertThat(dependenciesOfRoutine).containsExactly("heroes")
    }

    @Test
    fun `should name the statements outside any definition after their file`() {
        // Arrange
        val code = "INSERT INTO heroes SELECT * FROM staging_heroes;"

        // Act
        val report = analyze("migrations/V2__seed.sql", code)

        // Assert
        assertThat(report.nodes.map { it.pathWithName }).containsExactly(Path("migrations", "V2__seed", "V2__seed.script"))
        assertThat(report.nodes.map { it.nodeType }).containsExactly(NodeType.SCRIPT)
    }
}
