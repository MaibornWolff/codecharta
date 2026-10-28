package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import de.maibornwolff.treesitter.excavationsite.api.ComponentRegistration

/**
 * What a tag of a component's template means, by Vue tag rules 2 to 6 of `docs/name-resolution/typescript.md`, the
 * tag in Pascal case as TSE reports it: a binding of the scripts, written as is or in camel case, which only a
 * component with `<script setup>` sees ([templateBindings] null without one); an entry of the `components` option;
 * the component the project registers globally under that name; no edge for the component itself; else the one
 * component of the project of that name.
 */
internal class ComponentTags(
    private val ownName: String,
    private val templateBindings: Set<String>?,
    private val localRegistrations: List<ComponentRegistration>,
    private val globalComponents: GlobalComponents?,
    private val projectComponents: VueComponents?
) {
    /** The binding the tag names, or the full path of the component it names; null for no edge. */
    fun nameOf(tag: String): String? {
        bindingOf(tag)?.let { return it }
        localRegistrations.firstOrNull { VueNames.pascalCaseOf(it.name) == tag }?.let { return it.binding }
        globalComponents?.onlyOneNamed(tag)?.let { return it.withDots() }
        if (tag == VueNames.pascalCaseOf(ownName)) return null
        return projectComponents?.onlyOneNamed(tag)?.withDots()
    }

    private fun bindingOf(tag: String): String? {
        val bindings = templateBindings ?: return null
        return listOf(tag, VueNames.camelCaseOf(tag)).firstOrNull { it in bindings }
    }
}
