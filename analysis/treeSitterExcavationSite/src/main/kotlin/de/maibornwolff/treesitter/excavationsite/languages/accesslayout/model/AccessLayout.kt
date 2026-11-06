package de.maibornwolff.treesitter.excavationsite.languages.accesslayout.model

import de.maibornwolff.treesitter.excavationsite.languages.sql.model.AccessQuery
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName

/**
 * What the layout of an Access form or report names (`vba.md`, Access forms and reports), for the name lookup of the
 * dependency parser: the queries and tables of its record and row sources, its subforms and subreports, and what its
 * expressions name, as [names]; the SQL of its record and row sources as [queries]; and whether it
 * [bindsEventProcedure], an event its code module handles.
 */
data class AccessLayout(val names: List<VbaName>, val queries: List<AccessQuery>, val bindsEventProcedure: Boolean)
