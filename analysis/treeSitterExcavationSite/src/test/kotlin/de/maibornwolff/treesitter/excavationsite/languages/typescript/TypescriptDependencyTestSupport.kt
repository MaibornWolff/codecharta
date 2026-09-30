package de.maibornwolff.treesitter.excavationsite.languages.typescript

import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

internal fun analyzeTypescript(code: String): DependencyResult = TreeSitterDependencies.analyze(code, Language.TYPESCRIPT)

internal fun DependencyResult.usedTypeNamesOf(declarationName: String): List<String> =
    declarations.first { it.name == declarationName }.usedTypes.map { it.name }
