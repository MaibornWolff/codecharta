package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularSelector

/**
 * Reads a `@Component` or `@Directive` selector into its alternatives with the grammar of Angular's `CssSelector.parse`:
 * an element, `.class`, `#id` (the attribute `id`), `[attribute]`, `[attribute=value]` and `:not(…)` parts, the
 * alternatives separated by commas. Anything else, such as a space between parts, is skipped as Angular skips it.
 */
internal object AngularSelectorParser {
    private val SELECTOR_PART = Regex("""(:not\()|(([.#]?)[-\w]+)|(?:\[([-.\w*\\$]+)(?:=(["']?)([^\]"']*)\5)?])|(\))|(\s*,\s*)""")
    private const val NOT_START = 1
    private const val NAME = 2
    private const val NAME_PREFIX = 3
    private const val ATTRIBUTE = 4
    private const val ATTRIBUTE_VALUE = 6
    private const val NOT_END = 7
    private const val SEPARATOR = 8
    private const val CLASS_PREFIX = "."
    private const val ID_PREFIX = "#"
    private const val ID_ATTRIBUTE = "id"
    private const val ESCAPE = "\\"

    fun parse(selector: String): List<AngularSelector> {
        val alternatives = mutableListOf<SelectorBuilder>()
        var alternative = SelectorBuilder().also { alternatives += it }
        var current = alternative
        SELECTOR_PART.findAll(selector).forEach { match ->
            val groups = match.groups
            when {
                groups[NOT_START] != null -> current = SelectorBuilder().also { alternative.notSelectors += it }
                groups[NAME] != null -> addName(current, groups[NAME_PREFIX]?.value.orEmpty(), groups[NAME]!!.value)
                groups[ATTRIBUTE] != null -> current.attributes[unescape(groups[ATTRIBUTE]!!.value)] =
                    groups[ATTRIBUTE_VALUE]?.value.orEmpty().lowercase()
                groups[NOT_END] != null -> current = alternative
                groups[SEPARATOR] != null -> {
                    alternative = SelectorBuilder().also { alternatives += it }
                    current = alternative
                }
            }
        }
        return alternatives.map { it.build() }
    }

    private fun addName(builder: SelectorBuilder, prefix: String, name: String) {
        when (prefix) {
            CLASS_PREFIX -> builder.classNames += name.drop(1).lowercase()
            ID_PREFIX -> builder.attributes[ID_ATTRIBUTE] = name.drop(1).lowercase()
            else -> builder.element = name.lowercase()
        }
    }

    private fun unescape(attribute: String): String = attribute.replace(ESCAPE, "")

    private class SelectorBuilder {
        var element: String? = null
        val attributes = linkedMapOf<String, String>()
        val classNames = linkedSetOf<String>()
        val notSelectors = mutableListOf<SelectorBuilder>()

        fun build(): AngularSelector = AngularSelector(element, attributes.toMap(), classNames.toSet(), notSelectors.map { it.build() })
    }
}
