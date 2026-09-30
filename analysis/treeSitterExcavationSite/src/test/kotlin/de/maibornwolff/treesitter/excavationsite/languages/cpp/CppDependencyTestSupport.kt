package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.shared.domain.DependencyResult
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

internal fun analyzeCpp(code: String): DependencyResult = TreeSitterDependencies.analyze(code, Language.CPP)

internal fun DependencyResult.usedTypesOf(declarationName: String): Set<UsedType> =
    declarations.single { it.name == declarationName }.usedTypes

internal fun containerWith(vararg memberLines: String): String = memberLines.joinToString("\n", "class Container {\n", "\n};") { "    $it" }

internal fun containerMethodWith(vararg statements: String): String =
    containerWith("void doWork() {", *statements.map { "    $it" }.toTypedArray(), "}")
