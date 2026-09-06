package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

internal object DeclarationExtractor {
    private const val CLASS_DECLARATION = "class_declaration"
    private const val RECORD_DECLARATION = "record_declaration"
    private const val INTERFACE_DECLARATION = "interface_declaration"
    private const val ENUM_DECLARATION = "enum_declaration"
    private const val ANNOTATION_TYPE_DECLARATION = "annotation_type_declaration"
    private const val NAME_FIELD = "name"

    private val DECLARATION_TYPES = setOf(
        CLASS_DECLARATION,
        RECORD_DECLARATION,
        INTERFACE_DECLARATION,
        ENUM_DECLARATION,
        ANNOTATION_TYPE_DECLARATION
    )

    fun extract(rootNode: TSNode, sourceCode: String): List<Declaration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, *DECLARATION_TYPES.toTypedArray())
        .map { declarationNode ->
            val name = TreeTraversal.getNodeText(declarationNode.getChildByFieldName(NAME_FIELD), sourceCode)
            val type = declarationType(declarationNode)
            val usedTypes = UsedTypeExtractor.extract(declarationNode, sourceCode)
            Declaration(name = name, type = type, usedTypes = usedTypes)
        }.toList()

    private fun declarationType(node: TSNode): DeclarationType = when (node.type) {
        CLASS_DECLARATION -> DeclarationType.CLASS
        RECORD_DECLARATION -> DeclarationType.RECORD
        INTERFACE_DECLARATION -> DeclarationType.INTERFACE
        ENUM_DECLARATION -> DeclarationType.ENUM
        ANNOTATION_TYPE_DECLARATION -> DeclarationType.ANNOTATION
        else -> DeclarationType.UNKNOWN
    }
}
