package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model

data class Cycle(val edges: List<Edge>)

data class Edge(val from: String, val to: String)
