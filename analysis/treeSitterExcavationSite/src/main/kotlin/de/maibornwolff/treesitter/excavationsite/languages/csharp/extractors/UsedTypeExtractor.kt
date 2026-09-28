package de.maibornwolff.treesitter.excavationsite.languages.csharp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

internal object UsedTypeExtractor {
    private const val CONSTRUCTOR_DECLARATION = "constructor_declaration"
    private const val METHOD_DECLARATION = "method_declaration"
    private const val PARAMETER_LIST = "parameter_list"
    private const val PARAMETER = "parameter"
    private const val CAST_EXPRESSION = "cast_expression"
    private const val AS_EXPRESSION = "as_expression"
    private const val IS_PATTERN_EXPRESSION = "is_pattern_expression"
    private const val DECLARATION_PATTERN = "declaration_pattern"
    private const val TYPE_ARGUMENT_LIST = "type_argument_list"
    private const val TYPE_PARAMETER_CONSTRAINTS_CLAUSE = "type_parameter_constraints_clause"
    private const val TYPE_PARAMETER_CONSTRAINT = "type_parameter_constraint"
    private const val BASE_LIST = "base_list"
    private const val FIELD_DECLARATION = "field_declaration"
    private const val LOCAL_DECLARATION_STATEMENT = "local_declaration_statement"
    private const val VARIABLE_DECLARATION = "variable_declaration"
    private const val OBJECT_CREATION_EXPRESSION = "object_creation_expression"
    private const val MEMBER_ACCESS_EXPRESSION = "member_access_expression"
    private const val ARRAY_TYPE = "array_type"
    private const val ATTRIBUTE = "attribute"
    private const val IMPLICIT_TYPE = "implicit_type"

    private val FILTERED_VARIABLE_TYPES = setOf("var", "void")

    private val ALL_NODE_TYPES = setOf(
        CONSTRUCTOR_DECLARATION, METHOD_DECLARATION,
        CAST_EXPRESSION, AS_EXPRESSION,
        TYPE_ARGUMENT_LIST, TYPE_PARAMETER_CONSTRAINTS_CLAUSE,
        BASE_LIST,
        FIELD_DECLARATION, LOCAL_DECLARATION_STATEMENT,
        OBJECT_CREATION_EXPRESSION, MEMBER_ACCESS_EXPRESSION,
        ATTRIBUTE, IS_PATTERN_EXPRESSION
    )

    fun extract(declaration: TSNode, sourceCode: String): Set<UsedType> {
        val buckets = TreeTraversal.findAllDescendantsGroupedByType(declaration, ALL_NODE_TYPES)

        val constructorTypes = extractConstructorParameterTypes(declaration, buckets, sourceCode)
        val methodTypes = extractMethodTypes(buckets, sourceCode)
        val castTypes = extractCastTypes(buckets, sourceCode)
        val genericParamTypes = extractGenericTypeArguments(buckets, sourceCode)
        val genericConstraintTypes = extractGenericConstraintTypes(buckets, sourceCode)
        val inheritanceTypes = extractInheritanceTypes(buckets, sourceCode)
        val variableTypes = extractVariableTypes(buckets, sourceCode)
        val objectCreationTypes = extractObjectCreationTypes(buckets, sourceCode)
        val memberAccessTypes = extractMemberAccessTypes(buckets, sourceCode)
        val attributeTypes = extractAttributeTypesWithSuffix(buckets, sourceCode)
        val isTypeCheckTypes = extractPatternMatchingTypes(buckets, sourceCode)

        return (
            constructorTypes + methodTypes + castTypes +
                genericParamTypes + genericConstraintTypes + inheritanceTypes + variableTypes +
                objectCreationTypes + memberAccessTypes + attributeTypes + isTypeCheckTypes
        ).toSet()
    }

    private fun extractConstructorParameterTypes(
        declaration: TSNode,
        buckets: Map<String, List<TSNode>>,
        sourceCode: String
    ): List<UsedType> {
        val regularCtorTypes = buckets[CONSTRUCTOR_DECLARATION].orEmpty().flatMap { ctor ->
            val paramList = ctor.children().firstOrNull { it.type == PARAMETER_LIST }
                ?: return@flatMap emptyList()
            extractParameterTypes(paramList, sourceCode)
        }
        val primaryCtorTypes = declaration
            .children()
            .firstOrNull { it.type == PARAMETER_LIST }
            ?.let { extractParameterTypes(it, sourceCode) }
            ?: emptyList()
        return primaryCtorTypes + regularCtorTypes
    }

    private fun extractMethodTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[METHOD_DECLARATION].orEmpty().flatMap { method ->
            val children = method.children().toList()
            val returnType = children
                .firstOrNull { CSharpTypeHelper.isTypeNode(it) }
                ?.let { CSharpTypeHelper.extractType(it, sourceCode) }
            val paramList = children.firstOrNull { it.type == PARAMETER_LIST }
            val paramTypes = paramList?.let { extractParameterTypes(it, sourceCode) } ?: emptyList()
            paramTypes + listOfNotNull(returnType)
        }

