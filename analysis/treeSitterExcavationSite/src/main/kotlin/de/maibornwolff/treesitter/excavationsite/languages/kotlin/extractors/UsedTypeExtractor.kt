package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

internal object UsedTypeExtractor {
    // Call expressions
    private const val CALL_EXPRESSION = "call_expression"
    private const val NAVIGATION_EXPRESSION = "navigation_expression"
    private const val CALL_SUFFIX = "call_suffix"

    // Type nodes
    private const val USER_TYPE = "user_type"
    private const val NULLABLE_TYPE = "nullable_type"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val TYPE_ARGUMENTS = "type_arguments"
    private const val TYPE_PROJECTION = "type_projection"

    private val ALL_NODE_TYPES = setOf(USER_TYPE, CALL_EXPRESSION, NAVIGATION_EXPRESSION)

    fun extract(declaration: SyntaxNode, importedNames: Set<String> = emptySet()): Set<UsedType> {
        val buckets = TreeTraversal
            .findAllDescendantsGroupedByType(declaration, ALL_NODE_TYPES)
            .mapValues { (_, nodes) -> nodes.filter { KotlinScopes.belongsTo(it, declaration) } }

        val writtenTypes = buckets[USER_TYPE]
            .orEmpty()
            .filterNot { isTypeArgumentOfNamedType(it) }
            .mapNotNull { extractType(it) }
        val constructorCallTypes = buckets[CALL_EXPRESSION].orEmpty().mapNotNull { extractCallType(it) }
        val navigationTypes = buckets[NAVIGATION_EXPRESSION].orEmpty().mapNotNull { extractNavigationType(it) }
        val valueReferences = ValueReferenceExtractor.extract(declaration, importedNames)

        return (writtenTypes + constructorCallTypes + navigationTypes + valueReferences).toSet()
    }

    private fun extractCallType(call: SyntaxNode): UsedType? {
        val name = calleeTypeName(call)?.takeUnless { KotlinScopes.LOCAL_TYPES.isLocal(call, it) } ?: return null
        val callSuffix = call.children().firstOrNull { it.type == CALL_SUFFIX }
        val genericTypes = callSuffix?.let { extractGenericTypesFromCallSuffix(it) } ?: emptyList()
        return UsedType(name = name, genericTypes = genericTypes)
    }

    private fun extractNavigationType(navigation: SyntaxNode): UsedType? =
        KotlinNames.segmentsOf(navigation.getNamedChild(0))?.let { KotlinNames.typeNameOf(it) }?.let { UsedType(it) }

    private fun calleeTypeName(call: SyntaxNode): String? {
        val callee = call.getNamedChild(0)
        if (callee.isNull) return null
        return KotlinNames.segmentsOf(callee)?.let { KotlinNames.typeNameOf(it) }
    }

    // A type argument is already a generic type of the type or the constructor call it belongs to
    private fun isTypeArgumentOfNamedType(userType: SyntaxNode): Boolean {
        val wrapper = userType.parent.takeIf { it.type == NULLABLE_TYPE } ?: userType
        val projection = wrapper.parent.takeIf { it.type == TYPE_PROJECTION } ?: return false
        val typeArguments = projection.parent.takeIf { it.type == TYPE_ARGUMENTS } ?: return false
        val owner = typeArguments.parent
        return when (owner.type) {
            USER_TYPE -> true
            CALL_SUFFIX -> calleeTypeName(owner.parent) != null
            else -> false
        }
    }

    private fun extractTypeFromNullable(nullableNode: SyntaxNode): UsedType? {
        val userType = nullableNode.children().firstOrNull { it.type == USER_TYPE }
        return userType?.let { extractType(it) }
    }

    private fun extractType(userTypeNode: SyntaxNode): UsedType? {
        if (userTypeNode.isNull) return null
        val segments = userTypeNode.children().filter { it.type == TYPE_IDENTIFIER }.map { it.text.trim() }.toList()
        val name = writtenTypeName(segments)?.takeUnless { KotlinScopes.LOCAL_TYPES.isLocal(userTypeNode, segments.first()) } ?: return null
        val typeArgs = userTypeNode.children().firstOrNull { it.type == TYPE_ARGUMENTS }
        val genericTypes = typeArgs?.let { extractTypeArguments(it) } ?: emptyList()
        return UsedType(name = name, genericTypes = genericTypes)
    }

    // `Outer.Inner` names the nested class, `com.example.Target` the package it comes from
    private fun writtenTypeName(segments: List<String>): String? {
        val first = segments.firstOrNull() ?: return null
        return KotlinNames.typeNameOf(segments) ?: first
    }

    private fun extractTypeArguments(typeArgsNode: SyntaxNode): List<UsedType> = typeArgsNode
        .children()
        .filter { it.type == TYPE_PROJECTION }
        .mapNotNull { projection ->
            // Star projection has no user_type child — skip it
            val userType = projection.children().firstOrNull { it.type == USER_TYPE }
                ?: projection.children().firstOrNull { it.type == NULLABLE_TYPE }
            when {
                userType == null -> null
                userType.type == NULLABLE_TYPE -> extractTypeFromNullable(userType)
                else -> extractType(userType)
            }
        }.toList()

    private fun extractGenericTypesFromCallSuffix(callSuffix: SyntaxNode): List<UsedType> {
        val typeArgs = callSuffix.children().firstOrNull { it.type == TYPE_ARGUMENTS }
            ?: return emptyList()
        return extractTypeArguments(typeArgs)
    }
}
