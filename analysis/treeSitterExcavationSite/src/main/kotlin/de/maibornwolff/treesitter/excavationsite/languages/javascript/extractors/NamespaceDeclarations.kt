package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * A TypeScript namespace, by "Declarations" of `docs/name-resolution/typescript.md`: what it exports is a declaration
 * of its own below the namespace (decision 7); what it does not export belongs to the namespace, which uses what that
 * names, and a use of such a member is a use of the namespace.
 */
internal object NamespaceDeclarations {
    private const val BODY_FIELD = "body"

    /** The namespace and the declarations it exports; [membersOf] extracts the members an export statement declares. */
    fun extract(
        namespace: SyntaxNode,
        parentPath: List<String>,
        names: ModuleNames,
        membersOf: (SyntaxNode, List<String>) -> List<Declaration>
    ): List<Declaration> {
        val name = extractDeclarationName(namespace)
        val statements = namespace
            .getChildByFieldName(BODY_FIELD)
            .orNull()
            ?.namedChildren()
            ?.toList()
            .orEmpty()
        val memberPath = parentPath + name
        val (exportStatements, hiddenStatements) = statements.partition { it.type == EXPORT_STATEMENT }
        val hiddenNames = hiddenStatements.flatMap { declaredNames(it) }.toSet()
        val hiddenUses = hiddenStatements
            .flatMap {
                UsedTypeExtractor
                    .extract(
                        it,
                        names
                    ).toList()
            }.filter { it.name !in hiddenNames + name }
        val members = exportStatements.flatMap { membersOf(it, memberPath) }.map { member ->
            member.copy(usedTypes = member.usedTypes.mapTo(LinkedHashSet()) { if (it.name in hiddenNames) UsedType(name) else it })
        }
        return listOf(Declaration(name, DeclarationType.UNKNOWN, hiddenUses.toSet(), parentPath)) + members
    }

    private fun declaredNames(statement: SyntaxNode): List<String> = declarationsOf(statement).flatMap { declaration ->
        if (declaration.type == LEXICAL_DECLARATION || declaration.type == VARIABLE_DECLARATION) {
            declaration.namedChildren().filter { it.type == VARIABLE_DECLARATOR }.flatMap { BindingPatterns.declaredNames(it) }.toList()
        } else {
            listOf(extractDeclarationName(declaration))
        }
    }
}
