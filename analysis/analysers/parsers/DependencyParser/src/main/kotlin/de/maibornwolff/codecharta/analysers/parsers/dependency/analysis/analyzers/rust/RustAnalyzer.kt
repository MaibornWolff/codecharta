package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.RustImpl
import de.maibornwolff.treesitter.excavationsite.api.RustItem
import de.maibornwolff.treesitter.excavationsite.api.RustItemKind
import de.maibornwolff.treesitter.excavationsite.api.RustNamespace
import de.maibornwolff.treesitter.excavationsite.api.RustPath
import de.maibornwolff.treesitter.excavationsite.api.RustUse
import de.maibornwolff.treesitter.excavationsite.api.RustVisibility

/**
 * The declarations of a Rust file at the module path the module tree gives them (`docs/name-resolution/rust.md`), each
 * use written as the exact path of what the lookup finds for it, which [RustNameRules] takes only as written. A `use`
 * with a visibility is a re-export declaration (decision 7); an `impl` in its type's file belongs to the type.
 */
class RustAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val file = RustProject.segmentsOf(fileInfo.physicalPath)
    private val project by lazy {
        fileInfo.analysisRoot?.let { RustProject.of(it, fileInfo.analysedFiles) } ?: RustProject.ofSingleFile(file, fileInfo.content)
    }
    private val lookup by lazy { RustLookup(project.tree, project.crates) }

    override fun analyze(): FileReport {
        if (file.isEmpty()) return FileReport(emptyList())
        val facts = project.factsOf(file)
        val implsByType = facts.impls.groupBy { ownTypeOf(it) }
        val items = facts.items.mapNotNull { item -> scopeOf(item.inlinePath)?.let { itemNode(item, it, implsByType) } }
        val reexports = facts.uses.filter { it.visibility != RustVisibility.PRIVATE }.flatMap { reexportNodes(it) }
        return FileReport(items + reexports)
    }

    private fun scopeOf(inlinePath: List<String>): RustModuleScope? = project.tree.scopeOf(file, inlinePath)

    private fun itemNode(item: RustItem, scope: RustModuleScope, implsByType: Map<List<String>?, List<RustImpl>>): Node {
        val path = scope.pathOf(item.name)
        val implUses = implsByType[path].orEmpty().flatMap { impl -> scopeOf(impl.inlinePath)?.let { usesOf(impl.paths, it) }.orEmpty() }
        val ownName = typeOf(path)
        return node(path, nodeTypeOf(item.kind), (usesOf(item.paths, scope) + implUses).filterNot { it == ownName })
    }

    // The path of the type an impl is for, if this file declares it
    private fun ownTypeOf(impl: RustImpl): List<String>? {
        val scope = scopeOf(impl.inlinePath) ?: return null
        val selfType = impl.selfType ?: return null
        return lookup
            .resolve(selfType, scope)
            .filterIsInstance<Meaning.Declared>()
            .firstOrNull { declared ->
                project.tree.scopeAt(declared.path.dropLast(1))?.file == file
            }?.path
    }

    private fun reexportNodes(use: RustUse): List<Node> {
        val scope = scopeOf(use.inlinePath) ?: return emptyList()
        if (use.isGlob) return globReexports(use, scope)
        val name = use.binding ?: return emptyList()
        val targets = REEXPORTED_NAMESPACES.flatMap { lookup.resolveUse(use, it, scope) }.mapNotNull { it.declarationPath }.distinct()
        if (targets.isEmpty()) return emptyList()
        return listOf(node(scope.pathOf(name), NodeType.REEXPORT, targets.map { typeOf(it) }))
    }

    // One re-export per item the module offers that the re-exporting module does not bind itself
    private fun globReexports(use: RustUse, scope: RustModuleScope): List<Node> {
        val source =
            lookup.resolveUse(use, RustNamespace.TYPE, scope).firstNotNullOfOrNull { (it as? Meaning.Module)?.scope } ?: return emptyList()
        val ownNames = scope.items.keys + scope.uses.mapNotNull { it.binding } + scope.modules.keys
        return source.items
            .filter { (name, items) -> name !in ownNames && items.any { source.isVisibleTo(scope, it.visibility) } }
            .map { (name, _) -> node(scope.pathOf(name), NodeType.REEXPORT, listOf(typeOf(source.pathOf(name)))) }
    }

    private fun usesOf(paths: List<RustPath>, scope: RustModuleScope): List<Type> =
        paths.flatMap { path -> lookup.resolve(path, scope).mapNotNull { it.declarationPath } }.distinct().map { typeOf(it) }

    private fun typeOf(path: List<String>): Type = Type.simple(Path(path).withDots())

    private fun node(path: List<String>, nodeType: NodeType, uses: List<Type>) = Node(
        pathWithName = Path(path),
        physicalPath = fileInfo.physicalPath,
        nodeType = nodeType,
        language = SupportedLanguage.RUST,
        dependencies = emptySet(),
        usedTypes = uses.toSet()
    )

    private fun nodeTypeOf(kind: RustItemKind): NodeType = when (kind) {
        RustItemKind.STRUCT, RustItemKind.TUPLE_STRUCT, RustItemKind.UNION, RustItemKind.TYPE_ALIAS -> NodeType.CLASS
        RustItemKind.ENUM -> NodeType.ENUM
        RustItemKind.TRAIT -> NodeType.INTERFACE
        RustItemKind.FUNCTION, RustItemKind.MACRO -> NodeType.FUNCTION
        RustItemKind.CONST, RustItemKind.STATIC -> NodeType.VARIABLE
    }

    companion object {
        private val REEXPORTED_NAMESPACES = listOf(RustNamespace.TYPE, RustNamespace.VALUE, RustNamespace.MACRO)
    }
}
