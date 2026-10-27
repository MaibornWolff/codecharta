package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql

import de.maibornwolff.treesitter.excavationsite.api.SqlMember
import de.maibornwolff.treesitter.excavationsite.api.SqlMemberKind
import de.maibornwolff.treesitter.excavationsite.api.SqlObject
import de.maibornwolff.treesitter.excavationsite.api.SqlObjectKind
import de.maibornwolff.treesitter.excavationsite.api.SqlScript
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The SQL files of a run as one database (`sql.md`), read once: the objects they create by name, and what each package
 * declares. Which file a path means is the copy rule's choice.
 */
internal class SqlProject private constructor(private val files: Set<String>, private val sourceOf: (String) -> String) {
    private val scripts = ConcurrentHashMap<String, SqlScript>()
    private val objectsByName by lazy { objectsByName() }
    private val packageMembers by lazy { packageMembers() }
    private val specifications by lazy { createdObjects().map { Declared(pathOf(it), it.kind) }.toSet() }

    /** A created object at its [path], `[schema, name]` or `[name]`, of a kind that names can mean. */
    data class Declared(val path: List<String>, val kind: SqlObjectKind)

    /** What a file creates, changes and names, read once. */
    fun scriptOf(file: String): SqlScript = scripts.computeIfAbsent(file) { TreeSitterDependencies.sqlScript(sourceOf(it)) }

    /** The objects of [name] in any schema; a package body counts as its package, an object type body as its type. */
    fun objectsNamed(name: String): List<Declared> = objectsByName[name].orEmpty()

    /**
     * What the package at [packagePath] declares that other code can name: the members of its specification, or the
     * routines of its bodies if no file of the run holds the specification (decision 13).
     */
    fun packageMembersOf(packagePath: List<String>): Set<String> = packageMembers[packagePath].orEmpty()

    /** Whether a package specification ([SqlObjectKind.PACKAGE]) or an object type ([SqlObjectKind.TYPE]) declares [path]. */
    fun hasSpecification(path: List<String>, kind: SqlObjectKind): Boolean = Declared(path, kind) in specifications

    private fun createdObjects(): List<SqlObject> = files.flatMap { file -> scriptOf(file).objects }

    private fun objectsByName(): Map<String, List<Declared>> = createdObjects()
        .mapNotNull { declaredOf(it) }
        .distinct()
        .groupBy { it.path.last() }

    private fun declaredOf(created: SqlObject): Declared? {
        val kind = DECLARED_AS[created.kind] ?: return null
        return Declared(pathOf(created), kind)
    }

    private fun packageMembers(): Map<List<String>, Set<String>> {
        val packages = createdObjects().filter { it.kind == SqlObjectKind.PACKAGE || it.kind == SqlObjectKind.PACKAGE_BODY }
        val (specifications, bodies) = packages.partition { it.kind == SqlObjectKind.PACKAGE }
        val bodyRoutines = membersByPath(bodies) { member -> member.kind == SqlMemberKind.ROUTINE }
        return bodyRoutines + membersByPath(specifications) { true }
    }

    private fun membersByPath(containers: List<SqlObject>, isMember: (SqlMember) -> Boolean): Map<List<String>, Set<String>> = containers
        .groupBy({ pathOf(it) }, { container -> container.members.filter(isMember).map { it.name } })
        .mapValues { (_, members) -> members.flatten().toSet() }

    companion object {
        private val projectsByRun = ConcurrentHashMap<Pair<String, Set<String>>, SqlProject>()
        private val SQL_SUFFIXES = listOf(".sql", ".pks", ".pkb", ".pls")
        private const val HIDDEN_PREFIX = "."
        private val DECLARED_AS = mapOf(
            SqlObjectKind.TABLE to SqlObjectKind.TABLE,
            SqlObjectKind.VIEW to SqlObjectKind.VIEW,
            SqlObjectKind.SYNONYM to SqlObjectKind.SYNONYM,
            SqlObjectKind.SEQUENCE to SqlObjectKind.SEQUENCE,
            SqlObjectKind.TYPE to SqlObjectKind.TYPE,
            SqlObjectKind.TYPE_BODY to SqlObjectKind.TYPE,
            SqlObjectKind.DOMAIN to SqlObjectKind.DOMAIN,
            SqlObjectKind.ROUTINE to SqlObjectKind.ROUTINE,
            SqlObjectKind.PACKAGE to SqlObjectKind.PACKAGE,
            SqlObjectKind.PACKAGE_BODY to SqlObjectKind.PACKAGE
        )

        /** The path a created object lies at: its schema as written, else the default schema, and its name. */
        fun pathOf(created: SqlObject): List<String> {
            if (created.name.size > 1) return created.name
            return listOfNotNull(created.defaultSchema) + created.name
        }

        /** The project of a run over [analysisRoot]; [analysedFiles] empty means every SQL file below the root. */
        fun of(analysisRoot: File, analysedFiles: Set<String>): SqlProject = projectsByRun.computeIfAbsent(
            analysisRoot.absolutePath to analysedFiles
        ) {
            val files = analysedFiles.ifEmpty { filesBelow(analysisRoot) }.filterTo(HashSet()) { isSql(it) }
            SqlProject(files) { file -> analysisRoot.resolve(file).readText() }
        }

        /** A file analysed without a root: a project of its own. */
        fun ofSingleFile(file: String, content: String): SqlProject = SqlProject(setOf(file)) { content }

        private fun isSql(file: String): Boolean = SQL_SUFFIXES.any { file.endsWith(it, ignoreCase = true) }

        private fun filesBelow(analysisRoot: File): Set<String> = analysisRoot
            .walkTopDown()
            .onEnter { folder -> folder == analysisRoot || !folder.name.startsWith(HIDDEN_PREFIX) }
            .filter { it.isFile }
            .mapTo(HashSet()) { it.relativeTo(analysisRoot).path }
    }
}
