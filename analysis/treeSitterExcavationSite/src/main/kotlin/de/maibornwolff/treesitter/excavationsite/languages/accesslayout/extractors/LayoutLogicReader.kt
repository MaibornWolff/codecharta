package de.maibornwolff.treesitter.excavationsite.languages.accesslayout.extractors

import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.Macro
import de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors.MacroReader

/**
 * The logic of a form or report layout: the [expressions] its controls and events compute (`=Sum([Total])`, without
 * the `=`), the SQL of its record and row sources ([queries]), the tables and queries they name ([dataSources]), the
 * forms and reports of its subform controls, the [logicLines] all of these take up, and its [controls]; the [names]
 * of its controls, but for the names Access gives by default, and the fields they show, and the [captions] the user sees; whether it [bindsEventProcedure], an event
 * the code module of the form handles; the [macros] embedded in its events and the [macroNames] of the stand-alone
 * macros they run (`OnClick ="mcrOrders.Print"`).
 */
internal data class LayoutLogic(
    val expressions: List<String>,
    val queries: List<String>,
    val dataSources: List<String>,
    val subforms: List<String>,
    val subreports: List<String>,
    val logicLines: Int,
    val controls: Int,
    val lines: Int,
    val names: List<String>,
    val captions: List<String>,
    val bindsEventProcedure: Boolean,
    val macros: List<Macro>,
    val macroNames: List<String>
)

internal object LayoutLogicReader {
    private const val EXPRESSION_START = "="
    private const val EVENT_PROCEDURE = "[Event Procedure]"
    private const val BRACKET = "["
    private const val ROW_SOURCE_TYPE = "RowSourceType"
    private const val VALUE_LIST = "Value List"
    private const val SOURCE_OBJECT = "sourceobject"
    private const val ROW_SOURCE = "rowsource"
    private const val SUBFORM = "form"
    private const val SUBREPORT = "report"
    private const val NAME = "name"
    private const val CAPTION = "caption"
    private const val CONTROL_SOURCE = "controlsource"
    private val DATA_SOURCES = setOf("recordsource", ROW_SOURCE)
    private val EXPRESSION_PROPERTIES = setOf(CONTROL_SOURCE, "defaultvalue", "validationrule")
    private val EVENT_PREFIXES = listOf("on", "before", "after")
    private val SQL_START = Regex("""^[\s(]*(SELECT|TRANSFORM|PARAMETERS)\b""", RegexOption.IGNORE_CASE)
    private val SUB_OBJECT = Regex("""^(Form|Report|Table|Query)\.(.+)$""", RegexOption.IGNORE_CASE)

    // The name Access gives a new control: its type and a number (`Label122`, `Text45`, `Auto_Header0`)
    private val NUMBERED_NAME = Regex("""^(\D+)\d+$""")
    private val DEFAULT_CONTROL_TYPES = setOf(
        "Label", "Text", "Command", "Combo", "List", "Check", "Option", "Toggle", "Frame", "Box", "Line", "Image",
        "EmptyCell", "Child", "Page", "TabCtl", "OLEUnbound", "OLEBound", "Attachment", "Chart", "NavigationButton",
        "NavigationSubform", "NavigationControl", "WebBrowser", "EdgeBrowser", "PageBreak", "Auto_Header", "Auto_Title",
        "Auto_Logo", "Auto_Date", "Auto_Time", "Auto_PageNumber"
    ).map { it.lowercase() }.toSet()

    private class Collected {
        val expressions = mutableListOf<String>()
        val queries = mutableListOf<String>()
        val dataSources = mutableListOf<String>()
        val subforms = mutableListOf<String>()
        val subreports = mutableListOf<String>()
        val names = mutableListOf<String>()
        val captions = mutableListOf<String>()
        val macroNames = mutableListOf<String>()
        var logicLines = 0
        var bindsEventProcedure = false
    }

    fun read(content: String): LayoutLogic {
        val layout = LayoutReader.read(content)
        val collected = Collected()
        layout.blocks.filterNot { it.isStyle }.forEach { block -> block.properties.forEach { collect(it, block, collected) } }
        return LayoutLogic(
            collected.expressions,
            collected.queries,
            collected.dataSources,
            collected.subforms,
            collected.subreports,
            collected.logicLines,
            layout.blocks.count { it.isControl },
            layout.lines,
            collected.names,
            collected.captions,
            collected.bindsEventProcedure,
            layout.embeddedMacros.map { MacroReader.read(it) },
            collected.macroNames
        )
    }

    private fun collect(property: LayoutProperty, block: LayoutBlock, collected: Collected) {
        val name = property.name.lowercase()
        val value = property.value.trim()
        when {
            isExpressionProperty(name) && value.startsWith(EXPRESSION_START) -> {
                collected.expressions.add(value.removePrefix(EXPRESSION_START))
                collected.logicLines += property.lines
            }
            name in DATA_SOURCES && value.isNotEmpty() && !isValueList(name, block) -> collectDataSource(property, value, collected)
            name == SOURCE_OBJECT -> collectSubObject(value, collected)
            isEventProperty(name) && value.equals(EVENT_PROCEDURE, ignoreCase = true) -> collected.bindsEventProcedure = true
            isEventProperty(name) && value.isNotEmpty() && !value.startsWith(BRACKET) -> collected.macroNames.add(value)
            value.isEmpty() -> Unit
            name == CAPTION -> collected.captions.add(value)
            name == CONTROL_SOURCE || (name == NAME && block.isControl && !isDefaultControlName(value)) -> collected.names.add(value)
        }
    }

    private fun isDefaultControlName(value: String): Boolean =
        NUMBERED_NAME.matchEntire(value)?.groupValues?.get(1)?.lowercase() in DEFAULT_CONTROL_TYPES

    private fun isExpressionProperty(name: String): Boolean = name in EXPRESSION_PROPERTIES || isEventProperty(name)

    private fun isEventProperty(name: String): Boolean = EVENT_PREFIXES.any { name.startsWith(it) }

    private fun isValueList(name: String, block: LayoutBlock): Boolean =
        name == ROW_SOURCE && block.valueOf(ROW_SOURCE_TYPE).equals(VALUE_LIST, ignoreCase = true)

    private fun collectDataSource(property: LayoutProperty, value: String, collected: Collected) {
        if (!SQL_START.containsMatchIn(value)) {
            collected.dataSources.add(value)
            return
        }
        collected.queries.add(value)
        collected.logicLines += property.lines
    }

    private fun collectSubObject(value: String, collected: Collected) {
        val match = SUB_OBJECT.matchEntire(value) ?: return
        val name = match.groupValues[2]
        when (match.groupValues[1].lowercase()) {
            SUBFORM -> collected.subforms.add(name)
            SUBREPORT -> collected.subreports.add(name)
            else -> collected.dataSources.add(name)
        }
    }
}
