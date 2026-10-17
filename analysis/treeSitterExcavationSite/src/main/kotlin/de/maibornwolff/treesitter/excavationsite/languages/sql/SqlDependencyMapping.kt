package de.maibornwolff.treesitter.excavationsite.languages.sql

import de.maibornwolff.treesitter.excavationsite.languages.sql.extractors.DeclarationExtractor
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDependencyMapping

/**
 * SQL dependency mapping: no packages and no imports, only the objects a script creates and the objects each of
 * them uses by name.
 */
object SqlDependencyMapping {
    val dependencyMapping = LanguageDependencyMapping(
        extractPackagePath = { emptyList() },
        extractImports = { emptyList() },
        extractDeclarations = DeclarationExtractor::extract
    )
}
