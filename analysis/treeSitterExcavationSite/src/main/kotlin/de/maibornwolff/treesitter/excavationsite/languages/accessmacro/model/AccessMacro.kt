package de.maibornwolff.treesitter.excavationsite.languages.accessmacro.model

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName

/**
 * What an Access macro names (`vba.md`, Access macros), for the name lookup of the dependency parser: the forms,
 * reports, queries and macros its actions name, and what its expressions name, as [names].
 */
data class AccessMacro(val names: List<VbaName>)
