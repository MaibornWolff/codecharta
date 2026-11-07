package de.maibornwolff.treesitter.excavationsite.languages.sql.model

/**
 * What an Access query names (`vba.md`, Access queries): its SQL names as [SqlScript] reads them, and the forms and
 * reports a bang chain names (`[Forms]![frmOrders]![txtId]` names `frmOrders`), as written.
 */
data class AccessQuery(val names: List<SqlName>, val forms: List<String>, val reports: List<String>)
