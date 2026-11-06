package de.maibornwolff.treesitter.excavationsite.languages.accessmacro.extractors

/** A statement of an Access macro, as the macro designer shows it. */
internal sealed interface MacroStatement

/** An action such as `OpenForm`, with the arguments the macro fills in, by their names in the macro designer. */
internal data class MacroAction(val name: String, val arguments: Map<String, String>) : MacroStatement

/** An `If` block: its `If` and `Else If` branches with their condition, then an `Else` branch without one. */
internal data class MacroConditional(val branches: List<MacroBranch>) : MacroStatement

internal data class MacroBranch(val condition: String?, val statements: List<MacroStatement>)

internal data class MacroGroup(val name: String, val statements: List<MacroStatement>) : MacroStatement

internal data class MacroComment(val text: String) : MacroStatement

/** A submacro, run by the name of its macro and its own (`mcrOrders.PrintOrders`). */
internal data class Submacro(val name: String, val statements: List<MacroStatement>)

/** A stand-alone or embedded macro: the [statements] it runs and its [submacros]. */
internal data class Macro(val statements: List<MacroStatement>, val submacros: List<Submacro>)
