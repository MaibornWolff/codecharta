package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

internal object TypescriptDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = { _, _ -> emptyList() }, // JS/TS have no package declarations
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
