package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.PackageExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object DelphiDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = PackageExtractor::extract,
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
