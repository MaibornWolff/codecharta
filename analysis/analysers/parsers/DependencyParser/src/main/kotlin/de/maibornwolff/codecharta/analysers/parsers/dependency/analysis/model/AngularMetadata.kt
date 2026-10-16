package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

/**
 * What the Angular decorator of a class declares, for resolving the names a template uses.
 *
 * @property templateNames the names a template refers to the class by instead of its own: the element selectors of a
 * component and the name of a pipe
 */
data class AngularMetadata(val templateNames: Set<String> = emptySet())
