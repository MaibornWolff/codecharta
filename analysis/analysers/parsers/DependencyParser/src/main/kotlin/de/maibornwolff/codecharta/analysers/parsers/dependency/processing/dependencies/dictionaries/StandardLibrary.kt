package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.dictionaries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path

interface StandardLibrary {
    fun get(): Map<String, Path>
}
