package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.CppTypeHelper
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

internal object ClassScopeExtractor {
    private const val FRIEND_DECLARATION = "friend_declaration"
    private const val USING_DECLARATION = "using_declaration"
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"
    private const val IDENTIFIER = "identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val CLASS_SPECIFIER = "class_specifier"
    private const val STRUCT_SPECIFIER = "struct_specifier"
    private const val UNION_SPECIFIER = "union_specifier"
    private const val FUNCTION_DEFINITION = "function_definition"
    private const val COMPOUND_STATEMENT = "compound_statement"

    private val CLASS_BODY_TYPES = setOf(CLASS_SPECIFIER, STRUCT_SPECIFIER, UNION_SPECIFIER)
    private val SCOPE_BOUNDARY_TYPES = CLASS_BODY_TYPES + setOf(FUNCTION_DEFINITION, COMPOUND_STATEMENT)

    val nodeTypes: Set<String> = setOf(FRIEND_DECLARATION, USING_DECLARATION)

    fun extractFriendAndUsingTypes(buckets: Map<String, List<TSNode>>, sourceCode: String): List<UsedType> {
        val friendTypes = buckets[FRIEND_DECLARATION].orEmpty().flatMap { friend ->
            friend
                .namedChildren()
                .mapNotNull { child ->
                    if (CppTypeHelper.isTypeNode(child)) CppTypeHelper.extractType(child, sourceCode) else null
                }.toList()
        }
        val inClassUsingTypes = buckets[USING_DECLARATION]
            .orEmpty()
            .filter { isInsideClassBody(it) }
            .mapNotNull { usingDecl ->
                val qualified = usingDecl.namedChildren().firstOrNull { it.type == QUALIFIED_IDENTIFIER }
                if (qualified != null) {
                    CppTypeHelper.extractSecondToLastSegment(qualified, sourceCode)
                } else {
                    val plain = usingDecl.namedChildren().firstOrNull { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
                    plain?.let {
                        val text = TreeTraversal.getNodeText(it, sourceCode).trim()
                        if (text.isEmpty()) null else UsedType(name = text)
                    }
                }
            }
        return friendTypes + inClassUsingTypes
    }

    private fun isInsideClassBody(usingDecl: TSNode): Boolean {
        var current = usingDecl.parent
        while (!current.isNull) {
            if (current.type in SCOPE_BOUNDARY_TYPES) {
                return current.type in CLASS_BODY_TYPES
            }
            current = current.parent
        }
        return false
    }
}
