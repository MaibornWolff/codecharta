package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.CALL_EXPRESSION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.PROPERTY_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

internal object UsedTypeExtractor {
    private const val TYPE_ANNOTATION = "type_annotation"
    private const val NEW_EXPRESSION = "new_expression"
    private const val MEMBER_EXPRESSION = "member_expression"
    private const val EXTENDS_CLAUSE = "extends_clause"
    private const val EXTENDS_TYPE_CLAUSE = "extends_type_clause"
    private const val IMPLEMENTS_CLAUSE = "implements_clause"
    private const val CONSTRAINT = "constraint"
    private const val TYPE_ALIAS_DECLARATION = "type_alias_declaration"
    private const val JSX_OPENING_ELEMENT = "jsx_opening_element"
    private const val JSX_SELF_CLOSING_ELEMENT = "jsx_self_closing_element"
    private const val JSX_MEMBER_EXPRESSION = "jsx_member_expression"
    private const val JSX_IDENTIFIER = "jsx_identifier"
    private const val AS_EXPRESSION = "as_expression"
    private const val SATISFIES_EXPRESSION = "satisfies_expression"
    private const val TYPE_ARGUMENTS = "type_arguments"

    private val ALL_NODE_TYPES = setOf(
        TYPE_ANNOTATION,
        NEW_EXPRESSION,
        MEMBER_EXPRESSION,
        CALL_EXPRESSION,
        EXTENDS_CLAUSE,
        EXTENDS_TYPE_CLAUSE,
        IMPLEMENTS_CLAUSE,
        CONSTRAINT,
        IDENTIFIER,
        JSX_OPENING_ELEMENT,
        JSX_SELF_CLOSING_ELEMENT,
        AS_EXPRESSION,
        SATISFIES_EXPRESSION,
        TYPE_ARGUMENTS
    )

    fun extract(declaration: SyntaxNode, aliasMap: Map<String, String>, localDeclarationNames: Set<String>): Set<UsedType> {
        val buckets = TreeTraversal.findAllDescendantsGroupedByType(declaration, ALL_NODE_TYPES)

        val typeIdentifiers = collectTypeIdentifiersFromNodes(buckets[TYPE_ANNOTATION].orEmpty())
        val constructorCalls = extractConstructorCalls(buckets, aliasMap)
        val memberAccesses = extractMemberAccesses(buckets, aliasMap)
        val methodCalls = extractMethodCalls(buckets)
        val extensions = extractExtensions(buckets)
        val relevantIdentifiers = extractRelevantIdentifiers(buckets, aliasMap, localDeclarationNames)

        val constraintTypes = collectTypeIdentifiersFromNodes(buckets[CONSTRAINT].orEmpty())
        val typeAssertions = collectTypeIdentifiersFromNodes(
            buckets[AS_EXPRESSION].orEmpty() + buckets[SATISFIES_EXPRESSION].orEmpty()
        )
        val genericTypeArgs = collectTypeIdentifiersFromNodes(buckets[TYPE_ARGUMENTS].orEmpty())
        val typeAliasRhsTypes = if (declaration.type ==
            TYPE_ALIAS_DECLARATION
        ) {
            extractTypeAliasRhsTypes(declaration)
        } else {
            emptyList()
        }
        val jsxComponents = extractJsxComponents(buckets)

        return listOf(
            typeIdentifiers, constructorCalls, memberAccesses, methodCalls, extensions,
            relevantIdentifiers, constraintTypes, typeAliasRhsTypes, jsxComponents, typeAssertions, genericTypeArgs
        ).flatten()
            .map { usedType -> aliasMap[usedType.name]?.let { UsedType(name = it) } ?: usedType }
            .toSet()
    }

    private fun collectTypeIdentifiersFromNodes(nodes: List<SyntaxNode>): List<UsedType> = nodes
        .flatMap { TreeTraversal.findAllDescendantsOfType(it, TYPE_IDENTIFIER) }
        .map { UsedType(name = it.text.trim()) }

