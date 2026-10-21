package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

internal object DeclarationExtractor {
    private const val CLASS_DECLARATION = "class_declaration"
    private const val RECORD_DECLARATION = "record_declaration"
    private const val INTERFACE_DECLARATION = "interface_declaration"
    private const val ENUM_DECLARATION = "enum_declaration"
    private const val ANNOTATION_TYPE_DECLARATION = "annotation_type_declaration"
    private const val NAME_FIELD = "name"

    fun extract(rootNode: SyntaxNode): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, *JavaScopes.TYPE_DECLARATIONS.toTypedArray())
        .filterNot { JavaScopes.LOCAL_TYPES.isLocalClass(it) }
        .map { declarationNode ->
            val name = declarationNode.getChildByFieldName(NAME_FIELD).text
            val type = declarationType(declarationNode)
            val usedTypes = UsedTypeExtractor.extract(declarationNode)
            Declaration(name = name, type = type, usedTypes = usedTypes, parentPath = enclosingTypeNames(declarationNode))
        }.toList()

    private fun enclosingTypeNames(declaration: SyntaxNode): List<String> = declaration
        .ancestors()
        .filter { it.type in JavaScopes.TYPE_DECLARATIONS }
        .map { it.getChildByFieldName(NAME_FIELD).text }
        .toList()
        .asReversed()

    private fun declarationType(node: SyntaxNode): DeclarationType = when (node.type) {
        CLASS_DECLARATION -> DeclarationType.CLASS
        RECORD_DECLARATION -> DeclarationType.RECORD
        INTERFACE_DECLARATION -> DeclarationType.INTERFACE
        ENUM_DECLARATION -> DeclarationType.ENUM
        ANNOTATION_TYPE_DECLARATION -> DeclarationType.ANNOTATION
        else -> DeclarationType.UNKNOWN
    }
}
