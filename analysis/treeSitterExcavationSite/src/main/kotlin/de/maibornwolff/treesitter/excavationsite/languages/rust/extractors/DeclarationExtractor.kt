package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

/**
 * Extracts Rust item declarations with their signature used types.
 *
 * Rust is a Class-2 (multi-namespace) language: inline `mod a { mod b { … } }` blocks
 * nest arbitrarily, each its own namespace. Each declaration therefore carries its
 * in-file inline-`mod` chain as [Declaration.parentPath]; the file's crate-root module
 * path is filesystem-derived and added by DependaCharta.
 *
 * `mod` and `impl` blocks are not declarations themselves: `mod` contributes to its
 * members' `parentPath`, and `impl` blocks are folded onto their target type —
 * `impl Trait for Type` adds `Trait` to `Type`'s used types, and method signatures fold
 * their types onto `Type` (analogous to Go receiver aggregation).
 */
internal object DeclarationExtractor {
    private const val MOD_ITEM = "mod_item"
    private const val IMPL_ITEM = "impl_item"
    private const val TRAIT_ITEM = "trait_item"
    private const val BLOCK = "block"
    private const val FOR = "for"
    private const val IDENTIFIER = "identifier"
    private const val TYPE_IDENTIFIER = "type_identifier"
    private const val SOURCE_FILE = "source_file"

    private val TYPE_NAMED_ITEMS = setOf("struct_item", "union_item", "enum_item", "trait_item", "type_item")

    private val DECLARATION_TYPES = setOf(
        "struct_item", "union_item", "enum_item", "trait_item", "type_item",
        "function_item", "function_signature_item", "const_item", "static_item", "macro_definition"
    )

    private val NON_DECLARATION_CONTEXTS = setOf(IMPL_ITEM, TRAIT_ITEM, BLOCK)

    fun extract(rootNode: TSNode, sourceCode: String): List<Declaration> {
        val baseDeclarations = TreeTraversal
            .findAllDescendantsOfType(rootNode, *DECLARATION_TYPES.toTypedArray())
            .filter { isDeclarationContext(it) }
            .mapNotNull { toDeclaration(it, sourceCode) }

        val implContributions = collectImplContributions(rootNode, sourceCode)
        if (implContributions.isEmpty()) return baseDeclarations

        return baseDeclarations.map { declaration ->
            val extra = implContributions[DeclarationKey(declaration.name, declaration.parentPath)]
                ?: return@map declaration
            declaration.copy(usedTypes = (declaration.usedTypes + extra).toSet())
        }
    }

    private fun toDeclaration(node: TSNode, sourceCode: String): Declaration? {
        val name = extractName(node, sourceCode) ?: return null
        return Declaration(
            name = name,
            type = mapDeclarationType(node.type),
            usedTypes = UsedTypeExtractor.extract(node, sourceCode),
            parentPath = findModulePath(node, sourceCode)
        )
    }

    private fun collectImplContributions(rootNode: TSNode, sourceCode: String): Map<DeclarationKey, List<UsedType>> {
        val contributions = LinkedHashMap<DeclarationKey, MutableList<UsedType>>()
        TreeTraversal
            .findAllDescendantsOfType(rootNode, IMPL_ITEM)
            .filter { isDeclarationContext(it) }
            .forEach { impl ->
                val typeChildren = impl.children().filter { RustTypeHelper.isTypeNode(it) }.toList()
                val targetNode = typeChildren.lastOrNull() ?: return@forEach
                val targetName = RustTypeHelper.extractTypes(targetNode, sourceCode).firstOrNull()?.name ?: return@forEach

                val hasFor = impl.children().any { it.type == FOR }
                val traitNode = if (hasFor) typeChildren.firstOrNull() else null
                val traitTypes = traitNode?.let { RustTypeHelper.extractTypes(it, sourceCode) } ?: emptyList()
                val methodTypes = UsedTypeExtractor.extract(impl, sourceCode)

                val key = DeclarationKey(targetName, findModulePath(impl, sourceCode))
                contributions.getOrPut(key) { mutableListOf() }.addAll(traitTypes + methodTypes)
            }
        return contributions
    }

    private fun isDeclarationContext(node: TSNode): Boolean {
        var current = node.parent
        while (!current.isNull) {
            if (current.type in NON_DECLARATION_CONTEXTS) return false
            if (current.type == SOURCE_FILE) return true
            current = current.parent
        }
        return true
    }

    private fun findModulePath(node: TSNode, sourceCode: String): List<String> {
        val modules = mutableListOf<String>()
        var current = node.parent
        while (!current.isNull) {
            if (current.type == MOD_ITEM) {
                val name = TreeTraversal.findChildByType(current, IDENTIFIER, sourceCode)
                if (!name.isNullOrBlank()) modules.add(0, name)
            }
            current = current.parent
        }
        return modules
    }

    private fun extractName(node: TSNode, sourceCode: String): String? {
        val childType = if (node.type in TYPE_NAMED_ITEMS) TYPE_IDENTIFIER else IDENTIFIER
        return TreeTraversal.findChildByType(node, childType, sourceCode)?.takeIf { it.isNotBlank() }
    }

    private fun mapDeclarationType(nodeType: String): DeclarationType = when (nodeType) {
        "struct_item", "union_item", "type_item" -> DeclarationType.CLASS
        "enum_item" -> DeclarationType.ENUM
        "trait_item" -> DeclarationType.INTERFACE
        "function_item", "function_signature_item", "macro_definition" -> DeclarationType.FUNCTION
        "const_item", "static_item" -> DeclarationType.VARIABLE
        else -> DeclarationType.UNKNOWN
    }

    private data class DeclarationKey(val name: String, val parentPath: List<String>)
}
