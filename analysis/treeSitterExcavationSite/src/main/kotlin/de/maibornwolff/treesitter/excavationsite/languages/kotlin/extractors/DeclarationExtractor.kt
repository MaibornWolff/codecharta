package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The classes, objects and `fun interface`s of a Kotlin file wherever they stand, and its top-level functions,
 * properties and typealiases. A file holding none of them but code is one [DeclarationType.SCRIPT] that uses
 * what the whole file uses.
 */
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

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val importedNames = ImportExtractor.importedNames(rootNode)
        val declarations = typeDeclarations(rootNode, importedNames) +
            FunInterfaceExtractor.extract(rootNode, importedNames) +
            TopLevelDeclarationExtractor.extract(rootNode, importedNames)
        if (declarations.isNotEmpty() || !TopLevelDeclarationExtractor.holdsCode(rootNode)) return declarations
        return listOf(Declaration(name = "", type = DeclarationType.SCRIPT, usedTypes = UsedTypeExtractor.extract(rootNode, importedNames)))
    }

    private fun typeDeclarations(rootNode: SyntaxNode, importedNames: Set<String>): List<Declaration> {
        val allDeclarations = TreeTraversal
            .findAllDescendantsOfType(rootNode, *DECLARATION_TYPES.toTypedArray())
        val namesByStartByte = allDeclarations.associate { node ->
            node.startByte to extractName(node)
        }
        return allDeclarations
            .mapNotNull { declarationNode ->
                val name = namesByStartByte[declarationNode.startByte]
                if (name.isNullOrBlank()) return@mapNotNull null
                val type = declarationType(declarationNode)
                val usedTypes = UsedTypeExtractor.extract(declarationNode, importedNames)
                val parentPath = findParentPath(declarationNode, namesByStartByte)
                Declaration(name = name, type = type, usedTypes = usedTypes, parentPath = parentPath)
            }.toList()
    }

    private fun extractName(node: SyntaxNode): String = node
        .children()
        .firstOrNull { it.type == TYPE_IDENTIFIER }
        ?.text
        ?.trim()
        ?: ""

    fun findParentPath(node: SyntaxNode, namesByStartByte: Map<Int, String>): List<String> {
        val parents = mutableListOf<String>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type in DECLARATION_TYPES) {
                val parentName = namesByStartByte[current.startByte] ?: extractName(current)
                if (parentName.isNotBlank()) {
                    parents.add(0, parentName)
                }
            }
            current = current.parent
        }
        return parents
    }

    private fun declarationType(node: SyntaxNode): DeclarationType {
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
