package de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors

/**
 * Reads a macro as `SaveAsText` writes it. Access 2010 and later write the whole macro as XML, split over `_AXL:`
 * comment rows, and the action rows older versions read, which flatten its blocks; the rows count only for a macro
 * without readable XML.
 */
internal object MacroReader {
    private const val COMMENT = "Comment"
    private const val XML_PREFIX = "_AXL:"

    fun read(content: String): Macro {
        val (xmlRows, actionRows) = MacroRows.read(content).partition { isXmlRow(it) }
        val xml = xmlRows.joinToString("") { it.valueOf(COMMENT).orEmpty().removePrefix(XML_PREFIX) }
        return xml.takeIf { it.isNotEmpty() }?.let { MacroXml.read(it) } ?: MacroActionRows.read(actionRows)
    }

    private fun isXmlRow(row: MacroRow): Boolean = row.valueOf(COMMENT)?.startsWith(XML_PREFIX) == true
}
