package de.maibornwolff.codecharta.util

object EditDistance {
    fun between(lhs: CharSequence, rhs: CharSequence): Int {
        val lhsLength = lhs.length
        val rhsLength = rhs.length

        var cost = IntArray(rhsLength + 1) { it }
        var newCost = IntArray(rhsLength + 1)

        for (i in 1..lhsLength) {
            newCost[0] = i

            for (j in 1..rhsLength) {
                val match = if (lhs[i - 1] == rhs[j - 1]) 0 else 1
                val costReplace = cost[j - 1] + match
                val costInsert = cost[j] + 1
                val costDelete = newCost[j - 1] + 1

                newCost[j] = minOf(costInsert, costDelete, costReplace)
            }

            val swap = cost
            cost = newCost
            newCost = swap
        }

        return cost[rhsLength]
    }
}
