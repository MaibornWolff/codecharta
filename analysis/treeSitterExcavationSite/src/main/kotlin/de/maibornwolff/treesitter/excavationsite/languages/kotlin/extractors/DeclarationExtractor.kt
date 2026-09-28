package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object DeclarationExtractor {
    private const val CLASS_DECLARATION = "class_declaration"
    private const val OBJECT_DECLARATION = "object_declaration"
    private const val TYPE_IDENTIFIER = "type_identifier"

    // Kotlin uses keyword children to distinguish class types
    private const val ENUM_KEYWORD = "enum"
    private const val INTERFACE_KEYWORD = "interface"

    // Annotation is a modifier, not a keyword
    private const val MODIFIERS = "modifiers"
    private const val CLASS_MODIFIER = "class_modifier"
    private const val ANNOTATION_KEYWORD = "annotation"

    private val DECLARATION_TYPES = setOf(CLASS_DECLARATION, OBJECT_DECLARATION)

    fun extract(rootNode: TSNode, sourceCode: String): List<Declaration> {
        val allDeclarations = TreeTraversal
            .findAllDescendantsOfType(rootNode, *DECLARATION_TYPES.toTypedArray())
        val namesByStartByte = allDeclarations.associate { node ->
            node.startByte to extractName(node, sourceCode)
        }
        return allDeclarations
            .mapNotNull { declarationNode ->
                val name = namesByStartByte[declarationNode.startByte]
                if (name.isNullOrBlank()) return@mapNotNull null
                val type = declarationType(declarationNode)
                val usedTypes = UsedTypeExtractor.extract(declarationNode, sourceCode)
                val parentPath = findParentPath(declarationNode, namesByStartByte)
                Declaration(name = name, type = type, usedTypes = usedTypes, parentPath = parentPath)
            }.toList()
    }

    private fun extractName(node: TSNode, sourceCode: String): String = node
        .children()
        .firstOrNull { it.type == TYPE_IDENTIFIER }
        ?.let { TreeTraversal.getNodeText(it, sourceCode).trim() }
        ?: ""

    private fun findParentPath(node: TSNode, namesByStartByte: Map<Int, String>): List<String> {
        val parents = mutableListOf<String>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type in DECLARATION_TYPES) {
                val parentName = namesByStartByte[current.startByte]
                if (!parentName.isNullOrBlank()) {
                    parents.add(0, parentName)
                }
            }
            current = current.parent
        }
        return parents
    }

    private fun declarationType(node: TSNode): DeclarationType {
        if (node.type == OBJECT_DECLARATION) return DeclarationType.CLASS

        // class_declaration: check for enum/interface keywords as direct children
        val children = node.children().toList()
        if (children.any { it.type == ENUM_KEYWORD }) return DeclarationType.ENUM
        if (children.any { it.type == INTERFACE_KEYWORD }) return DeclarationType.INTERFACE

        // Check modifiers for annotation class
        val modifiers = children.firstOrNull { it.type == MODIFIERS }
        if (modifiers != null) {
            val hasAnnotationModifier = modifiers.children().any { modifier ->
                modifier.type == CLASS_MODIFIER &&
                    modifier.children().any { it.type == ANNOTATION_KEYWORD }
            }
            if (hasAnnotationModifier) return DeclarationType.ANNOTATION
        }

        return DeclarationType.CLASS
    }
}
