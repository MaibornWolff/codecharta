package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.namedChildren
import org.treesitter.TSNode

/**
 * Extracts the types referenced in a declaration's **signature** — never its body.
 *
 * Traversal prunes at `block`, so function/method bodies (and items nested inside them)
 * contribute nothing: only fields, variant payloads, parameters, return types, generic
 * and where-clause bounds, supertraits, associated types/consts, and type-alias RHS are
 * collected. The concatenation order below is documented in the dependencies README and
 * propagates (via `LinkedHashSet`) into DependaCharta's cycle tie-breaking.
 */
internal object UsedTypeExtractor {
    private const val BLOCK = "block"
    private const val TRAIT_ITEM = "trait_item"
    private const val TYPE_ITEM = "type_item"
    private const val CONST_ITEM = "const_item"
    private const val STATIC_ITEM = "static_item"
    private const val FUNCTION_ITEM = "function_item"
    private const val FUNCTION_SIGNATURE_ITEM = "function_signature_item"
    private const val FIELD_DECLARATION = "field_declaration"
    private const val ORDERED_FIELD_DECLARATION_LIST = "ordered_field_declaration_list"
    private const val PARAMETER = "parameter"
    private const val TYPE_PARAMETER = "type_parameter"
    private const val WHERE_PREDICATE = "where_predicate"
    private const val ASSOCIATED_TYPE = "associated_type"
    private const val TRAIT_BOUNDS = "trait_bounds"

    private val FUNCTION_TYPES = setOf(FUNCTION_ITEM, FUNCTION_SIGNATURE_ITEM)

    fun extract(declaration: TSNode, sourceCode: String): Set<UsedType> {
        val supertraits = extractSupertraits(declaration, sourceCode)
        val fields = extractFieldTypes(declaration, sourceCode)
        val parameters = extractParameterTypes(declaration, sourceCode)
        val returnTypes = extractReturnTypes(declaration, sourceCode)
        val genericBounds = extractBoundTypes(declaration, TYPE_PARAMETER, sourceCode)
        val whereBounds = extractBoundTypes(declaration, WHERE_PREDICATE, sourceCode)
        val associatedBounds = extractBoundTypes(declaration, ASSOCIATED_TYPE, sourceCode)
        val typeAliasRhs = extractTypeAliasRhs(declaration, sourceCode)
        val constStaticTypes = extractConstStaticTypes(declaration, sourceCode)

        return (
            supertraits + fields + parameters + returnTypes +
                genericBounds + whereBounds + associatedBounds + typeAliasRhs + constStaticTypes
        ).toSet()
    }

    private fun extractSupertraits(declaration: TSNode, sourceCode: String): List<UsedType> {
        if (declaration.type != TRAIT_ITEM) return emptyList()
        return declaration
            .children()
            .filter { it.type == TRAIT_BOUNDS }
            .flatMap { it.namedChildren() }
            .flatMap { RustTypeHelper.extractTypes(it, sourceCode) }
            .toList()
    }

    private fun extractFieldTypes(declaration: TSNode, sourceCode: String): List<UsedType> {
        val namedFields = signatureDescendants(declaration, FIELD_DECLARATION)
        val tupleFields = signatureDescendants(declaration, ORDERED_FIELD_DECLARATION_LIST)
        return (namedFields + tupleFields)
            .flatMap { typeNodesOf(it).flatMap { typeNode -> RustTypeHelper.extractTypes(typeNode, sourceCode) } }
    }

    private fun extractParameterTypes(declaration: TSNode, sourceCode: String): List<UsedType> =
        signatureDescendants(declaration, PARAMETER)
            .flatMap { typeNodesOf(it).take(1).flatMap { typeNode -> RustTypeHelper.extractTypes(typeNode, sourceCode) } }

    private fun extractReturnTypes(declaration: TSNode, sourceCode: String): List<UsedType> = signatureFunctions(declaration)
        .mapNotNull { function -> function.children().firstOrNull { RustTypeHelper.isTypeNode(it) } }
        .flatMap { RustTypeHelper.extractTypes(it, sourceCode) }

    private fun extractBoundTypes(declaration: TSNode, parentType: String, sourceCode: String): List<UsedType> =
        signatureDescendants(declaration, parentType)
            .flatMap { parent -> parent.children().filter { it.type == TRAIT_BOUNDS } }
            .flatMap { it.namedChildren() }
            .flatMap { RustTypeHelper.extractTypes(it, sourceCode) }

    private fun extractTypeAliasRhs(declaration: TSNode, sourceCode: String): List<UsedType> {
        val typeItems = selfAndSignatureDescendants(declaration, TYPE_ITEM)
        return typeItems.flatMap { typeItem ->
            typeNodesOf(typeItem)
                .drop(1) // the first type node is the alias's own name
                .flatMap { RustTypeHelper.extractTypes(it, sourceCode) }
        }
    }

    private fun extractConstStaticTypes(declaration: TSNode, sourceCode: String): List<UsedType> {
        val items = selfAndSignatureDescendants(declaration, CONST_ITEM) +
            selfAndSignatureDescendants(declaration, STATIC_ITEM)
        return items.flatMap { item ->
            typeNodesOf(item).take(1).flatMap { RustTypeHelper.extractTypes(it, sourceCode) }
        }
    }

    private fun typeNodesOf(node: TSNode): List<TSNode> = node.namedChildren().filter { RustTypeHelper.isTypeNode(it) }.toList()

    private fun signatureFunctions(declaration: TSNode): List<TSNode> {
        val self = if (declaration.type in FUNCTION_TYPES) listOf(declaration) else emptyList()
        return self + FUNCTION_TYPES.flatMap { signatureDescendants(declaration, it) }
    }

    private fun selfAndSignatureDescendants(declaration: TSNode, type: String): List<TSNode> {
        val self = if (declaration.type == type) listOf(declaration) else emptyList()
        return self + signatureDescendants(declaration, type)
    }

    /**
     * Descendants of [type] reachable without entering a `block` (function/method body),
     * so only signature-level nodes are returned.
     */
    private fun signatureDescendants(node: TSNode, type: String): List<TSNode> {
        val result = mutableListOf<TSNode>()
        collectSignatureDescendants(node, type, result)
        return result
    }

    private fun collectSignatureDescendants(node: TSNode, type: String, result: MutableList<TSNode>) {
        for (child in node.children()) {
            if (child.isNull || child.type == BLOCK) continue
            if (child.type == type) result.add(child)
            collectSignatureDescendants(child, type, result)
        }
    }
}
