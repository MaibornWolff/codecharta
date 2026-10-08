package de.maibornwolff.treesitter.excavationsite.languages.python

import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.python.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object PythonDependencyMapping {
    // The module path of a Python file is its file path, which only the consumer knows
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = { emptyList() },
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
