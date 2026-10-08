package de.maibornwolff.treesitter.excavationsite.languages.php

import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.ImportExtractor
import de.maibornwolff.treesitter.excavationsite.languages.php.extractors.PackageExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

object PhpDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = PackageExtractor::extract,
        extractImports = ImportExtractor::extract,
        extractDeclarations = DeclarationExtractor::extract
    )
}
