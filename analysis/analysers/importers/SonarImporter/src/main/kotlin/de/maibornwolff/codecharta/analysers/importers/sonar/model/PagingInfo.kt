package de.maibornwolff.codecharta.analysers.importers.sonar.model

data class PagingInfo(
    private val pageIndex: Int,
    private val pageSize: Int,
    val total: Int
)
