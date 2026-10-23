package de.maibornwolff.treesitter.excavationsite.languages.vue.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DEFAULT_EXPORT
import de.maibornwolff.treesitter.excavationsite.shared.domain.EmbeddedSource
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * Every script block of a component that is not empty; a component may pair a plain `<script>` with a
 * `<script setup>`. A plain `<script>` belongs to the file, as the module's top level; a `<script setup>` belongs to
 * the component, [DEFAULT_EXPORT], as the compiler moves it into the component's `setup()`. The language is TypeScript or TSX for `lang="ts"` and `lang="tsx"`, otherwise JavaScript, also
 * for an unquoted `lang=ts`.
 */
internal object ScriptBlockExtractor {
    private const val SCRIPT_ELEMENT = "script_element"
    private const val START_TAG = "start_tag"
    private const val ATTRIBUTE = "attribute"
    private const val ATTRIBUTE_NAME = "attribute_name"
    private const val QUOTED_ATTRIBUTE_VALUE = "quoted_attribute_value"
    private const val ATTRIBUTE_VALUE = "attribute_value"
    private const val RAW_TEXT = "raw_text"
    private const val LANGUAGE_ATTRIBUTE = "lang"
    private const val SETUP_ATTRIBUTE = "setup"
    private const val TYPESCRIPT = "ts"
    private const val TSX = "tsx"

    fun extract(rootNode: SyntaxNode): List<EmbeddedSource> = TreeTraversal
        .findAllDescendantsOfType(rootNode, SCRIPT_ELEMENT)
        .map { script -> EmbeddedSource(content = contentOf(script), language = languageOf(script), owner = ownerOf(script)) }
        .filter { it.content.isNotEmpty() }

    private fun contentOf(script: SyntaxNode): String = TreeTraversal.findFirstChildTextByType(script, RAW_TEXT).orEmpty().trim()

    private fun ownerOf(script: SyntaxNode): String? = if (attributeOf(script, SETUP_ATTRIBUTE) != null) DEFAULT_EXPORT else null

    private fun languageOf(script: SyntaxNode): Language {
        val languageAttribute = attributeOf(script, LANGUAGE_ATTRIBUTE)
        val quotedValue = languageAttribute?.children()?.firstOrNull { it.type == QUOTED_ATTRIBUTE_VALUE }
        return when (quotedValue?.let { TreeTraversal.findFirstChildTextByType(it, ATTRIBUTE_VALUE) }?.lowercase()) {
            TYPESCRIPT -> Language.TYPESCRIPT
            TSX -> Language.TSX
            else -> Language.JAVASCRIPT
        }
    }

    private fun attributeOf(script: SyntaxNode, name: String): SyntaxNode? {
        val startTag = script.children().firstOrNull { it.type == START_TAG } ?: return null
        return startTag.children().lastOrNull { attribute ->
            attribute.type == ATTRIBUTE && TreeTraversal.findFirstChildTextByType(attribute, ATTRIBUTE_NAME) == name
        }
    }
}
