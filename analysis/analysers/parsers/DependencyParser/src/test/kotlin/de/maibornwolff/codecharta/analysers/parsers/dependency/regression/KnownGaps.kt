package de.maibornwolff.codecharta.analysers.parsers.dependency.regression

/**
 * How a probe's output deviates from its expectation today: `missing <line>` names an expected line the parser does
 * not draw yet, `extra <line>` a wrong line it draws. Every other expected line stays checked.
 */
internal class KnownGaps(val missing: Set<String>, val extra: Set<String>) {
    fun checkAgainst(expected: Collection<String>) {
        val missingButNotExpected = missing - expected.toSet()
        val extraButExpected = extra intersect expected.toSet()
        require(missingButNotExpected.isEmpty()) { "missing lines that $EXPECTED_FILE does not hold: $missingButNotExpected" }
        require(extraButExpected.isEmpty()) { "extra lines that $EXPECTED_FILE holds: $extraButExpected" }
    }

    /** The gaps the parser no longer shows, each worded as the line to delete from the gaps file. */
    fun closedBy(actual: Collection<String>): List<String> =
        (missing intersect actual.toSet()).map { "$MISSING_PREFIX$it" } + (extra - actual.toSet()).map { "$EXTRA_PREFIX$it" }

    companion object {
        private const val MISSING_PREFIX = "missing "
        private const val EXTRA_PREFIX = "extra "
        private const val EXPECTED_FILE = "expected.txt"

        fun parse(lines: List<String>): KnownGaps {
            val unknown = lines.filterNot { it.startsWith(MISSING_PREFIX) || it.startsWith(EXTRA_PREFIX) }
            require(unknown.isEmpty()) { "known gap lines must start with '$MISSING_PREFIX' or '$EXTRA_PREFIX': $unknown" }
            return KnownGaps(
                missing = lines.filter { it.startsWith(MISSING_PREFIX) }.map { it.removePrefix(MISSING_PREFIX) }.toSet(),
                extra = lines.filter { it.startsWith(EXTRA_PREFIX) }.map { it.removePrefix(EXTRA_PREFIX) }.toSet()
            )
        }
    }
}
