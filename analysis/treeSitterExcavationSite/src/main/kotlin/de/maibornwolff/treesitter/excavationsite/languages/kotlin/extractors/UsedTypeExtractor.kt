package de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren

internal object UsedTypeExtractor {
    // Declaration structure
    private const val DELEGATION_SPECIFIER = "delegation_specifier"
    private const val CONSTRUCTOR_INVOCATION = "constructor_invocation"
    private const val PROPERTY_DECLARATION = "property_declaration"
    private const val VARIABLE_DECLARATION = "variable_declaration"
    private const val CLASS_PARAMETER = "class_parameter"
    private const val PARAMETER = "parameter"
    private const val FUNCTION_DECLARATION = "function_declaration"
    private const val FUNCTION_VALUE_PARAMETERS = "function_value_parameters"
    private const val ANNOTATION = "annotation"

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
    private const val COLON = ":"

    private val ALL_NODE_TYPES = setOf(
        DELEGATION_SPECIFIER,
        PROPERTY_DECLARATION,
        CLASS_PARAMETER,
        FUNCTION_DECLARATION,
        ANNOTATION,
        CALL_EXPRESSION,
        NAVIGATION_EXPRESSION
    )

    fun extract(declaration: SyntaxNode): Set<UsedType> {
        val buckets = TreeTraversal.findAllDescendantsGroupedByType(declaration, ALL_NODE_TYPES)

        val inheritanceTypes = extractInheritanceTypes(buckets)
        val propertyTypes = extractPropertyTypes(buckets)
        val parameterTypes = extractParameterTypes(buckets)
        val returnTypes = extractReturnTypes(buckets)
        val annotationTypes = extractAnnotationTypes(buckets)
        val constructorCallTypes = extractUppercaseCallTypes(buckets, CALL_EXPRESSION)
        val callExpressionTypes = extractUppercaseCallTypes(buckets, NAVIGATION_EXPRESSION)

        return (
            inheritanceTypes + propertyTypes + parameterTypes + returnTypes +
                annotationTypes + constructorCallTypes + callExpressionTypes
        ).toSet()
    }

    private fun extractInheritanceTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> = buckets[DELEGATION_SPECIFIER]
        .orEmpty()
        .mapNotNull { extractTypeFromConstructorOrUserType(it) }

    private fun extractPropertyTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> {
        val fromProperties = buckets[PROPERTY_DECLARATION].orEmpty().mapNotNull { property ->
            val varDecl = property.children().firstOrNull { it.type == VARIABLE_DECLARATION }
            varDecl?.let { extractTypeAfterColon(it) }
        }
        val fromClassParams = buckets[CLASS_PARAMETER].orEmpty().mapNotNull { param ->
            extractTypeAfterColon(param)
        }
        return fromProperties + fromClassParams
    }

    private fun extractParameterTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> {
        return buckets[FUNCTION_DECLARATION].orEmpty().flatMap { function ->
            val params = function.children().firstOrNull { it.type == FUNCTION_VALUE_PARAMETERS }
                ?: return@flatMap emptyList()
            params
                .namedChildren()
                .filter { it.type == PARAMETER }
                .mapNotNull { extractTypeAfterColon(it) }
                .toList()
        }
    }

    private fun extractReturnTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> =
        buckets[FUNCTION_DECLARATION].orEmpty().mapNotNull { function ->
            extractTypeAfterColon(function)
        }

    private fun extractAnnotationTypes(buckets: Map<String, List<SyntaxNode>>): List<UsedType> =
        buckets[ANNOTATION].orEmpty().mapNotNull { extractTypeFromConstructorOrUserType(it) }

    private fun extractUppercaseCallTypes(buckets: Map<String, List<SyntaxNode>>, nodeType: String): List<UsedType> {
        return buckets[nodeType].orEmpty().mapNotNull { node ->
            val firstChild = node.getNamedChild(0)
            if (firstChild.isNull) return@mapNotNull null
            val name = firstChild.text.trim()
            if (name.firstOrNull()?.isUpperCase() != true) return@mapNotNull null
            val callSuffix = node.children().firstOrNull { it.type == CALL_SUFFIX }
            val genericTypes = callSuffix?.let { extractGenericTypesFromCallSuffix(it) } ?: emptyList()
            UsedType(name = name, genericTypes = genericTypes)
        }
    }

    private fun extractTypeFromConstructorOrUserType(node: SyntaxNode): UsedType? {
        val constructorInvocation = node.children().firstOrNull { it.type == CONSTRUCTOR_INVOCATION }
        val typeParent = constructorInvocation ?: node
        val userType = typeParent.children().firstOrNull { it.type == USER_TYPE }
        return userType?.let { extractType(it) }
    }

    private fun extractTypeAfterColon(node: SyntaxNode): UsedType? {
        val children = node.children().toList()
        val colonIndex = children.indexOfFirst { it.type == COLON }
        if (colonIndex < 0 || colonIndex + 1 >= children.size) return null
        val typeNode = children[colonIndex + 1]
        return when (typeNode.type) {
            USER_TYPE -> extractType(typeNode)
            NULLABLE_TYPE -> extractTypeFromNullable(typeNode)
            else -> null
        }
    }

    private fun extractTypeFromNullable(nullableNode: SyntaxNode): UsedType? {
        val userType = nullableNode.children().firstOrNull { it.type == USER_TYPE }
        return userType?.let { extractType(it) }
    }

    private fun extractType(userTypeNode: SyntaxNode): UsedType? {
        if (userTypeNode.isNull) return null
        val typeIdentifier = userTypeNode.children().firstOrNull { it.type == TYPE_IDENTIFIER }
            ?: return null
        val name = typeIdentifier.text.trim()
        val typeArgs = userTypeNode.children().firstOrNull { it.type == TYPE_ARGUMENTS }
        val genericTypes = typeArgs?.let { extractTypeArguments(it) } ?: emptyList()
        return UsedType(name = name, genericTypes = genericTypes)
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
