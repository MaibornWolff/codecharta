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
import de.maibornwolff.treesitter.excavationsite.api.RustModule
import de.maibornwolff.treesitter.excavationsite.api.RustNamespace
import de.maibornwolff.treesitter.excavationsite.api.RustPath
import de.maibornwolff.treesitter.excavationsite.api.RustUse
import de.maibornwolff.treesitter.excavationsite.api.RustVisibility

/**
 * The declarations of a Rust file at the module path the module tree gives them (`docs/name-resolution/rust.md`), each
 * use written as the exact path of what the lookup finds for it, which [RustNameRules] takes only as written. A `use`
 * with a visibility is a re-export declaration (decision 7); an `impl` in its type's file belongs to the type, one in
 * another file is the implementation part of the type (decisions 3 and 14).
 */
class RustAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val file = RustProject.segmentsOf(fileInfo.physicalPath)
    private val project by lazy {
        fileInfo.analysisRoot?.let { RustProject.of(it, fileInfo.analysedFiles) } ?: RustProject.ofSingleFile(file, fileInfo.content)
    }
    private val lookup by lazy { RustLookup(project.tree, project.crates) }

    override fun analyze(): FileReport {
        val fileScope = scopeOf(emptyList())
        if (fileScope == null || !project.tree.isCounted(fileScope, false)) return FileReport(emptyList())
        val facts = countedFacts(fileScope)
        val implsByOwner = facts.impls.mapNotNull { impl -> ownerOf(impl)?.let { it to impl } }.groupBy({ it.first }, { it.second })
        val ownImpls = implsByOwner.filterKeys { it.isInThisFile }.mapKeys { it.key.path }
        val items = facts.items.mapNotNull { item -> scopeOf(item.inlinePath)?.let { itemNode(item, it, ownImpls) } }
        val implParts = implsByOwner.filterKeys { !it.isInThisFile }.map { (owner, impls) -> implPart(owner, impls) }
        val reexports = facts.uses.filter { it.visibility != RustVisibility.PRIVATE }.flatMap { reexportNodes(it) }
        return FileReport(items + implParts + reexports)
    }

    private fun scopeOf(inlinePath: List<String>): RustModuleScope? = project.tree.scopeOf(file, inlinePath)

    // What `#[cfg(test)]` marks counts only in a run with tests (decision 6)
    private fun countedFacts(fileScope: RustModuleScope): RustModule {
        val all = project.factsOf(file)
        return all.copy(
            items = all.items.filter { project.tree.isCounted(fileScope, it.isTest) },
            impls = all.impls.filter { project.tree.isCounted(fileScope, it.isTest) },
            uses = all.uses.filter { project.tree.isCounted(fileScope, it.isTest) }
        )
    }

    private fun itemNode(item: RustItem, scope: RustModuleScope, ownImpls: Map<List<String>, List<RustImpl>>): Node {
        val path = scope.pathOf(item.name)
        val ownName = typeOf(path)
        val uses = usesOf(item.paths, scope) + ownImpls[path].orEmpty().flatMap { implUses(it) }
        return node(path, nodeTypeOf(item.kind), uses.filterNot { it == ownName })
    }

    // Decision 3: a leaf at its owner's path in this file, which uses the owner and what the impls write
    private fun implPart(owner: ImplOwner, impls: List<RustImpl>): Node {
        val ownName = typeOf(owner.path)
        val uses = listOf(ownName) + impls.flatMap { implUses(it) }.filterNot { it == ownName }
        return node(owner.path, owner.nodeType, uses).copy(isFileScoped = true, isImplementationPart = true)
    }

    private fun implUses(impl: RustImpl): List<Type> = scopeOf(impl.inlinePath)?.let { usesOf(impl.paths, it) }.orEmpty()

    private data class ImplOwner(val path: List<String>, val isInThisFile: Boolean, val nodeType: NodeType)

    // The project type the impl is for, else the project trait it implements for a library type, else the first
    // project type its header names (decision 14)
    private fun ownerOf(impl: RustImpl): ImplOwner? {
        val scope = scopeOf(impl.inlinePath) ?: return null
        val candidates = listOfNotNull(impl.selfType, impl.trait) + impl.paths.filter { it.namespace == RustNamespace.TYPE }
        return candidates.firstNotNullOfOrNull { path -> lookup.resolve(path, scope).firstNotNullOfOrNull { ownerOf(it) } }
    }

    private fun ownerOf(meaning: Meaning): ImplOwner? = when (meaning) {
        is Meaning.Declared -> meaning.item?.let { item ->
            val declaringFile = project.tree.scopeAt(meaning.path.dropLast(1))?.file
            ImplOwner(meaning.path, declaringFile == file, nodeTypeOf(item.kind))
        }
        is Meaning.Reexport -> ownerOf(meaning.target)
        is Meaning.Module -> null
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
            .keys
            .map { name -> node(scope.pathOf(name), NodeType.REEXPORT, listOf(typeOf(source.pathOf(name)))) }
    }

    private fun usesOf(paths: List<RustPath>, scope: RustModuleScope): List<Type> = paths
        .flatMap { path -> lookup.resolve(path, scope).mapNotNull { seenFrom(it, scope).declarationPath } }
        .distinct()
        .map { typeOf(it) }

    // Decision 16: inside the module that re-exports a declaration, or below it, the re-export means what it names
    private fun seenFrom(meaning: Meaning, scope: RustModuleScope): Meaning {
        if (meaning !is Meaning.Reexport || meaning.target is Meaning.Module) return meaning
        val reexportingModule = meaning.path.dropLast(1)
        val isInside = scope.path.size >= reexportingModule.size && scope.path.take(reexportingModule.size) == reexportingModule
        return if (isInside) seenFrom(meaning.target, scope) else meaning
    }

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
