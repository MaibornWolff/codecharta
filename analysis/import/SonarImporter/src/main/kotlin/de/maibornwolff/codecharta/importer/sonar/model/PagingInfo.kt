package de.maibornwolff.codecharta.importer.sonar.model

data class PagingInfo(private val pageIndex: Int,
                      private val pageSize: Int,
                      val total: Int)
