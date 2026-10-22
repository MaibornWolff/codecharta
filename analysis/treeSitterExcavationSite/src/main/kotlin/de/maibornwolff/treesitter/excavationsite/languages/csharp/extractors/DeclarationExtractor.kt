package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.ancestors

internal object DeclarationExtractor {
    private const val FILE_SCOPED_NAMESPACE = "file_scoped_namespace_declaration"
    private const val NAMESPACE_DECLARATION = "namespace_declaration"
    private const val COMPILATION_UNIT = "compilation_unit"
    private const val QUALIFIED_NAME = "qualified_name"
    private const val IDENTIFIER = "identifier"
    private const val NAMESPACE_SEPARATOR = "."

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val allDeclarations = TreeTraversal
            .findAllDescendantsOfType(rootNode, *CSharpScopes.TYPE_DECLARATIONS.toTypedArray())
        val namesByStartByte = allDeclarations.associate { node ->
            node.startByte to TreeTraversal.findFirstChildTextByType(node, IDENTIFIER)
        }
        val fileScopedNamespacePath by lazy { findFileScopedNamespacePath(rootNode) }
        return allDeclarations.mapNotNull { declarationNode ->
            val name = namesByStartByte[declarationNode.startByte] ?: return@mapNotNull null
            val enclosingNamespacePaths = findEnclosingNamespacePaths(declarationNode)
            val namespacePath = if (enclosingNamespacePaths.isEmpty()) fileScopedNamespacePath else enclosingNamespacePaths.flatten()
            val parentClassPath = findParentClassPath(declarationNode, namesByStartByte)
            Declaration(
                name = name,
                type = mapDeclarationTypeToClosestEquivalent(declarationNode.type),
                usedTypes = UsedTypeExtractor.extract(declarationNode),
                parentPath = namespacePath + parentClassPath
            )
        }
    }

    private fun findEnclosingNamespacePaths(node: SyntaxNode): List<List<String>> = node
        .ancestors()
        .filter { it.type == NAMESPACE_DECLARATION || it.type == FILE_SCOPED_NAMESPACE }
        .map { extractNamespacePath(it) }
        .toList()
        .asReversed()

    // The declarations behind a file-scoped namespace are its siblings, not its children
    private fun findFileScopedNamespacePath(rootNode: SyntaxNode): List<String> {
        if (rootNode.type != COMPILATION_UNIT) return emptyList()
        val namespaceNode = TreeTraversal.findAllDescendantsOfType(rootNode, FILE_SCOPED_NAMESPACE).firstOrNull()
        return namespaceNode?.let { extractNamespacePath(it) } ?: emptyList()
    }

    private fun findParentClassPath(node: SyntaxNode, namesByStartByte: Map<Int, String?>): List<String> {
        val parents = mutableListOf<String>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type in CSharpScopes.TYPE_DECLARATIONS) {
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

    private fun extractNamespacePath(node: SyntaxNode): List<String> {
        val text = TreeTraversal.findFirstChildTextByType(node, QUALIFIED_NAME, IDENTIFIER)
            ?: return emptyList()
        return text.split(NAMESPACE_SEPARATOR)
    }
}
