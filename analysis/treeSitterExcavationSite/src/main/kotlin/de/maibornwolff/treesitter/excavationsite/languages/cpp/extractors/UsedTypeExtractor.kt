package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.AliasConstraintExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.CallExpressionTypeExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.ClassScopeExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.DeclarationTypeExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes.SignatureTypeExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

internal object UsedTypeExtractor {
    private const val CLASS_SPECIFIER = "class_specifier"
    private const val STRUCT_SPECIFIER = "struct_specifier"
    private const val UNION_SPECIFIER = "union_specifier"
    private const val ENUM_SPECIFIER = "enum_specifier"

    private val DECLARATION_BOUNDARIES = setOf(CLASS_SPECIFIER, STRUCT_SPECIFIER, UNION_SPECIFIER, ENUM_SPECIFIER)

    private val ALL_NODE_TYPES: Set<String> =
        DeclarationTypeExtractor.nodeTypes +
            CallExpressionTypeExtractor.nodeTypes +
            ClassScopeExtractor.nodeTypes +
            SignatureTypeExtractor.nodeTypes +
            AliasConstraintExtractor.nodeTypes

    fun extract(declaration: TSNode, sourceCode: String): Set<UsedType> {
        val buckets = groupDescendantsStoppingAtNestedDeclarations(declaration, ALL_NODE_TYPES)
        return (
            DeclarationTypeExtractor.extractFieldAndVariableTypes(buckets, sourceCode) +
                DeclarationTypeExtractor.extractCStyleCasts(buckets, sourceCode) +
                CallExpressionTypeExtractor.extractInstantiationTypes(buckets, sourceCode) +
                CallExpressionTypeExtractor.extractConstructorInitializerTypes(buckets, sourceCode) +
                DeclarationTypeExtractor.extractTypeOperandTypes(buckets, sourceCode) +
                ClassScopeExtractor.extractFriendAndUsingTypes(buckets, sourceCode) +
                SignatureTypeExtractor.extractInheritance(buckets, sourceCode) +
                SignatureTypeExtractor.extractMethodReturnAndParamTypes(buckets, sourceCode) +
                SignatureTypeExtractor.extractDeclaratorParamTypes(buckets, sourceCode) +
                AliasConstraintExtractor.extractAliasTypes(buckets, sourceCode) +
                AliasConstraintExtractor.extractConstraintTypes(declaration, sourceCode)
        ).toSet()
    }

    private fun groupDescendantsStoppingAtNestedDeclarations(root: TSNode, targetTypes: Set<String>): Map<String, List<TSNode>> {
        val buckets = mutableMapOf<String, MutableList<TSNode>>()
        if (!root.isNull && root.type in targetTypes) {
            buckets.getOrPut(root.type) { mutableListOf() }.add(root)
        }
        val stack = ArrayDeque<TSNode>()
        root.children().forEach(stack::addLast)
        while (stack.isNotEmpty()) {
            val node = stack.removeLast()
            if (!node.isNull) {
                if (node.type in targetTypes) {
                    buckets.getOrPut(node.type) { mutableListOf() }.add(node)
                }
                if (node.type !in DECLARATION_BOUNDARIES) {
                    node.children().forEach(stack::addLast)
                }
            }
        }
        return buckets
    }
}
