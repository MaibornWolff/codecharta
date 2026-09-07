package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val NAME_FIELD = "name"
private const val HEADER_FIELD = "header"
private const val RHS_FIELD = "rhs"
private const val ENTITY_FIELD = "entity"
private const val GENERIC_DOT = "genericDot"
private const val GENERIC_TPL = "genericTpl"

/**
 * Extracts the "leading" identifier from a name field — the first simple name segment.
 *
 * Used by declarations where a qualified name's leading segment is the declaration's own
 * identifier (e.g., `TFoo<T>` → `TFoo`, a bare `identifier` → itself).
 */
private fun leadingNameIdentifier(nameNode: TSNode, sourceCode: String): String? {
    if (nameNode.isNull) return null
    return when (nameNode.type) {
        IDENTIFIER -> TreeTraversal.getNodeText(nameNode, sourceCode)
        GENERIC_TPL -> {
            val entity = nameNode.getChildByFieldName(ENTITY_FIELD)
            if (entity.isNull) null else leadingNameIdentifier(entity, sourceCode)
        }
        GENERIC_DOT -> {
            // For a qualified declaration name like `Outer.Inner`, the leading segment is
            // the lhs; typically not seen on top-level declTypes, but handle defensively.
            val lhs = nameNode.getChildByFieldName("lhs")
            if (lhs.isNull) null else leadingNameIdentifier(lhs, sourceCode)
        }
        else ->
            TreeTraversal
                .findAllDescendantsOfType(nameNode, IDENTIFIER)
                .firstOrNull()
                ?.let { TreeTraversal.getNodeText(it, sourceCode) }
    }
}

/**
 * Extracts the "trailing" identifier from a name field — the last simple name segment.
 *
 * Used for method names, where a qualified name like `TFoo.Create` carries the method's
 * own identifier (`Create`) as the rhs of a `genericDot`.
 */
private fun trailingNameIdentifier(nameNode: TSNode, sourceCode: String): String? {
    if (nameNode.isNull) return null
    return when (nameNode.type) {
        IDENTIFIER -> TreeTraversal.getNodeText(nameNode, sourceCode)
        GENERIC_TPL -> {
            val entity = nameNode.getChildByFieldName(ENTITY_FIELD)
            if (entity.isNull) null else trailingNameIdentifier(entity, sourceCode)
        }
        GENERIC_DOT -> {
            val rhs = nameNode.getChildByFieldName(RHS_FIELD)
            if (rhs.isNull) null else trailingNameIdentifier(rhs, sourceCode)
        }
        else -> null
    }
}

/**
 * Extracts the type name from a `declType` node (class, interface, record, enum, helper).
 *
 * Top-level type declarations have simple `identifier` or `genericTpl` names; we return
 * the leading identifier.
 */
internal fun extractDelphiDeclTypeName(node: TSNode, sourceCode: String): String? {
    val nameNode = node.getChildByFieldName(NAME_FIELD)
    return leadingNameIdentifier(nameNode, sourceCode)
}

/**
 * Extracts the name from a `declProc` node (procedure / function / method declaration).
 *
 * `declProc` names can be either bare identifiers (interface-section method declarations:
 * `procedure Foo;`) or qualified `genericDot` (`TFoo.Method` in some contexts). For
 * extraction purposes we want the method's own identifier — the trailing segment.
 */
internal fun extractDelphiDeclProcName(node: TSNode, sourceCode: String): String? {
    val nameNode = node.getChildByFieldName(NAME_FIELD)
    return trailingNameIdentifier(nameNode, sourceCode)
}

/**
 * Extracts the name from a `defProc` node (procedure / function / method implementation).
 *
 * The name lives at `defProc.header.name`. For method implementations the name is typically
 * `TFoo.Create` — we want `Create` (the method's own name), not `TFoo` (the class prefix).
 */
internal fun extractDelphiDefProcName(node: TSNode, sourceCode: String): String? {
    val header = node.getChildByFieldName(HEADER_FIELD)
    if (header.isNull) return null
    val nameNode = header.getChildByFieldName(NAME_FIELD)
    return trailingNameIdentifier(nameNode, sourceCode)
}

/**
 * Extracts all identifiers declared by a node (declVar / declField / declArg).
 *
 * Pascal lets multiple names share a declaration: `var X, Y: Integer;`. All the
 * name identifiers appear as direct children preceding the `:` separator; the
 * type is wrapped in a `type` node and so is NOT a direct identifier child, so
 * simply filtering direct identifier children is safe here.
 *
 * For safety against other direct identifier children (e.g., default-value
 * expressions whose first identifier could leak in), we stop collecting once
 * we see a non-identifier / non-comma token — identifier lists are always
 * comma-separated at the front.
 */
internal fun extractDelphiMultipleNames(node: TSNode, sourceCode: String): List<String> {
    val names = mutableListOf<String>()
    for (child in node.children()) {
        when (child.type) {
            IDENTIFIER -> names += TreeTraversal.getNodeText(child, sourceCode)
            "," -> Unit
            else -> if (names.isNotEmpty()) return names
        }
    }
    return names
}
