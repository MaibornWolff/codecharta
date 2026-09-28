package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import org.treesitter.TSNode

internal object DeclarationExtractor {
    private const val FILE_SCOPED_NAMESPACE = "file_scoped_namespace_declaration"
    private const val NAMESPACE_DECLARATION = "namespace_declaration"
    private const val COMPILATION_UNIT = "compilation_unit"
    private const val QUALIFIED_NAME = "qualified_name"
    private const val IDENTIFIER = "identifier"
    private const val NAMESPACE_SEPARATOR = "."

    private val DECLARATION_TYPES = setOf(
        "class_declaration",
        "struct_declaration",
        "record_declaration",
        "interface_declaration",
        "enum_declaration",
        "delegate_declaration"
    )

    fun extract(rootNode: TSNode, sourceCode: String): List<Declaration> {
        val allDeclarations = TreeTraversal
            .findAllDescendantsOfType(rootNode, *DECLARATION_TYPES.toTypedArray())
        val namesByStartByte = allDeclarations.associate { node ->
            node.startByte to TreeTraversal.findChildByType(node, IDENTIFIER, sourceCode)
        }
        return allDeclarations.mapNotNull { declarationNode ->
            val name = namesByStartByte[declarationNode.startByte] ?: return@mapNotNull null
            val namespacePath = findNamespacePath(declarationNode, sourceCode)
            val parentClassPath = findParentClassPath(declarationNode, namesByStartByte)
            Declaration(
                name = name,
                type = mapDeclarationTypeToClosestEquivalent(declarationNode.type),
                usedTypes = UsedTypeExtractor.extract(declarationNode, sourceCode),
                parentPath = namespacePath + parentClassPath
            )
        }
    }

    private fun findNamespacePath(node: TSNode, sourceCode: String): List<String> {
        val ancestorSegments = mutableListOf<List<String>>()
        var current = node.parent
        var compilationUnit: TSNode? = null
        while (!current.isNull) {
            if (current.type == NAMESPACE_DECLARATION || current.type == FILE_SCOPED_NAMESPACE) {
                ancestorSegments.add(0, extractNamespacePath(current, sourceCode))
            }
            if (current.type == COMPILATION_UNIT) {
                compilationUnit = current
            }
            current = current.parent
        }
        if (ancestorSegments.isEmpty() && compilationUnit != null) {
            val namespaceNode = TreeTraversal
                .findAllDescendantsOfType(compilationUnit, FILE_SCOPED_NAMESPACE)
                .firstOrNull()
            if (namespaceNode != null) {
                ancestorSegments.add(extractNamespacePath(namespaceNode, sourceCode))
            }
        }
        return ancestorSegments.flatten()
    }

    private fun findParentClassPath(node: TSNode, namesByStartByte: Map<Int, String?>): List<String> {
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

    private fun mapDeclarationTypeToClosestEquivalent(nodeType: String): DeclarationType = when (nodeType) {
        "class_declaration", "struct_declaration" -> DeclarationType.CLASS
        "record_declaration" -> DeclarationType.RECORD
        "interface_declaration", "delegate_declaration" -> DeclarationType.INTERFACE
        "enum_declaration" -> DeclarationType.ENUM
        else -> DeclarationType.UNKNOWN
    }

    private fun extractNamespacePath(node: TSNode, sourceCode: String): List<String> {
        val text = TreeTraversal.findFirstChildTextByType(node, sourceCode, QUALIFIED_NAME, IDENTIFIER)
            ?: return emptyList()
        return text.split(NAMESPACE_SEPARATOR)
    }
}
