package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

private const val TYPE_LINE_INDENT = "  "

internal fun analyzeDelphi(code: String): DependencyResult = TreeSitterDependencies.analyze(code, Language.DELPHI)

internal fun unitWithTypes(vararg typeLines: String): String {
    val typeSection = typeLines.joinToString("\n") { TYPE_LINE_INDENT + it }
    return "unit MyUnit;\ninterface\ntype\n$typeSection\nimplementation\nend."
}

internal fun classWithMembers(vararg memberLines: String): String =
    unitWithTypes("TMyClass = class", *memberLines.map { TYPE_LINE_INDENT + it }.toTypedArray(), "end;")
