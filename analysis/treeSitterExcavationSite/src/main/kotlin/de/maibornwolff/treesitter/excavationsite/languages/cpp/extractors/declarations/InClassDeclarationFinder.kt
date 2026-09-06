package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.declarations

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.CppNamespaceWalker
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.UsedTypeExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object InClassDeclarationFinder {
    private const val CLASS_SPECIFIER = "class_specifier"
    private const val STRUCT_SPECIFIER = "struct_specifier"
    private const val UNION_SPECIFIER = "union_specifier"
    private const val ENUM_SPECIFIER = "enum_specifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val FIELD_DECLARATION_LIST = "field_declaration_list"
    private const val ENUMERATOR_LIST = "enumerator_list"

    private val DECLARATION_NODE_TYPES = setOf(CLASS_SPECIFIER, STRUCT_SPECIFIER, UNION_SPECIFIER, ENUM_SPECIFIER)

    fun find(rootNode: TSNode, sourceCode: String): List<Declaration> {
        val allDeclarationNodes = TreeTraversal
            .findAllDescendantsOfType(rootNode, *DECLARATION_NODE_TYPES.toTypedArray())
        val nameByStartByte = allDeclarationNodes.associate { node ->
            node.startByte to TreeTraversal.findFirstChildTextByType(node, sourceCode, TYPE_IDENTIFIER)
        }
        return allDeclarationNodes.mapNotNull { toDeclaration(it, sourceCode, nameByStartByte) }
    }

    private fun toDeclaration(node: TSNode, sourceCode: String, nameByStartByte: Map<Int, String?>): Declaration? {
        // Forward declarations have no body — DC legacy emits no Declaration for them.
        if (!hasBody(node)) return null
        val name = nameByStartByte[node.startByte] ?: return null
        return Declaration(
            name = name,
            type = mapType(node.type),
            usedTypes = UsedTypeExtractor.extract(node, sourceCode),
            parentPath = CppNamespaceWalker.walkAncestorsFrom(node, sourceCode) + findParentClassPath(node, nameByStartByte)
        )
    }

    private fun hasBody(node: TSNode): Boolean {
        val bodyType = if (node.type == ENUM_SPECIFIER) ENUMERATOR_LIST else FIELD_DECLARATION_LIST
        return node.children().any { it.type == bodyType }
    }

    private fun findParentClassPath(node: TSNode, nameByStartByte: Map<Int, String?>): List<String> {
        val parents = mutableListOf<String>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type in DECLARATION_NODE_TYPES) {
                val parentName = nameByStartByte[current.startByte]
                if (!parentName.isNullOrBlank()) {
                    parents.add(0, parentName)
                }
            }
            current = current.parent
        }
        return parents
    }

    private fun mapType(nodeType: String): DeclarationType = when (nodeType) {
        ENUM_SPECIFIER -> DeclarationType.ENUM
        else -> DeclarationType.CLASS
    }
}
