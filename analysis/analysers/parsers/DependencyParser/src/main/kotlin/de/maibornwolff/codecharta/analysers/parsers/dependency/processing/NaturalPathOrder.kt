package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

/**
 * Orders the segments of file paths one by one the way a person numbers files: the digits in a name compare as numbers, so
 * `V9__orders.sql` comes before `V10__orders.sql`. Folders take part like file names, so `db/2/a.sql` comes after
 * `db/1/z.sql`. Flyway's repeatable migrations come after the versioned ones of their folder.
 */
object NaturalPathOrder : Comparator<List<String>> {
    private val CHUNK = Regex("\\d+|\\D+")
    private const val REPEATABLE_MIGRATION = "R__"
    private val VERSIONED_MIGRATION = Regex("V\\d.*__.*")

    override fun compare(first: List<String>, second: List<String>): Int {
        first.zip(second).forEach { (firstSegment, secondSegment) ->
            val order = compareSegments(firstSegment, secondSegment)
            if (order != 0) return order
        }
        return first.size.compareTo(second.size)
    }

    private fun compareSegments(first: String, second: String): Int {
        val migrationOrder = compareMigrationKinds(first, second)
        if (migrationOrder != 0) return migrationOrder
        val firstChunks = CHUNK.findAll(first).map { it.value }.toList()
        val secondChunks = CHUNK.findAll(second).map { it.value }.toList()
        firstChunks.zip(secondChunks).forEach { (firstChunk, secondChunk) ->
            val order = compareChunks(firstChunk, secondChunk)
            if (order != 0) return order
        }
        return firstChunks.size.compareTo(secondChunks.size)
    }

    // Flyway runs its repeatable migrations, R__name.sql, after all versioned ones, V1__name.sql
    private fun compareMigrationKinds(first: String, second: String): Int {
        val firstIsRepeatable = first.startsWith(REPEATABLE_MIGRATION)
        val secondIsRepeatable = second.startsWith(REPEATABLE_MIGRATION)
        val isOneOfEach =
            (firstIsRepeatable && VERSIONED_MIGRATION.matches(second)) || (secondIsRepeatable && VERSIONED_MIGRATION.matches(first))
        return if (isOneOfEach) firstIsRepeatable.compareTo(secondIsRepeatable) else 0
    }

    private fun compareChunks(first: String, second: String): Int {
        val bothNumbers = first[0].isDigit() && second[0].isDigit()
        if (!bothNumbers) return first.compareTo(second)
        val firstNumber = first.trimStart('0')
        val secondNumber = second.trimStart('0')
        return compareValuesBy(firstNumber, secondNumber, { it.length }, { it }).takeIf { it != 0 } ?: first.compareTo(second)
    }
}
