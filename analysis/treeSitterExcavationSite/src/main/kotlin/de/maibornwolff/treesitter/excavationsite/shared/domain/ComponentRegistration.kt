package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * A Vue component registered under a name: [binding] is the name the registering code gives the component.
 *
 * @property isGlobal true for `app.component('Name', Binding)`, which every template of the app sees; false for an
 *   entry of a component's own `components: { Name: Binding }` option
 */
data class ComponentRegistration(val name: String, val binding: String, val isGlobal: Boolean)
