package de.maibornwolff.codecharta.analysers.importers.sonar.model

data class Measures(val paging: PagingInfo, val components: List<Component>? = listOf())
