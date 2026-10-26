package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.treesitter.excavationsite.api.AngularSelector

/**
 * Whether this alternative of a selector matches the template element, as Angular's `SelectorMatcher` decides it: the
 * element has the tag it names, each attribute it names (with the value, where it names one) and each of its classes,
 * and matches none of its `:not(…)` parts.
 */
internal fun AngularSelector.matches(element: AngularSelector): Boolean =
    matchesEveryPart(element) && notSelectors.none { it.matchesEveryPart(element) }

private fun AngularSelector.matchesEveryPart(element: AngularSelector): Boolean =
    (this.element == null || this.element == element.element) &&
        attributes.all { (name, value) -> element.attributes[name]?.let { value.isEmpty() || it == value } == true } &&
        element.classNames.containsAll(classNames)
