package de.maibornwolff.codecharta.importer.csv

interface CSVRowFilter {
    fun include(row: Array<out String>): Boolean

    companion object {
        val TRIVIAL  = object : CSVRowFilter {
            override fun include(row: Array<out String>): Boolean {
                return true
            }
        }
    }

}
