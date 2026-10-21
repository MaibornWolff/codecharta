package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

/** The declaration a name is written in, as far as resolving that name needs it: its path, imports and language. */
internal class ImportingDeclaration(val path: Path, val dependencies: Set<Dependency>, val language: SupportedLanguage)
