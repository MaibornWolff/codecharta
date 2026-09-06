package de.maibornwolff.treesitter.excavationsite.languages.cpp

import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.DependencyDeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.PackageExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object CppDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = PackageExtractor::extract,
        extractImports = ImportExtractor::extract,
        extractDeclarations = DependencyDeclarationExtractor::extract
    )
}
