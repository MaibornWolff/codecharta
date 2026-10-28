package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model

data class Cycle<K>(val edges: List<Edge<K>>)

data class Edge<K>(val from: K, val to: K)
