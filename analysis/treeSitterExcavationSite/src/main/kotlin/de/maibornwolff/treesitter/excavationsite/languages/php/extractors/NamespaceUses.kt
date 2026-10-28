package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.fieldOfType

/**
 * What the `use` declarations of a PHP file import. All paths are the source text split at the namespace
 * separator, so the last segment of `use A\B as C` is `B as C` and the first of `use const A\B` is `const A`.
 */
internal object NamespaceUses {
    const val NAMESPACE_USE_DECLARATION = "namespace_use_declaration"
    const val NAMESPACE_SEPARATOR = "\\"
    private const val NAMESPACE_USE_CLAUSE = "namespace_use_clause"
    private const val NAMESPACE_USE_GROUP = "namespace_use_group"
    private const val NAMESPACE_NAME = "namespace_name"
    private const val QUALIFIED_NAME = "qualified_name"
    private const val NAME = "name"
    private const val ALIAS_FIELD = "alias"
    private const val CONSTANT_MARKER = "const"
    private const val CONSTANT_KEYWORD = "const "
    private const val GROUP_SEPARATOR = ","
    private const val GROUP_START = '{'
    private const val GROUP_END = '}'

    /**
     * One clause can be several paths: an aliased one is imported as written and again without its alias, a
     * qualified member of a group with the prefix of the group and again without it.
     */
    fun importedPaths(useDeclarations: List<SyntaxNode>): List<List<String>> =
        qualifiedClausePaths(useDeclarations) + groupedPaths(useDeclarations) + aliasedPaths(useDeclarations)

    /**
     * The clauses that import a constant, without the keyword. A clause counts as one as soon as a segment contains
     * `const`, so `use App\Reconstruction\Order` does as well.
     */
    fun constantPaths(useDeclarations: List<SyntaxNode>): List<List<String>> = qualifiedClausePaths(useDeclarations)
        .filter { path -> path.any { it.trim().contains(CONSTANT_MARKER) } }
        .map { path -> withoutConstantKeyword(path) }

    private fun qualifiedClausePaths(useDeclarations: List<SyntaxNode>): List<List<String>> = useDeclarations
        .flatMap { TreeTraversal.findAllDescendantsOfType(it, NAMESPACE_USE_CLAUSE) }
        .filter { clause -> clause.children().any { it.type == QUALIFIED_NAME } }
        .map { clause -> clause.text.split(NAMESPACE_SEPARATOR) }

    // What stands between two commas stays one segment: `use A\{B, C\D}` is `[A, B]` and `[A, C\D]`
    private fun groupedPaths(useDeclarations: List<SyntaxNode>): List<List<String>> = useDeclarations.flatMap { useDeclaration ->
        val prefix = TreeTraversal.findFirstChildTextByType(useDeclaration, NAMESPACE_NAME)?.split(NAMESPACE_SEPARATOR)
            ?: return@flatMap emptyList()
        TreeTraversal
            .findAllChildrenTextByType(useDeclaration, NAMESPACE_USE_GROUP)
            .flatMap { group -> group.trim(GROUP_START, GROUP_END).split(GROUP_SEPARATOR) }
            .map { member -> prefix + member.trim() }
    }

    // Only clauses outside a group
    private fun aliasedPaths(useDeclarations: List<SyntaxNode>): List<List<String>> = useDeclarations
        .flatMap { useDeclaration -> useDeclaration.children().filter { it.type == NAMESPACE_USE_CLAUSE } }
        .filter { clause -> clause.fieldOfType(ALIAS_FIELD, NAME) != null }
        .mapNotNull { clause -> clause.children().firstOrNull { it.type == QUALIFIED_NAME } }
        .map { qualifiedName -> qualifiedName.text.split(NAMESPACE_SEPARATOR).map { it.trim() } }

    private fun withoutConstantKeyword(path: List<String>): List<String> {
        if (!path.first().contains(CONSTANT_MARKER)) return path
        return listOf(path.first().replace(CONSTANT_KEYWORD, "")) + path.drop(1)
    }
}
