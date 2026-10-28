package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model

data class NodeInformation<K>(val id: K, val dependencies: Set<K>) {
    companion object
}
