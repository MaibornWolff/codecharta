package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.treesitter.excavationsite.api.AngularDeclaration

/**
 * What the Angular decorator of a class declares, or the elements of a template, see [AngularDeclaration], for
 * resolving the names and elements a template uses.
 *
 * @property templatePath the node path of the template of a component, its template file or its inline template
 */
data class AngularMetadata(val declaration: AngularDeclaration, val templatePath: Path? = null)
