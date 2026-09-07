package de.maibornwolff.treesitter.excavationsite.languages.java

import de.maibornwolff.treesitter.excavationsite.languages.java.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.java.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.languages.java.extractors.PackageExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object JavaDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = PackageExtractor::extract,
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
