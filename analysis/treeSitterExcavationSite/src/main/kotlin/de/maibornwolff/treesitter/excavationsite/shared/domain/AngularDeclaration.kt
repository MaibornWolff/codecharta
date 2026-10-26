package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * What an Angular decorator declares of its class, or what a template holds.
 *
 * @property templateNames the names a template refers to the class by instead of its own: the element selectors of a
 * component and the name of a pipe
 * @property selectors the alternatives of the selector of a component or directive
 * @property templateUrl the template file of a component, as its `templateUrl` writes it
 * @property imports the classes a standalone component or a module imports, as named in its `imports`
 * @property declarations the classes a module declares
 * @property exports the classes a module exports
 * @property elements the elements of a template, each as the selector the compiler matches selectors against
 */
data class AngularDeclaration(
    val templateNames: Set<String> = emptySet(),
    val selectors: List<AngularSelector> = emptyList(),
    val templateUrl: String? = null,
    val imports: List<String> = emptyList(),
    val declarations: List<String> = emptyList(),
    val exports: List<String> = emptyList(),
    val elements: List<AngularSelector> = emptyList()
)
