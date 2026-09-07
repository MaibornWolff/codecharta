package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

data class NodeDependencies(val internalDependencies: Set<Dependency>, val externalDependencies: Set<Dependency>) {
    operator fun plus(it: NodeDependencies): NodeDependencies = this.copy(
        internalDependencies = internalDependencies + it.internalDependencies,
        externalDependencies = externalDependencies + it.externalDependencies
    )
}
