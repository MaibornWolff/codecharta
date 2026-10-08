package de.maibornwolff.treesitter.excavationsite.languages.go

import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.languages.go.extractors.PackageExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object GoDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = PackageExtractor::extract,
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
