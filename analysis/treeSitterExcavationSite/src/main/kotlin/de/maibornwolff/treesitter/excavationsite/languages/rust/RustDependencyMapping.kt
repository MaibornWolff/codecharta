package de.maibornwolff.treesitter.excavationsite.languages.rust

import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.languages.rust.extractors.PackageExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object RustDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = PackageExtractor.extract,
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
