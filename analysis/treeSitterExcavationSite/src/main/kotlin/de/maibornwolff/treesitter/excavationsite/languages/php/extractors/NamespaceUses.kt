package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

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

    /** Every clause with a qualified name, those inside a group too, where they lack the prefix of the group. */
    fun qualifiedClausePaths(useDeclarations: List<SyntaxNode>): List<List<String>> = useDeclarations
        .flatMap { TreeTraversal.findAllDescendantsOfType(it, NAMESPACE_USE_CLAUSE) }
        .filter { clause -> clause.children().any { it.type == QUALIFIED_NAME } }
        .map { clause -> clause.text.split(NAMESPACE_SEPARATOR) }

    /** `use A\{B, C\D}` as `[A, B]` and `[A, C\D]`: what stands between two commas stays one segment. */
    fun groupedPaths(useDeclarations: List<SyntaxNode>): List<List<String>> = useDeclarations.flatMap { useDeclaration ->
        val children = useDeclaration.children().map { it.type to it }.toList()
        val prefix = children.firstOrNull { (type, _) -> type == NAMESPACE_NAME }?.second?.text?.split(NAMESPACE_SEPARATOR)
        val groups = children.filter { (type, _) -> type == NAMESPACE_USE_GROUP }.map { (_, group) -> group.text }
        if (prefix ==
            null
        ) {
            emptyList()
        } else {
            groups.flatMap { group -> group.trim('{', '}').split(GROUP_SEPARATOR).map { prefix + it.trim() } }
        }
    }

    /** The qualified name of every aliased clause outside a group, without its alias. */
    fun aliasedPaths(useDeclarations: List<SyntaxNode>): List<List<String>> =
        aliasedNames(useDeclarations).map { (qualifiedName, _) -> qualifiedName.split(NAMESPACE_SEPARATOR).map { it.trim() } }

    /** Alias to the name it stands for: `Qux` to `Baz` for `use Foo\Baz as Qux`. */
    fun namesByAlias(useDeclarations: List<SyntaxNode>): Map<String, String> =
        aliasedNames(useDeclarations).associate { (qualifiedName, alias) ->
            alias.trim() to qualifiedName.split(NAMESPACE_SEPARATOR).last()
        }

    /**
     * The clauses that import a constant, without the keyword. A clause counts as one as soon as a segment contains
     * `const`, so `use App\Reconstruction\Order` does as well.
     */
    fun constantPaths(useDeclarations: List<SyntaxNode>): List<List<String>> = qualifiedClausePaths(useDeclarations)
        .filter { path -> path.any { it.trim().contains(CONSTANT_MARKER) } }
        .map { path ->
            if (path.first().contains(CONSTANT_MARKER)) listOf(path.first().replace(CONSTANT_KEYWORD, "")) + path.drop(1) else path
        }

    private fun aliasedNames(useDeclarations: List<SyntaxNode>): List<Pair<String, String>> = useDeclarations
        .flatMap { useDeclaration -> useDeclaration.children().filter { it.type == NAMESPACE_USE_CLAUSE } }
        .mapNotNull { clause ->
            val qualifiedName = clause.children().firstOrNull { it.type == QUALIFIED_NAME }
            val alias = clause.getChildByFieldName(ALIAS_FIELD).orNull()?.takeIf { it.type == NAME }
            if (qualifiedName == null || alias == null) null else qualifiedName.text to alias.text
        }
}
