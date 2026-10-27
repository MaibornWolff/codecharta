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
import de.maibornwolff.treesitter.excavationsite.api.SqlNameKind
import de.maibornwolff.treesitter.excavationsite.api.SqlObject
import de.maibornwolff.treesitter.excavationsite.api.SqlObjectKind

/**
 * The objects a SQL file creates, at their schema plus their name (`docs/name-resolution/sql.md`), each name they write
 * looked up in all SQL files of the run as [SqlLookup] does and written as the exact path of what it finds, which
 * [SqlNameRules] takes only as written. What a package specification declares are leaves below the package; a package
 * body's routines that the specification declares, an object type body and a statement that changes an object another
 * file creates are implementation parts (decisions 1, 2, 5 and 8). What the statements outside every object name is the
 * file's script leaf.
 */
class SqlAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val project by lazy {
        fileInfo.analysisRoot?.let { SqlProject.of(it, fileInfo.analysedFiles) }
            ?: SqlProject.ofSingleFile(fileInfo.physicalPath, fileInfo.content)
    }
    private val nodes = LinkedHashMap<List<String>, NodeDraft>()
    private val scriptUses = LinkedHashSet<SqlLookup.Found>()

    private class NodeDraft(val nodeType: NodeType, val kind: String?, val isPart: Boolean, val isFileScoped: Boolean) {
        val uses = LinkedHashSet<SqlLookup.Found>()
    }

    override fun analyze(): FileReport {
        val script = project.scriptOf(fileInfo.physicalPath)
        val (changes, created) = script.objects.partition { it.kind == SqlObjectKind.CHANGE }
        created.forEach { addObject(it) }
        changes.forEach { addChange(it) }
        script.statements.forEach { statements ->
            scriptUses += resolved(statements.names, SqlLookup(project, statements.defaultSchema, null))
        }
        return FileReport(nodes.map { (path, draft) -> nodeOf(path, draft) } + listOfNotNull(scriptNode()))
    }

    private fun addObject(created: SqlObject) {
        when (created.kind) {
            SqlObjectKind.PACKAGE -> addPackage(created)
            SqlObjectKind.PACKAGE_BODY -> addPackageBody(created)
            SqlObjectKind.TYPE_BODY -> addTypeBody(created)
            in NODE_TYPES -> {
                val path = SqlProject.pathOf(created)
                draft(path, NODE_TYPES.getValue(created.kind), SqlLookup.kindOf(created.kind)).uses +=
                    resolved(created.names, SqlLookup(project, schemaOf(path), null))
            }
            else -> Unit
        }
    }

    private fun addPackage(specification: SqlObject) {
        val path = SqlProject.pathOf(specification)
        val lookup = SqlLookup(project, schemaOf(path), SqlLookup.PackageScope(path, project.packageMembersOf(path)))
        draft(path, NodeType.CLASS, PACKAGE_KIND)
        specification.members.forEach { member ->
            draft(path + member.name, MEMBER_NODE_TYPES.getValue(member.kind), null).uses += resolved(member.names, lookup)
        }
    }

    // Without a specification in the run, the body stands for the package (decision 13)
    private fun addPackageBody(body: SqlObject) {
        val path = SqlProject.pathOf(body)
        val hasSpecification = project.hasSpecification(path, SqlObjectKind.PACKAGE)
        val declared = project.packageMembersOf(path)
        val lookup = SqlLookup(project, schemaOf(path), SqlLookup.PackageScope(path, declared + body.members.map { it.name }))
        draftOfPart(path, NodeType.CLASS, PACKAGE_KIND, isPart = hasSpecification).uses += resolved(body.names, lookup)
        body.members.forEach { member ->
            val memberPath = path + member.name
            val nodeType = MEMBER_NODE_TYPES.getValue(member.kind)
            val memberDraft = when {
                !hasSpecification -> draft(memberPath, nodeType, null)
                member.name in declared -> draftOfPart(memberPath, nodeType, null, isPart = true)
                else -> privateDraft(memberPath, nodeType)
            }
            memberDraft.uses += resolved(member.names, lookup)
        }
    }

    // The methods and attributes of an object type belong to the type (decision 8)
    private fun addTypeBody(body: SqlObject) {
        val path = SqlProject.pathOf(body)
        val names = body.names + body.members.flatMap { it.names }
        draftOfPart(path, NodeType.CLASS, TYPE_KIND, isPart = project.hasSpecification(path, SqlObjectKind.TYPE)).uses +=
            resolved(names, SqlLookup(project, schemaOf(path), null))
    }

    // A change of an object the file itself creates is part of its leaf; one of an object no file creates, of the script
    private fun addChange(change: SqlObject) {
        val lookup = SqlLookup(project, change.defaultSchema, null)
        val target = lookup.resolve(SqlName(change.name, CHANGED_KINDS[change.changedKind] ?: SqlNameKind.RELATION))
        if (target == null) {
            scriptUses += resolved(change.names, lookup)
            return
        }
        val draft = nodes[target.path] ?: draftOfPart(target.path, NodeType.CLASS, null, isPart = true)
        draft.uses += resolved(change.names, SqlLookup(project, schemaOf(target.path), null))
    }

    private fun draft(path: List<String>, nodeType: NodeType, kind: String?): NodeDraft =
        nodes.getOrPut(path) { NodeDraft(nodeType, kind, isPart = false, isFileScoped = false) }

    // A part depends on the declaration of its own path in another file
    private fun draftOfPart(path: List<String>, nodeType: NodeType, kind: String?, isPart: Boolean): NodeDraft {
        val draft = nodes.getOrPut(path) { NodeDraft(nodeType, kind, isPart = isPart, isFileScoped = isPart) }
        if (draft.isPart) draft.uses += SqlLookup.Found(path, emptySet())
        return draft
    }

    // What only a package body declares, only the package itself can name
    private fun privateDraft(path: List<String>, nodeType: NodeType): NodeDraft =
        nodes.getOrPut(path) { NodeDraft(nodeType, null, isPart = false, isFileScoped = true) }

    private fun resolved(names: List<SqlName>, lookup: SqlLookup): List<SqlLookup.Found> = names.mapNotNull { lookup.resolve(it) }

    private fun schemaOf(path: List<String>): String? = path.takeIf { it.size > 1 }?.first()

    private fun nodeOf(path: List<String>, draft: NodeDraft): Node = Node(
        pathWithName = Path(path),
        physicalPath = fileInfo.physicalPath,
        nodeType = draft.nodeType,
        language = SupportedLanguage.SQL,
        dependencies = emptySet(),
        usedTypes = typesOf(draft.uses.filter { draft.isPart || it.path != path }),
        isFileScoped = draft.isFileScoped,
        isImplementationPart = draft.isPart,
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
        private val TYPE_KIND = SqlLookup.kindOf(SqlObjectKind.TYPE)
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
        private val CHANGED_KINDS = mapOf(SqlObjectKind.SEQUENCE to SqlNameKind.SEQUENCE, SqlObjectKind.TYPE to SqlNameKind.TYPE)
        private val MEMBER_NODE_TYPES = mapOf(
            SqlMemberKind.ROUTINE to NodeType.FUNCTION,
            SqlMemberKind.CONSTANT to NodeType.VARIABLE,
            SqlMemberKind.VARIABLE to NodeType.VARIABLE,
            SqlMemberKind.TYPE to NodeType.CLASS,
            SqlMemberKind.CURSOR to NodeType.CLASS,
            SqlMemberKind.EXCEPTION to NodeType.CLASS,
            SqlMemberKind.ATTRIBUTE to NodeType.VARIABLE
        )
    }
}