    private fun extractConstructorCalls(buckets: Map<String, List<SyntaxNode>>, aliasMap: Map<String, String>): List<UsedType> =
        buckets[NEW_EXPRESSION].orEmpty().mapNotNull { node ->
            val constructor = node.children().firstOrNull { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
            if (constructor != null) {
                val name = constructor.text.trim()
                if (name.firstOrNull()?.isUpperCase() != true) return@mapNotNull null
                return@mapNotNull UsedType(name = name)
            }
            // namespace alias constructor: new ns.Class()
            extractNsAliasMember(node.children().firstOrNull { it.type == MEMBER_EXPRESSION }, aliasMap)
        }

    private fun extractMemberAccesses(buckets: Map<String, List<SyntaxNode>>, aliasMap: Map<String, String>): List<UsedType> =
        buckets[MEMBER_EXPRESSION].orEmpty().mapNotNull { node ->
            val root = findLeftmostIdentifier(node) ?: return@mapNotNull null
            val name = root.text.trim()
            if (name.firstOrNull()?.isUpperCase() == true) return@mapNotNull UsedType(name = name)
            // namespace alias member access: ns.Class where ns is the direct object identifier
            extractNsAliasMember(node, aliasMap)
        }

    private fun extractNsAliasMember(memberExpr: SyntaxNode?, aliasMap: Map<String, String>): UsedType? {
        memberExpr ?: return null
        val directId = memberExpr.children().firstOrNull { it.type == IDENTIFIER } ?: return null
        val objName = directId.text.trim()
        if (objName !in aliasMap) return null
        val prop = memberExpr.children().firstOrNull { it.type == PROPERTY_IDENTIFIER } ?: return null
        val propName = prop.text.trim()
        if (propName.firstOrNull()?.isUpperCase() != true) return null
        return UsedType(name = propName)
    }

    private fun extractMethodCalls(buckets: Map<String, List<SyntaxNode>>): List<UsedType> =
        buckets[CALL_EXPRESSION].orEmpty().mapNotNull { callNode ->
            val memberExpr = callNode.children().firstOrNull { it.type == MEMBER_EXPRESSION }
                ?: return@mapNotNull null
            val prop = memberExpr.children().firstOrNull { it.type == PROPERTY_IDENTIFIER }
                ?: return@mapNotNull null
            val name = prop.text.trim()
            if (name.firstOrNull()?.isUpperCase() != true) return@mapNotNull null
            UsedType(name = name)
        }

    private fun extractExtensions(buckets: Map<String, List<SyntaxNode>>): List<UsedType> {
        val clauseNodes = buckets[EXTENDS_CLAUSE].orEmpty() + buckets[EXTENDS_TYPE_CLAUSE].orEmpty() + buckets[IMPLEMENTS_CLAUSE].orEmpty()
        return clauseNodes.flatMap { clauseNode ->
            TreeTraversal
                .findAllDescendantsOfType(clauseNode, TYPE_IDENTIFIER, IDENTIFIER)
                .map { UsedType(name = it.text.trim()) }
        }
    }

    // JS uses `identifier` nodes for class names (unlike TS which uses `type_identifier`),
    // so PascalCase class names are captured here via the uppercase check.
    private fun extractRelevantIdentifiers(
        buckets: Map<String, List<SyntaxNode>>,
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<UsedType> = buckets[IDENTIFIER].orEmpty().mapNotNull { node ->
        val name = node.text.trim()
        if (name.firstOrNull()?.isUpperCase() != true && name !in aliasMap && name !in localDeclarationNames) return@mapNotNull null
        UsedType(name = name)
    }

    private fun extractJsxComponents(buckets: Map<String, List<SyntaxNode>>): List<UsedType> {
        val jsxNodes = buckets[JSX_OPENING_ELEMENT].orEmpty() + buckets[JSX_SELF_CLOSING_ELEMENT].orEmpty()
        return jsxNodes.mapNotNull { node ->
            val tagNode = node.children().firstOrNull {
                it.type == JSX_IDENTIFIER ||
                    it.type == IDENTIFIER ||
                    it.type == JSX_MEMBER_EXPRESSION ||
                    it.type == MEMBER_EXPRESSION
            } ?: return@mapNotNull null
            val name = when (tagNode.type) {
                JSX_MEMBER_EXPRESSION, MEMBER_EXPRESSION -> {
                    val root = findLeftmostIdentifier(tagNode) ?: return@mapNotNull null
                    root.text.trim()
                }
                else -> tagNode.text.trim()
            }
            if (name.firstOrNull()?.isUpperCase() != true) return@mapNotNull null
            UsedType(name = name)
        }
    }

    private fun extractTypeAliasRhsTypes(declaration: SyntaxNode): List<UsedType> {
        val children = declaration.children().toList()
        val nameNodeIndex = children.indexOfFirst { it.type == TYPE_IDENTIFIER }
        return children
            .filterIndexed { index, _ -> index != nameNodeIndex }
            .flatMap { TreeTraversal.findAllDescendantsOfType(it, TYPE_IDENTIFIER) }
            .map { UsedType(name = it.text.trim()) }
    }

    private fun findLeftmostIdentifier(node: SyntaxNode): SyntaxNode? {
        var current = node
        while (current.type == JSX_MEMBER_EXPRESSION || current.type == MEMBER_EXPRESSION) {
            current = current.children().firstOrNull() ?: return null
        }
        return if (current.type == JSX_IDENTIFIER || current.type == IDENTIFIER) current else null
    }
}
