package de.maibornwolff.treesitter.excavationsite.languages.java.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

internal object UsedTypeExtractor {
    // Node types for type source extraction
    private const val FIELD_DECLARATION = "field_declaration"
    private const val LOCAL_VARIABLE_DECLARATION = "local_variable_declaration"
    private const val ANNOTATION = "annotation"
    private const val MARKER_ANNOTATION = "marker_annotation"
    private const val OBJECT_CREATION_EXPRESSION = "object_creation_expression"
    private const val METHOD_INVOCATION = "method_invocation"
    private const val FIELD_ACCESS = "field_access"
    private const val METHOD_DECLARATION = "method_declaration"
    private const val CONSTRUCTOR_DECLARATION = "constructor_declaration"

    // Node types for inheritance and exceptions
    private const val SUPER_INTERFACES = "super_interfaces"
    private const val EXTENDS_INTERFACES = "extends_interfaces"
    private const val SUPERCLASS = "superclass"
    private const val THROWS = "throws"

    // Field names and type helpers
    private const val GENERIC_TYPE = "generic_type"
    private const val TYPE_FIELD = "type"
    private const val NAME_FIELD = "name"
    private const val OBJECT_FIELD = "object"
    private const val PARAMETERS_FIELD = "parameters"

    private val ALL_NODE_TYPES = setOf(
        ANNOTATION, MARKER_ANNOTATION,
        FIELD_DECLARATION, LOCAL_VARIABLE_DECLARATION,
        OBJECT_CREATION_EXPRESSION,
        METHOD_INVOCATION, FIELD_ACCESS,
        SUPER_INTERFACES, EXTENDS_INTERFACES, SUPERCLASS,
        THROWS,
        METHOD_DECLARATION, CONSTRUCTOR_DECLARATION
    )

    fun extract(declaration: TSNode, sourceCode: String): Set<UsedType> {
        val buckets = TreeTraversal.findAllDescendantsGroupedByType(declaration, ALL_NODE_TYPES)

        val fieldTypes = buckets[FIELD_DECLARATION].orEmpty().mapNotNull {
            extractType(it.getChildByFieldName(TYPE_FIELD), sourceCode)
        }
        val variableTypes = buckets[LOCAL_VARIABLE_DECLARATION].orEmpty().mapNotNull {
            extractType(it.getChildByFieldName(TYPE_FIELD), sourceCode)
        }
        val annotationTypes = (buckets[ANNOTATION].orEmpty() + buckets[MARKER_ANNOTATION].orEmpty()).mapNotNull {
            extractType(it.getChildByFieldName(NAME_FIELD), sourceCode)
        }
        val constructorCallTypes = buckets[OBJECT_CREATION_EXPRESSION].orEmpty().mapNotNull {
            extractType(it.getChildByFieldName(TYPE_FIELD), sourceCode)
        }
        val methodInvocationTypes = extractMethodInvocationAndFieldAccessTypes(buckets, sourceCode)
        val inheritanceTypes = extractInheritanceTypes(buckets, sourceCode)
        val thrownTypes = extractThrownTypes(buckets, sourceCode)
        val methodTypes = extractMethodAndConstructorTypes(buckets, sourceCode)

        return (
            inheritanceTypes + variableTypes + annotationTypes + methodInvocationTypes +
                constructorCallTypes + thrownTypes + fieldTypes + methodTypes
        ).toSet()
    }

    private fun extractMethodInvocationAndFieldAccessTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        (buckets[METHOD_INVOCATION].orEmpty() + buckets[FIELD_ACCESS].orEmpty())
            .mapNotNull { capturedNode ->
                val objectNode = capturedNode.getChildByFieldName(OBJECT_FIELD)
                extractType(objectNode, sourceCode)
            }
            // Heuristic: uppercase-first names are likely type references (e.g., SomeClass.method()),
            // lowercase-first are likely variables (e.g., myVar.method()). This misclassifies
            // uppercase variables like LOGGER as types, but matches DC's existing behavior.
            .filter { it.isUppercase() }

    private fun extractInheritanceTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val implementsAndExtends = (buckets[SUPER_INTERFACES].orEmpty() + buckets[EXTENDS_INTERFACES].orEmpty())
            .flatMap { typeListNode ->
                val namedChild = typeListNode.getNamedChild(0)
                if (namedChild.isNull) return@flatMap emptyList()
                namedChild.namedChildren().mapNotNull { child -> extractType(child, sourceCode) }.toList()
            }
        val superClasses = buckets[SUPERCLASS].orEmpty().mapNotNull { superclassNode ->
            val namedChild = superclassNode.getNamedChild(0)
            if (namedChild.isNull) return@mapNotNull null
            extractType(namedChild, sourceCode)
        }
        return implementsAndExtends + superClasses
    }

    private fun extractThrownTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> =
        buckets[THROWS].orEmpty().flatMap { throwsNode ->
            throwsNode
                .namedChildren()
                .mapNotNull { extractType(it, sourceCode) }
                .toList()
        }

    private fun extractMethodAndConstructorTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val constructorParams = buckets[CONSTRUCTOR_DECLARATION]
            .orEmpty()
            .flatMap { constructor ->
                val parameters = constructor.getChildByFieldName(PARAMETERS_FIELD)
                    ?: return@flatMap emptyList()
                extractParameterTypes(parameters, sourceCode)
            }

        val methodTypes = buckets[METHOD_DECLARATION].orEmpty().flatMap { method ->
            val parameters = method.getChildByFieldName(PARAMETERS_FIELD)
                ?: return@flatMap emptyList<UsedType>()
            val paramTypes = extractParameterTypes(parameters, sourceCode)
            val returnType = extractType(method.getChildByFieldName(TYPE_FIELD), sourceCode)
            paramTypes + listOfNotNull(returnType)
        }
        return constructorParams + methodTypes
    }

    private fun extractParameterTypes(parametersNode: TSNode, sourceCode: String): List<UsedType> = parametersNode
        .namedChildren()
        .mapNotNull {
            val parameterType = it.getChildByFieldName(TYPE_FIELD)
            extractType(parameterType, sourceCode)
        }.toList()

    private fun extractType(typeNode: TSNode, sourceCode: String): UsedType? {
        if (typeNode.isNull) return null
        if (typeNode.type == GENERIC_TYPE) {
            val typeIdentifier = typeNode.getNamedChild(0)
            val typeArguments = typeNode.getNamedChild(1)
            val genericTypes = typeArguments.namedChildren().mapNotNull { extractType(it, sourceCode) }.toList()
            return UsedType(
                name = TreeTraversal.getNodeText(typeIdentifier, sourceCode).trim(),
                genericTypes = genericTypes
            )
        }
        return UsedType(name = TreeTraversal.getNodeText(typeNode, sourceCode).trim())
    }
}
