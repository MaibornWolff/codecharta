package de.maibornwolff.treesitter.excavationsite.integration.metrics

import kotlin.math.round

/** The code smells of a file, counted from its functions and comments by the same thresholds for every language. */
internal object CodeSmells {
    private const val LONG_METHOD_THRESHOLD = 10
    private const val LONG_PARAMETER_LIST_THRESHOLD = 4
    private const val EXCESSIVE_COMMENTS_THRESHOLD = 10

    fun countLongMethods(rlocPerFunction: List<Int>): Int = rlocPerFunction.count { rloc -> rloc > LONG_METHOD_THRESHOLD }

    fun countLongParameterLists(parametersPerFunction: List<Int>): Int =
        parametersPerFunction.count { params -> params > LONG_PARAMETER_LIST_THRESHOLD }

    fun excessiveComments(commentLines: Int): Double = if (commentLines > EXCESSIVE_COMMENTS_THRESHOLD) 1.0 else 0.0

    fun commentRatio(commentLines: Int, rloc: Int): Double {
        if (rloc <= 0) return 0.0
        val ratio = commentLines.toDouble() / rloc.toDouble()
        return round(ratio * 100) / 100
    }
}
