package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

import de.maibornwolff.codecharta.model.ExternalImport

/** The declarations of one file, and the third-party packages it imports, which reach no declaration of the project. */
data class FileReport(val nodes: List<Node>, val externalImports: Set<ExternalImport> = emptySet(), val physicalPath: String? = null)
