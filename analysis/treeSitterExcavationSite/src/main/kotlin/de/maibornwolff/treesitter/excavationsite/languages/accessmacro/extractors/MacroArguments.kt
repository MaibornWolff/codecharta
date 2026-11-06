package de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors

/**
 * What the arguments of a macro action mean: an expression, which an argument such as `WhereCondition` always holds
 * and any other one when it starts with `=`; the name of an object (`FormName`, `MacroName`); or a message the user
 * reads. The other arguments are options of the action (`View`, `DataMode`).
 */
internal object MacroArguments {
    private const val EXPRESSION_START = "="
    private const val NAME_SUFFIX = "Name"
    private const val ON_ERROR = "OnError"
    private const val GOTO = "Goto"
    private const val GOTO_SUBMACRO = "Macro Name"
    private const val SUBMACRO = "MacroName"
    private val EXPRESSIONS = setOf("Expression", "WhereCondition", "Value", "FunctionName", "RepeatExpression")
    private val MESSAGES = setOf("Message", "Title")

    fun expressionsOf(action: MacroAction): List<String> = action.arguments.mapNotNull { (name, value) -> expressionOf(name, value) }

    fun objectNamesOf(action: MacroAction): List<String> =
        action.arguments.filter { (name, value) -> name.endsWith(NAME_SUFFIX) && expressionOf(name, value) == null }.values.toList()

    fun messagesOf(action: MacroAction): List<String> =
        action.arguments.filter { (name, value) -> name in MESSAGES && expressionOf(name, value) == null }.values.toList()

    /** The submacro an `OnError` action jumps to, null for any other action. */
    fun errorHandlerOf(action: MacroAction): String? {
        if (!action.name.equals(ON_ERROR, ignoreCase = true)) return null
        if (!action.arguments[GOTO].equals(GOTO_SUBMACRO, ignoreCase = true)) return null
        return action.arguments[SUBMACRO]
    }

    private fun expressionOf(name: String, value: String): String? = when {
        value.startsWith(EXPRESSION_START) -> value.removePrefix(EXPRESSION_START)
        name in EXPRESSIONS -> value
        else -> null
    }
}