    private fun extractCastTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val explicitCasts = buckets[CAST_EXPRESSION].orEmpty().mapNotNull { cast ->
            val typeNode = cast.namedChildren().firstOrNull { CSharpTypeHelper.isTypeNode(it) }
            typeNode?.let { CSharpTypeHelper.extractType(it, sourceCode) }
        }
        val asCasts = buckets[AS_EXPRESSION].orEmpty().mapNotNull { asExpr ->
            val typeNode = asExpr.namedChildren().lastOrNull { CSharpTypeHelper.isTypeNode(it) }
            typeNode?.let { CSharpTypeHelper.extractType(it, sourceCode) }
        }
        return explicitCasts + asCasts
    }

    private fun extractGenericTypeArguments(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[TYPE_ARGUMENT_LIST].orEmpty().flatMap { typeArgList ->
            typeArgList
                .namedChildren()
                .filter { CSharpTypeHelper.isTypeNode(it) }
                .mapNotNull { CSharpTypeHelper.extractType(it, sourceCode) }
                .toList()
        }

    private fun extractGenericConstraintTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[TYPE_PARAMETER_CONSTRAINTS_CLAUSE].orEmpty().flatMap { clause ->
            clause
                .children()
                .filter { it.type == TYPE_PARAMETER_CONSTRAINT }
                .mapNotNull { constraint ->
                    val typeNode = constraint.namedChildren().firstOrNull { CSharpTypeHelper.isTypeNode(it) }
                    typeNode?.let { CSharpTypeHelper.extractType(it, sourceCode) }
                }.toList()
        }

    private fun extractInheritanceTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[BASE_LIST].orEmpty().flatMap { baseList ->
            baseList
                .namedChildren()
                .filter { CSharpTypeHelper.isTypeNode(it) }
                .mapNotNull { CSharpTypeHelper.extractType(it, sourceCode) }
                .toList()
        }

    private fun extractVariableTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val fieldTypes = buckets[FIELD_DECLARATION].orEmpty().mapNotNull { field ->
            val varDecl = field.children().firstOrNull { it.type == VARIABLE_DECLARATION }
                ?: return@mapNotNull null
            extractVariableDeclarationType(varDecl, sourceCode)
        }
        val localTypes = buckets[LOCAL_DECLARATION_STATEMENT].orEmpty().mapNotNull { stmt ->
            val varDecl = stmt.children().firstOrNull { it.type == VARIABLE_DECLARATION }
                ?: return@mapNotNull null
            extractVariableDeclarationType(varDecl, sourceCode)
        }
        return fieldTypes + localTypes
    }

    private fun extractVariableDeclarationType(varDecl: TSNode, sourceCode: String): UsedType? {
        val typeNode = varDecl.children().firstOrNull { CSharpTypeHelper.isTypeNode(it) || it.type == IMPLICIT_TYPE }
            ?: return null
        if (typeNode.type == IMPLICIT_TYPE) return null
        val type = CSharpTypeHelper.extractType(typeNode, sourceCode) ?: return null
        if (type.name in FILTERED_VARIABLE_TYPES) return null
        return type
    }

    private fun extractObjectCreationTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[OBJECT_CREATION_EXPRESSION].orEmpty().mapNotNull { objCreation ->
            val typeNode = objCreation.namedChildren().firstOrNull { CSharpTypeHelper.isTypeNode(it) }
            typeNode?.let { CSharpTypeHelper.extractType(it, sourceCode) }
        }

    private fun extractMemberAccessTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[MEMBER_ACCESS_EXPRESSION].orEmpty().mapNotNull { memberAccess ->
            val firstChild = memberAccess.getNamedChild(0)
            if (firstChild.isNull) return@mapNotNull null
            val type = CSharpTypeHelper.extractType(firstChild, sourceCode)
                ?: if (firstChild.type == MEMBER_ACCESS_EXPRESSION) {
                    UsedType(name = TreeTraversal.getNodeText(firstChild, sourceCode).trim())
                } else {
                    null
                }
            if (type == null || !type.isUppercase()) return@mapNotNull null
            type
        }

    private fun extractAttributeTypesWithSuffix(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val attributes = buckets[ATTRIBUTE].orEmpty().mapNotNull { attr ->
            val nameNode = attr.namedChildren().firstOrNull { CSharpTypeHelper.isTypeNode(it) }
            nameNode?.let { CSharpTypeHelper.extractType(it, sourceCode) }
        }
        return attributes + attributes.map { UsedType(name = it.name + "Attribute") }
    }

    private fun extractPatternMatchingTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[IS_PATTERN_EXPRESSION].orEmpty().mapNotNull { isExpr ->
            val declarationPattern = isExpr.children().firstOrNull { it.type == DECLARATION_PATTERN }
            if (declarationPattern != null) {
                val typeNode = declarationPattern.namedChildren().firstOrNull { CSharpTypeHelper.isTypeNode(it) }
                return@mapNotNull typeNode?.let { CSharpTypeHelper.extractType(it, sourceCode) }
            }
            val typeNode = isExpr.namedChildren().lastOrNull { CSharpTypeHelper.isTypeNode(it) }
            typeNode?.let { CSharpTypeHelper.extractType(it, sourceCode) }
        }

    private fun extractParameterTypes(paramList: TSNode, sourceCode: String): List<UsedType> {
        val regularParams = paramList
            .children()
            .filter { it.type == PARAMETER }
            .mapNotNull { param ->
                val typeNode = param.children().firstOrNull { CSharpTypeHelper.isTypeNode(it) }
                typeNode?.let { CSharpTypeHelper.extractType(it, sourceCode) }
            }.toList()
        val paramsArrayTypes = paramList
            .children()
            .filter { it.type == ARRAY_TYPE }
            .mapNotNull { CSharpTypeHelper.extractType(it, sourceCode) }
            .toList()
        return regularParams + paramsArrayTypes
    }
}
