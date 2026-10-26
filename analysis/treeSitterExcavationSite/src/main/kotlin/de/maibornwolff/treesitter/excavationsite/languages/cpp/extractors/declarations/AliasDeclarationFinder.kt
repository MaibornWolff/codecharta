package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.CppLocalNames
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * The type aliases of a file, `using Entity = CreatureEntity;` and `typedef struct Size Area;`, reported below [ALIAS]
 * plus their namespaces and enclosing classes, each using the type it names. A typedef of a struct of its own name, one
 * of a function pointer and an alias declared in a function body are none.
 */
internal object AliasDeclarationFinder {
    const val ALIAS = "ALIAS"

    private const val ALIAS_DECLARATION = "alias_declaration"
    private const val TYPE_DEFINITION = "type_definition"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val NAME_FIELD = "name"
    private const val TYPE_FIELD = "type"
    private val TAGGED_SPECIFIERS = setOf("class_specifier", "struct_specifier", "union_specifier", "enum_specifier")
    private val WRAPPING_DECLARATORS = setOf("pointer_declarator", "reference_declarator", "array_declarator", "parenthesized_declarator")

    fun find(rootNode: SyntaxNode): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, ALIAS_DECLARATION, TYPE_DEFINITION)
        .filterNot { CppLocalNames.isInFunction(it) }
        .flatMap { if (it.type == ALIAS_DECLARATION) listOfNotNull(fromUsing(it)) else fromTypedef(it) }

    private fun fromUsing(node: SyntaxNode): Declaration? {
        val name = node.getChildByFieldName(NAME_FIELD).takeUnless { it.isNull }?.text ?: return null
        val target = CppTypeHelper.extractTypeFromTypeField(node) ?: return null
        return alias(node, name, target)
    }

    private fun fromTypedef(node: SyntaxNode): List<Declaration> {
        val typeNode = node.getChildByFieldName(TYPE_FIELD).takeUnless { it.isNull } ?: return emptyList()
        val target = targetOf(typeNode) ?: return emptyList()
        return node
            .namedChildren()
            .filter { it.startByte != typeNode.startByte }
            .mapNotNull { nameOf(it) }
            .filter { it != target.name || typeNode.type !in TAGGED_SPECIFIERS }
            .map { alias(node, it, target) }
            .toList()
    }

    // An untagged struct takes the first name of its typedef, which is then no alias of it
    private fun targetOf(typeNode: SyntaxNode): UsedType? = if (typeNode.type in TAGGED_SPECIFIERS) {
        (
            TreeTraversal.findFirstChildTextByType(
                typeNode,
                TYPE_IDENTIFIER
            ) ?: TypedefNames.nameOfUntagged(typeNode)
        )?.let { UsedType(name = it) }
    } else {
        CppTypeHelper.extractType(typeNode)
    }

    private fun nameOf(declarator: SyntaxNode): String? = when (declarator.type) {
        TYPE_IDENTIFIER -> declarator.text
        in WRAPPING_DECLARATORS -> declarator.namedChildren().firstNotNullOfOrNull { nameOf(it) }
        else -> null
    }

    private fun alias(node: SyntaxNode, name: String, target: UsedType) = Declaration(
        name = name,
        type = DeclarationType.CLASS,
        usedTypes = setOf(target),
        parentPath = listOf(ALIAS) + CppNamespaceWalker.walkAncestorsFrom(node) + EnclosingClasses.of(node)
    )
}
