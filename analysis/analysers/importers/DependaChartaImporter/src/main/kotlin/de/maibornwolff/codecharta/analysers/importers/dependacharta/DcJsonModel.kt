package de.maibornwolff.codecharta.analysers.importers.dependacharta

data class DcProject(
    val leaves: Map<String, DcLeaf> = emptyMap()
)

data class DcLeaf(
    val id: String = "",
    val name: String = "",
    val physicalPath: String = "",
    val nodeType: String = "",
    val language: String = "",
    val dependencies: Map<String, DcDependency> = emptyMap()
)

data class DcDependency(
    val isCyclic: Boolean = false,
    val weight: Int = 1,
    val type: String = "",
    val isPointingUpwards: Boolean = false
)
