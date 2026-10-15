package de.maibornwolff.codecharta.analysers.tools.gate.rules

data class Declaration(val file: String, val name: String)

data class DeclarationDependency(
    val from: Declaration,
    val to: Declaration,
    val isCyclic: Boolean = false,
    val isPointingUpwards: Boolean = false
) {
    val isInsideOneFile: Boolean get() = from.file == to.file
}

data class DependencyAnalysis(
    val declarationDependencies: List<DeclarationDependency>,
    val upwardOfFilePair: Map<Pair<String, String>, Boolean> = emptyMap()
) {
    fun withoutFiles(isExcluded: (String) -> Boolean) = DependencyAnalysis(
        declarationDependencies.filterNot { isExcluded(it.from.file) || isExcluded(it.to.file) },
        upwardOfFilePair.filterKeys { (from, to) -> !isExcluded(from) && !isExcluded(to) }
    )
}
