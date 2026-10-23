package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

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
    private const val NESTED_TYPE_IDENTIFIER = "nested_type_identifier"
    private const val QUALIFIER_SEPARATOR = "."
    private val QUALIFIER_PARENTS = setOf(NESTED_TYPE_IDENTIFIER, "nested_identifier")
    private val JSX_TAG_ELEMENTS = setOf(JSX_OPENING_ELEMENT, JSX_SELF_CLOSING_ELEMENT, "jsx_closing_element")

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

    fun extract(declaration: SyntaxNode, names: ModuleNames): Set<UsedType> {
        val aliasMap = names.aliasMap
        val localDeclarationNames = names.localDeclarationNames
        val scopes = LocalScopes(declaration.startByte, declaration.endByte)
        val buckets = TreeTraversal
            .findAllDescendantsGroupedByType(declaration, ALL_NODE_TYPES)
            .mapValues { (_, nodes) -> nodes.filterNot { isHiddenName(it, scopes) } }

        val typeIdentifiers = collectTypeIdentifiersFromNodes(buckets[TYPE_ANNOTATION].orEmpty(), scopes, names.namespaceNames)
        val constructorCalls = extractConstructorCalls(buckets, names.namespaceNames, scopes)
        val memberAccesses = extractMemberAccesses(buckets, names.namespaceNames, scopes)
        val methodCalls = extractMethodCalls(buckets)
        val extensions = extractExtensions(buckets, scopes, names.namespaceNames)
        val relevantIdentifiers = extractRelevantIdentifiers(buckets, aliasMap, localDeclarationNames)

        val constraintTypes = collectTypeIdentifiersFromNodes(buckets[CONSTRAINT].orEmpty(), scopes, names.namespaceNames)
        val typeAssertions = collectTypeIdentifiersFromNodes(
            buckets[AS_EXPRESSION].orEmpty() + buckets[SATISFIES_EXPRESSION].orEmpty(),
            scopes,
            names.namespaceNames
        )
        val genericTypeArgs = collectTypeIdentifiersFromNodes(buckets[TYPE_ARGUMENTS].orEmpty(), scopes, names.namespaceNames)
        val typeAliasRhsTypes = if (declaration.type ==
            TYPE_ALIAS_DECLARATION
        ) {
            extractTypeAliasRhsTypes(declaration, scopes, names.namespaceNames)
        } else {
            emptyList()
        }
        val jsxComponents = extractJsxComponents(buckets, scopes)

        return listOf(
            typeIdentifiers, constructorCalls, memberAccesses, methodCalls, extensions,
            relevantIdentifiers, constraintTypes, typeAliasRhsTypes, jsxComponents, typeAssertions, genericTypeArgs
        ).flatten()
            .map { usedType -> aliasMap[usedType.name]?.let { UsedType(name = it) } ?: usedType }
            .toSet()
    }

    // A name a local binding hides is no use; a node that is no name, such as a call or an annotation, is checked by its names
    private fun isHiddenName(node: SyntaxNode, scopes: LocalScopes): Boolean =
        (node.type == IDENTIFIER || node.type == TYPE_IDENTIFIER) && scopes.hides(node)

    private fun collectTypeIdentifiersFromNodes(nodes: List<SyntaxNode>, scopes: LocalScopes, namespaceNames: Set<String>): List<UsedType> =
        nodes
            .flatMap { TreeTraversal.findAllDescendantsOfType(it, TYPE_IDENTIFIER) }
            .filterNot { scopes.hides(it) }
            .map { typeUseOf(it, namespaceNames) }

    // `Shapes.Circle` is one qualified name; through a namespace import `ns.Model` names the member `Model` of its module
    private fun typeUseOf(typeIdentifier: SyntaxNode, namespaceNames: Set<String>): UsedType {
        val qualified =
            typeIdentifier.parent.takeIf { it.type == NESTED_TYPE_IDENTIFIER } ?: return UsedType(name = typeIdentifier.text.trim())
        val segments = qualified.text.filterNot { it.isWhitespace() }.split(QUALIFIER_SEPARATOR)
        val name = if (segments.first() in namespaceNames) segments.drop(1) else segments
        return UsedType(name = name.joinToString(QUALIFIER_SEPARATOR))
    }

    private fun isQualifierOfAType(identifier: SyntaxNode): Boolean = identifier.parent.type in QUALIFIER_PARENTS

    private fun extractConstructorCalls(
        buckets: Map<String, List<SyntaxNode>>,
        namespaceNames: Set<String>,
        scopes: LocalScopes
    ): List<UsedType> = buckets[NEW_EXPRESSION].orEmpty().mapNotNull { node ->
        val constructor = node.children().firstOrNull { it.type == IDENTIFIER || it.type == TYPE_IDENTIFIER }
        if (constructor != null) {
            if (scopes.hides(constructor)) return@mapNotNull null
            val name = constructor.text.trim()
            if (name.firstOrNull()?.isUpperCase() != true) return@mapNotNull null
            return@mapNotNull UsedType(name = name)
        }
        // namespace alias constructor: new ns.Class()
        extractNsAliasMember(node.children().firstOrNull { it.type == MEMBER_EXPRESSION }, namespaceNames, scopes)
    }

    private fun extractMemberAccesses(
        buckets: Map<String, List<SyntaxNode>>,
        namespaceNames: Set<String>,
        scopes: LocalScopes
    ): List<UsedType> = buckets[MEMBER_EXPRESSION].orEmpty().mapNotNull { node ->
        val root = findLeftmostIdentifier(node)?.takeUnless { scopes.hides(it) } ?: return@mapNotNull null
        val name = root.text.trim()
        if (name.firstOrNull()?.isUpperCase() == true) return@mapNotNull UsedType(name = name)
        // namespace alias member access: ns.Class where ns is the direct object identifier
        extractNsAliasMember(node, namespaceNames, scopes)
    }

    // A member read through a namespace import, `ns.create`, is a use of what the module exports under that name
    private fun extractNsAliasMember(memberExpr: SyntaxNode?, namespaceNames: Set<String>, scopes: LocalScopes): UsedType? {
        memberExpr ?: return null
        val directId = memberExpr.children().firstOrNull { it.type == IDENTIFIER }?.takeUnless { scopes.hides(it) } ?: return null
        val objName = directId.text.trim()
        if (objName !in namespaceNames) return null
        val prop = memberExpr.children().firstOrNull { it.type == PROPERTY_IDENTIFIER } ?: return null
        return UsedType(name = prop.text.trim())
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

    private fun extractExtensions(
        buckets: Map<String, List<SyntaxNode>>,
        scopes: LocalScopes,
        namespaceNames: Set<String>
    ): List<UsedType> {
        val clauseNodes = buckets[EXTENDS_CLAUSE].orEmpty() + buckets[EXTENDS_TYPE_CLAUSE].orEmpty() + buckets[IMPLEMENTS_CLAUSE].orEmpty()
        return clauseNodes.flatMap { clauseNode ->
            TreeTraversal
                .findAllDescendantsOfType(clauseNode, TYPE_IDENTIFIER, IDENTIFIER)
                .filterNot { scopes.hides(it) || (it.type == IDENTIFIER && isQualifierOfAType(it)) }
                .map { if (it.type == TYPE_IDENTIFIER) typeUseOf(it, namespaceNames) else UsedType(name = it.text.trim()) }
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
        if (isPlatformElementTag(node) || isQualifierOfAType(node)) return@mapNotNull null
        if (name.firstOrNull()?.isUpperCase() != true && name !in aliasMap && name !in localDeclarationNames) return@mapNotNull null
        UsedType(name = name)
    }

    // A lower-case JSX tag names an element of the platform, whatever the module binds under that name
    private fun isPlatformElementTag(node: SyntaxNode): Boolean =
        node.parent.type in JSX_TAG_ELEMENTS && node.text.firstOrNull()?.isLowerCase() == true

    private fun extractJsxComponents(buckets: Map<String, List<SyntaxNode>>, scopes: LocalScopes): List<UsedType> {
        val jsxNodes = buckets[JSX_OPENING_ELEMENT].orEmpty() + buckets[JSX_SELF_CLOSING_ELEMENT].orEmpty()
        return jsxNodes.mapNotNull { node ->
            val tagNode = node.children().firstOrNull {
                it.type == JSX_IDENTIFIER ||
                    it.type == IDENTIFIER ||
                    it.type == JSX_MEMBER_EXPRESSION ||
                    it.type == MEMBER_EXPRESSION
            } ?: return@mapNotNull null
            val nameNode = when (tagNode.type) {
                JSX_MEMBER_EXPRESSION, MEMBER_EXPRESSION -> findLeftmostIdentifier(tagNode) ?: return@mapNotNull null
                else -> tagNode
            }
            if (scopes.hides(nameNode)) return@mapNotNull null
            val name = nameNode.text.trim()
            if (name.firstOrNull()?.isUpperCase() != true) return@mapNotNull null
            UsedType(name = name)
        }
    }

    private fun extractTypeAliasRhsTypes(declaration: SyntaxNode, scopes: LocalScopes, namespaceNames: Set<String>): List<UsedType> {
        val children = declaration.children().toList()
        val nameNodeIndex = children.indexOfFirst { it.type == TYPE_IDENTIFIER }
        return children
            .filterIndexed { index, _ -> index != nameNodeIndex }
            .flatMap { TreeTraversal.findAllDescendantsOfType(it, TYPE_IDENTIFIER) }
            .filterNot { scopes.hides(it) }
            .map { typeUseOf(it, namespaceNames) }
    }

    private fun findLeftmostIdentifier(node: SyntaxNode): SyntaxNode? {
        var current = node
        while (current.type == JSX_MEMBER_EXPRESSION || current.type == MEMBER_EXPRESSION) {
            current = current.children().firstOrNull() ?: return null
        }
        return if (current.type == JSX_IDENTIFIER || current.type == IDENTIFIER) current else null
    }
}
