package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.SqlMemberKind
import de.maibornwolff.treesitter.excavationsite.api.SqlName
import de.maibornwolff.treesitter.excavationsite.api.SqlObject
import de.maibornwolff.treesitter.excavationsite.api.SqlObjectKind

/**
 * The objects a SQL file creates, at their schema plus their name (`docs/name-resolution/sql.md`), each name they write
 * looked up in all SQL files of the run as [SqlLookup] does and written as the exact path of what it finds, which
 * [SqlNameRules] takes only as written. A package is one leaf with what its specification names, and each routine of
 * its body a leaf of its own; what the statements outside every object name is the file's script leaf.
 */
class SqlAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val project by lazy {
        fileInfo.analysisRoot?.let { SqlProject.of(it, fileInfo.analysedFiles) }
            ?: SqlProject.ofSingleFile(fileInfo.physicalPath, fileInfo.content)
    }
    private val nodes = LinkedHashMap<List<String>, NodeDraft>()
    private val scriptUses = LinkedHashSet<SqlLookup.Found>()

    private class NodeDraft(val nodeType: NodeType, val kind: String?) {
        val uses = LinkedHashSet<SqlLookup.Found>()
    }

    override fun analyze(): FileReport {
        val script = project.scriptOf(fileInfo.physicalPath)
        script.objects.forEach { addObject(it) }
        script.statements.forEach { statements ->
            scriptUses += resolved(statements.names, SqlLookup(project, statements.defaultSchema, null))
        }
        return FileReport(nodes.map { (path, draft) -> nodeOf(path, draft) } + listOfNotNull(scriptNode()))
    }

    private fun addObject(created: SqlObject) {
        when (created.kind) {
            SqlObjectKind.PACKAGE, SqlObjectKind.PACKAGE_BODY, SqlObjectKind.TYPE_BODY -> addPackage(created)
            SqlObjectKind.CHANGE -> scriptUses += resolved(created.names, SqlLookup(project, created.defaultSchema, null))
            in NODE_TYPES -> {
                val path = SqlProject.pathOf(created)
                draft(path, NODE_TYPES.getValue(created.kind), SqlLookup.kindOf(created.kind)).uses +=
                    resolved(created.names, SqlLookup(project, schemaOf(path), null))
            }
            else -> Unit
        }
    }

    // A routine of a package body is a leaf of its own; whatever else a package declares belongs to the package
    private fun addPackage(container: SqlObject) {
        val path = SqlProject.pathOf(container)
        val members = project.packageMembersOf(path) + container.members.filter { it.kind == SqlMemberKind.ROUTINE }.map { it.name }
        val lookup = SqlLookup(project, schemaOf(path), SqlLookup.PackageScope(path, members))
        val packageDraft = draft(path, NodeType.CLASS, PACKAGE_KIND)
        packageDraft.uses += resolved(container.names, lookup)
        container.members.forEach { member ->
            val owner = if (member.kind == SqlMemberKind.ROUTINE && container.kind != SqlObjectKind.PACKAGE) {
                draft(path + member.name, NodeType.FUNCTION, null)
            } else {
                packageDraft
            }
            owner.uses += resolved(member.names, lookup)
        }
    }

    private fun draft(path: List<String>, nodeType: NodeType, kind: String?): NodeDraft = nodes.getOrPut(path) { NodeDraft(nodeType, kind) }

    private fun resolved(names: List<SqlName>, lookup: SqlLookup): List<SqlLookup.Found> = names.mapNotNull { lookup.resolve(it) }

    private fun schemaOf(path: List<String>): String? = path.takeIf { it.size > 1 }?.first()

    private fun nodeOf(path: List<String>, draft: NodeDraft): Node = Node(
        pathWithName = Path(path),
        physicalPath = fileInfo.physicalPath,
        nodeType = draft.nodeType,
        language = SupportedLanguage.SQL,
        dependencies = emptySet(),
        usedTypes = typesOf(draft.uses.filter { it.path != path }),
        kind = draft.kind
    )

    // What a file runs outside any definition belongs to that file alone, so it stays under the file's path
    private fun scriptNode(): Node? {
        if (scriptUses.isEmpty()) return null
        val segments = fileInfo.physicalPath.substringBeforeLast(FILE_ENDING_SEPARATOR).split(PATH_SEPARATOR, WINDOWS_PATH_SEPARATOR)
        return Node(
            pathWithName = Path(segments + (segments.last() + SCRIPT_SUFFIX)),
            physicalPath = fileInfo.physicalPath,
            nodeType = NodeType.SCRIPT,
            language = SupportedLanguage.SQL,
            dependencies = emptySet(),
            usedTypes = typesOf(scriptUses)
        )
    }

    private fun typesOf(uses: Collection<SqlLookup.Found>): Set<Type> =
        uses.mapTo(LinkedHashSet()) { Type.simple(Path(it.path).withDots()).copy(kinds = it.kinds) }

    companion object {
        private const val SCRIPT_SUFFIX = ".script"
        private const val FILE_ENDING_SEPARATOR = "."
        private const val PATH_SEPARATOR = "/"
        private const val WINDOWS_PATH_SEPARATOR = "\\"
        private val PACKAGE_KIND = SqlLookup.kindOf(SqlObjectKind.PACKAGE)
        private val NODE_TYPES = mapOf(
            SqlObjectKind.TABLE to NodeType.CLASS,
            SqlObjectKind.VIEW to NodeType.CLASS,
            SqlObjectKind.SYNONYM to NodeType.CLASS,
            SqlObjectKind.SEQUENCE to NodeType.VARIABLE,
            SqlObjectKind.TYPE to NodeType.CLASS,
            SqlObjectKind.DOMAIN to NodeType.CLASS,
            SqlObjectKind.ROUTINE to NodeType.FUNCTION,
            SqlObjectKind.TRIGGER to NodeType.FUNCTION
        )
    }
}
