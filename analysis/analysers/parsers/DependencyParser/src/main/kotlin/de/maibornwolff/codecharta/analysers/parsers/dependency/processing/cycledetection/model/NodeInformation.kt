package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model

data class NodeInformation(val id: String, val dependencies: Set<String>) {
    companion object
}
