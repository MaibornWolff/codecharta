package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.cycledetection.model

fun NodeInformation.Companion.build(id: String = "", dependencies: Set<String> = setOf()) =
    NodeInformation(id = id, dependencies = dependencies)
