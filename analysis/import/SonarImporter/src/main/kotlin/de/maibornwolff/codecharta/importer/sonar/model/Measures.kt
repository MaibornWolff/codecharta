package de.maibornwolff.codecharta.importer.sonar.model

data class Measures(val paging: PagingInfo, val components: List<Component>? = listOf())
