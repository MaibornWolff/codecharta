package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path

class EmptyStandardLibrary : StandardLibrary {
    override fun get(): Map<String, Path> = emptyMap()
}
