package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * One alternative of a `@Component` or `@Directive` selector, as Angular's compiler reads it. Element names, attribute
 * values and class names are in lower case, as Angular compares values and classes ignoring case.
 *
 * @property element the element it names, null for any element
 * @property attributes the attributes it names, each with the value it requires, an empty one for any value
 * @property classNames the classes it names
 * @property notSelectors the parts of its `:not(…)`, none of which an element may match
 */
data class AngularSelector(
    val element: String? = null,
    val attributes: Map<String, String> = emptyMap(),
    val classNames: Set<String> = emptySet(),
    val notSelectors: List<AngularSelector> = emptyList()
)
