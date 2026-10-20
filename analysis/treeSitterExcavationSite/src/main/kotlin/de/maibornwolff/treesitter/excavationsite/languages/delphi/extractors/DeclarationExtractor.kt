package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

internal object DeclarationExtractor {
    private const val DECL_TYPE = "declType"
    private const val DECL_CLASS = "declClass"
    private const val DECL_INTF = "declIntf"
    private const val DECL_HELPER = "declHelper"
    private const val DECL_ENUM = "declEnum"
    private const val DEF_PROC = "defProc"
    private const val TYPE_FIELD = "type"
    private const val HEADER_FIELD = "header"
    private const val NAME_FIELD = "name"
    private const val ENTITY_FIELD = "entity"
    private const val LHS_FIELD = "lhs"
    private const val RHS_FIELD = "rhs"
    private const val IDENTIFIER = "identifier"
    private const val GENERIC_DOT = "genericDot"
    private const val GENERIC_TPL = "genericTpl"
    private const val K_CLASS = "kClass"
    private const val K_RECORD = "kRecord"
    private const val K_OBJECT = "kObject"
    private const val K_OBJC_CLASS = "kObjcclass"
    private const val K_OBJC_CATEGORY = "kObjccategory"
    private const val K_OBJC_PROTOCOL = "kObjcprotocol"
    private const val K_END = "kEnd"

    private val CLASS_KEYWORDS = setOf(K_CLASS, K_OBJECT, K_OBJC_CLASS, K_OBJC_CATEGORY, K_OBJC_PROTOCOL)

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val defProcsByClass = collectDefProcsByClass(rootNode)
        // Names include forward declarations, so a parent path can resolve an ancestor that is not emitted.
        val allDeclTypes = TreeTraversal.findAllDescendantsOfType(rootNode, DECL_TYPE)
        val namesByStartByte = allDeclTypes.associate { it.startByte to extractDelphiDeclTypeName(it) }
        return allDeclTypes
            .filter { !isForwardDeclaration(it) }
            .mapNotNull { declTypeNode ->
                val name = namesByStartByte[declTypeNode.startByte]
                if (name.isNullOrBlank()) return@mapNotNull null

                val declarationType = resolveDeclarationType(declTypeNode) ?: return@mapNotNull null
                val additionalRoots = defProcsByClass[name].orEmpty()
                val usedTypes = UsedTypeExtractor.extractFromRoots(listOf(declTypeNode) + additionalRoots)
                Declaration(
                    name = name,
                    type = declarationType,
                    usedTypes = usedTypes,
                    parentPath = findParentPath(declTypeNode, namesByStartByte)
                )
            }
    }

    private fun findParentPath(declTypeNode: SyntaxNode, namesByStartByte: Map<Int, String?>): List<String> {
        val parents = mutableListOf<String>()
        var current = declTypeNode.parent
        while (!current.isNull) {
            if (current.type == DECL_TYPE) {
                val parentName = namesByStartByte[current.startByte]
                if (!parentName.isNullOrBlank()) parents.add(0, parentName)
            }
            current = current.parent
        }
        return parents
    }

    private fun isForwardDeclaration(declTypeNode: SyntaxNode): Boolean {
        val typeFieldNode = declTypeNode.getChildByFieldName(TYPE_FIELD)
        if (typeFieldNode.isNull) return false
        if (typeFieldNode.type != DECL_CLASS && typeFieldNode.type != DECL_INTF) return false
        return typeFieldNode.children().none { it.type == K_END }
    }

    // Method bodies live in `implementation` apart from their class, bound back by the `TFoo.Method` name.
    // Operator implementations (`class operator TAny.Implicit`) have the same name shape and bind alike.
    private fun collectDefProcsByClass(rootNode: SyntaxNode): Map<String, List<SyntaxNode>> {
        val result = mutableMapOf<String, MutableList<SyntaxNode>>()
        TreeTraversal.findAllDescendantsOfType(rootNode, DEF_PROC).forEach { defProc ->
            val header = defProc.getChildByFieldName(HEADER_FIELD)
            if (header.isNull) return@forEach
            val nameNode = header.getChildByFieldName(NAME_FIELD)
            if (nameNode.isNull) return@forEach
            val className = qualifiedNameClassPrefix(nameNode) ?: return@forEach
            result.getOrPut(className) { mutableListOf() } += defProc
        }
        return result
    }

    private fun qualifiedNameClassPrefix(nameNode: SyntaxNode): String? {
        if (nameNode.type != GENERIC_DOT) return null
        val lhs = nameNode.getChildByFieldName(LHS_FIELD)
        if (lhs.isNull) return null
        return when (lhs.type) {
            IDENTIFIER -> lhs.text
            GENERIC_TPL -> identifierTextOrNull(lhs.getChildByFieldName(ENTITY_FIELD))
            GENERIC_DOT -> penultimateSegmentOfNestedQualification(lhs)
            else -> null
        }
    }

    private fun penultimateSegmentOfNestedQualification(outerLhs: SyntaxNode): String? =
        identifierTextOrNull(outerLhs.getChildByFieldName(RHS_FIELD))

    private fun identifierTextOrNull(node: SyntaxNode): String? = if (!node.isNull && node.type == IDENTIFIER) node.text else null

    private fun resolveDeclarationType(declTypeNode: SyntaxNode): DeclarationType? {
        val typeFieldNode = declTypeNode.getChildByFieldName(TYPE_FIELD)
        if (typeFieldNode.isNull) return null

        return when (typeFieldNode.type) {
            DECL_CLASS -> classifyDeclClass(typeFieldNode)
            DECL_INTF -> DeclarationType.INTERFACE
            DECL_HELPER -> DeclarationType.CLASS
            TYPE_FIELD -> classifyTypeWrapper(typeFieldNode)
            else -> null
        }
    }

    private fun classifyDeclClass(declClassNode: SyntaxNode): DeclarationType {
        val keyword = declClassNode
            .children()
            .firstOrNull { it.type in CLASS_KEYWORDS || it.type == K_RECORD }
            ?: return DeclarationType.CLASS
        return if (keyword.type == K_RECORD) DeclarationType.RECORD else DeclarationType.CLASS
    }

    private fun classifyTypeWrapper(typeNode: SyntaxNode): DeclarationType? {
        val hasEnum = typeNode.children().any { it.type == DECL_ENUM }
        return if (hasEnum) DeclarationType.ENUM else null
    }
}
