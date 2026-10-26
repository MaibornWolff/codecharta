package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.ImportKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * What a module binds that the use extraction needs: the local name of each import, the local
 * names of its namespace imports and of its default imports and `require` bindings, the names of its own top-level
 * declarations, and what its dynamic imports bind.
 */
internal data class ModuleNames(
    val importNames: Set<String>,
    val namespaceNames: Set<String>,
    val defaultImportNames: Set<String>,
    val localDeclarationNames: Set<String>,
    val dynamicImports: DynamicImportBindings
) {
    /** Whether a binding of the module binds [name]: an import, a namespace or dynamic import, a top-level declaration. */
    fun binds(name: String): Boolean = name in importNames || name in namespaceNames || name in localDeclarationNames

    /** The names a declaration sees, without its own, which names the declaration itself rather than a use. */
    fun without(ownName: String): ModuleNames = copy(localDeclarationNames = localDeclarationNames - ownName)
}

internal object DeclarationPrepass {
    internal fun moduleNamesOf(rootNode: SyntaxNode, imports: List<ImportDeclaration>): ModuleNames = ModuleNames(
        importNames = imports.mapNotNullTo(HashSet()) { it.bindingName },
        namespaceNames = imports.filter { it.isWildcard && it.kind == ImportKind.STANDARD }.mapNotNullTo(HashSet()) { it.bindingName },
        defaultImportNames = imports.filter { it.path.lastOrNull() == DEFAULT_EXPORT }.mapNotNullTo(HashSet()) { it.bindingName },
        localDeclarationNames = extractLocalDeclarationNames(rootNode),
        dynamicImports = DynamicImportBindings.of(rootNode)
    )

    internal fun extractLocalDeclarationNames(rootNode: SyntaxNode): Set<String> = rootNode
        .children()
        .flatMap { child ->
            when (child.type) {
                EXPORT_STATEMENT -> extractNamesFromExportStatement(child)
                else -> declarationsOf(child).flatMap { extractNamesFromNode(it) }
            }
        }.filter { it.isNotBlank() }
        .toSet()

    private fun extractNamesFromExportStatement(node: SyntaxNode): List<String> {
        if (hasSource(node)) return emptyList()
        val hasExportClause = hasExportClause(node)
        if (hasExportClause) {
            val clause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
            return clause
                .children()
                .filter { it.type == EXPORT_SPECIFIER }
                .mapNotNull { specifier ->
                    specifier
                        .children()
                        .filter { it.type == IDENTIFIER }
                        .firstOrNull()
                        ?.text
                        ?.trim()
                }.toList()
        }
        return node
            .children()
            .flatMap { declarationsOf(it) }
            .flatMap { extractNamesFromNode(it) }
            .toList()
    }

    private fun extractNamesFromNode(node: SyntaxNode): List<String> {
        if (node.type == LEXICAL_DECLARATION || node.type == VARIABLE_DECLARATION) {
            return node
                .children()
                .filter { it.type == VARIABLE_DECLARATOR }
                .flatMap { BindingPatterns.declaredNames(it) }
                .filter { it.isNotBlank() }
                .toList()
        }
        val name = extractDeclarationName(node)
        return if (name.isNotBlank()) listOf(name) else emptyList()
    }
}
