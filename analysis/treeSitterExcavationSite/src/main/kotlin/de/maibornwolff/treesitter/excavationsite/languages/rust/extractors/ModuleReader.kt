package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustExternCrate
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustImpl
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustItem
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustItemKind
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustModDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustModule
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustUse
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * Reads what a Rust source declares at module level, in the file and in its inline modules: `mod` lines, items with the
 * paths they write, `use` declarations, `impl` blocks and `extern crate`. Items inside a function body are part of the
 * function, see [PathCollector]; the body of a `macro_rules!` is read where it expands, so it writes no path.
 */
internal object ModuleReader {
    private const val ATTRIBUTE_ITEM = "attribute_item"
    private const val ATTRIBUTE = "attribute"
    private const val MOD_ITEM = "mod_item"
    private const val USE_DECLARATION = "use_declaration"
    private const val IMPL_ITEM = "impl_item"
    private const val EXTERN_CRATE_DECLARATION = "extern_crate_declaration"
    private const val FOREIGN_MOD_ITEM = "foreign_mod_item"
    private const val STRUCT_ITEM = "struct_item"
    private const val ENUM_ITEM = "enum_item"
    private const val ENUM_VARIANT = "enum_variant"
    private const val FIELD_DECLARATION_LIST = "field_declaration_list"
    private const val LINE_COMMENT = "line_comment"
    private const val BLOCK_COMMENT = "block_comment"
    private const val NAME_FIELD = "name"
    private const val BODY_FIELD = "body"
    private const val ALIAS_FIELD = "alias"
    private const val TYPE_FIELD = "type"
    private const val TRAIT_FIELD = "trait"

    private val KINDS = mapOf(
        "enum_item" to RustItemKind.ENUM,
        "union_item" to RustItemKind.UNION,
        "trait_item" to RustItemKind.TRAIT,
        "type_item" to RustItemKind.TYPE_ALIAS,
        "function_item" to RustItemKind.FUNCTION,
        "function_signature_item" to RustItemKind.FUNCTION,
        "const_item" to RustItemKind.CONST,
        "static_item" to RustItemKind.STATIC,
        "macro_definition" to RustItemKind.MACRO
    )

    private class Collected {
        val modDeclarations = mutableListOf<RustModDeclaration>()
        val items = mutableListOf<RustItem>()
        val uses = mutableListOf<RustUse>()
        val impls = mutableListOf<RustImpl>()
        val externCrates = mutableListOf<RustExternCrate>()
    }

    private data class Place(val inlinePath: List<String>, val isTest: Boolean)

    fun read(root: SyntaxNode): RustModule {
        val collected = Collected()
        readModule(root, Place(emptyList(), false), collected)
        return RustModule(collected.modDeclarations, collected.items, collected.uses, collected.impls, collected.externCrates)
    }

    private fun readModule(container: SyntaxNode, place: Place, out: Collected) {
        val attributeTexts = mutableListOf<String>()
        container.namedChildren().forEach { child ->
            when (child.type) {
                ATTRIBUTE_ITEM -> child.namedChildren().filter { it.type == ATTRIBUTE }.forEach { attributeTexts.add(it.text) }
                LINE_COMMENT, BLOCK_COMMENT -> Unit
                else -> {
                    readItem(child, ItemAttributes.of(attributeTexts), place, out)
                    attributeTexts.clear()
                }
            }
        }
    }

    private fun readItem(item: SyntaxNode, attributes: ItemAttributes, place: Place, out: Collected) {
        val itemPlace = place.copy(isTest = place.isTest || attributes.isTest)
        when (item.type) {
            MOD_ITEM -> readMod(item, attributes, itemPlace, out)
            USE_DECLARATION -> out.uses.addAll(usesOf(item, itemPlace))
            IMPL_ITEM -> out.impls.add(implOf(item, itemPlace))
            EXTERN_CRATE_DECLARATION -> externCrateOf(item, itemPlace)?.let { out.externCrates.add(it) }
            FOREIGN_MOD_ITEM -> item.getChildByFieldName(BODY_FIELD).orNull()?.let { readModule(it, itemPlace, out) }
            else -> itemOf(item, attributes, itemPlace)?.let { out.items.add(it) }
        }
    }

    private fun readMod(item: SyntaxNode, attributes: ItemAttributes, place: Place, out: Collected) {
        val name = item.getChildByFieldName(NAME_FIELD).orNull()?.text ?: return
        val body = item.getChildByFieldName(BODY_FIELD).orNull()
        out.modDeclarations.add(
            RustModDeclaration(
                name = name,
                inlinePath = place.inlinePath,
                visibility = ItemAttributes.visibilityOf(item),
                isInline = body != null,
                pathAttribute = attributes.pathAttribute,
                isTest = place.isTest,
                isMacroUse = attributes.isMacroUse,
                offset = item.startByte
            )
        )
        body?.let { readModule(it, Place(place.inlinePath + name, place.isTest), out) }
    }

    private fun itemOf(item: SyntaxNode, attributes: ItemAttributes, place: Place): RustItem? {
        val kind = kindOf(item) ?: return null
        val name = item.getChildByFieldName(NAME_FIELD).orNull()?.text ?: return null
        return RustItem(
            name = name,
            kind = kind,
            inlinePath = place.inlinePath,
            visibility = ItemAttributes.visibilityOf(item),
            paths = if (kind == RustItemKind.MACRO) emptyList() else PathCollector.pathsOf(item),
            variants = if (item.type == ENUM_ITEM) variantsOf(item) else emptyList(),
            isTest = place.isTest,
            isMacroExport = attributes.isMacroExport,
            offset = item.startByte
        )
    }

    private fun kindOf(item: SyntaxNode): RustItemKind? {
        if (item.type != STRUCT_ITEM) return KINDS[item.type]
        val body = item.getChildByFieldName(BODY_FIELD).orNull()
        return if (body?.type == FIELD_DECLARATION_LIST) RustItemKind.STRUCT else RustItemKind.TUPLE_STRUCT
    }

    private fun variantsOf(enum: SyntaxNode): List<String> = enum
        .getChildByFieldName(BODY_FIELD)
        .orNull()
        ?.namedChildren()
        ?.filter { it.type == ENUM_VARIANT }
        ?.mapNotNull { it.getChildByFieldName(NAME_FIELD).orNull()?.text }
        ?.toList()
        .orEmpty()

    private fun usesOf(declaration: SyntaxNode, place: Place): List<RustUse> {
        val visibility = ItemAttributes.visibilityOf(declaration)
        return UseTree.bindingsOf(declaration).map { binding ->
            RustUse(binding.path, binding.name, binding.isGlob, visibility, place.inlinePath, place.isTest, declaration.startByte)
        }
    }

    // `impl Trait for Type`: the trait is the type written before `for`
    private fun implOf(impl: SyntaxNode, place: Place): RustImpl {
        val selfType = impl.getChildByFieldName(TYPE_FIELD).orNull()
        val trait = impl.getChildByFieldName(TRAIT_FIELD).orNull()
        return RustImpl(
            selfType = TypePaths.basePathOf(selfType),
            trait = TypePaths.basePathOf(trait),
            inlinePath = place.inlinePath,
            paths = PathCollector.pathsOf(impl),
            isTest = place.isTest
        )
    }

    private fun externCrateOf(declaration: SyntaxNode, place: Place): RustExternCrate? {
        val name = declaration.getChildByFieldName(NAME_FIELD).orNull()?.text ?: return null
        val alias = declaration.getChildByFieldName(ALIAS_FIELD).orNull()?.text
        return RustExternCrate(name, alias ?: name, place.inlinePath)
    }
}
