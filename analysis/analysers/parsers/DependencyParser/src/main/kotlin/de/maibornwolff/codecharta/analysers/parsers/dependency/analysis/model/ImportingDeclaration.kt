package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

/**
 * The declaration a name is written in, as far as resolving that name needs it: its path, file, imports and language,
 * and the package it lies in, which for a nested declaration is not the path of the declaration around it.
 */
internal class ImportingDeclaration(
    val path: Path,
    val physicalPath: String,
    val dependencies: Set<Dependency>,
    val language: SupportedLanguage,
    val ownPackage: List<String> = path.withoutName()
)
