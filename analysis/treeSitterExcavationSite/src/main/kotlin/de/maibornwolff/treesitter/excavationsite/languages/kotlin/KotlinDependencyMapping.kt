package de.maibornwolff.treesitter.excavationsite.languages.kotlin

import de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.languages.kotlin.extractors.PackageExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object KotlinDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = PackageExtractor::extract,
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
