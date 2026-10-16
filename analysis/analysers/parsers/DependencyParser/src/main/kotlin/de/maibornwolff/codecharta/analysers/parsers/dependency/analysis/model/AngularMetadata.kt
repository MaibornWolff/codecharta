package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/**
 * What the Angular decorator of a class declares, for resolving the names a template uses.
 *
 * @property templateNames the names a template refers to the class by instead of its own: the element selectors of a
 * component and the name of a pipe
 * @property templatePath the node path of the template of a component, its template file or its inline template
 * @property imports the classes a standalone component or a module imports
 * @property declarations the classes a module declares
 * @property exports the classes a module exports
 */
data class AngularMetadata(
    val templateNames: Set<String> = emptySet(),
    val templatePath: Path? = null,
    val imports: Set<String> = emptySet(),
    val declarations: Set<String> = emptySet(),
    val exports: Set<String> = emptySet()
)
