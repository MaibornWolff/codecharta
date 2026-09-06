package sample

/**
 * A comprehensive sample class demonstrating various Kotlin features.
 * Used for golden file contract testing.
 */
class Sample(private val prefix: String = "Hello, ") {
    // Class-level constant
    companion object {
        const val MAX_RETRIES = 3
    }

    private var counter = 0

    /** Simple getter with no complexity */
    fun getCounter(): Int {
        return counter
    }

    // Calculate sum with validation and control flow
    fun calculate(a: Int, b: Int, c: Int, d: Int, e: Int): Int {
        if (a < 0 || b < 0) {
            return 0
        }
        var sum = 0
        for (i in 0 until c) {
            sum += a + b
        }
        var remaining = d
        while (remaining > 0) {
            sum += remaining
            remaining--
        }
        return sum + e
    }

    /*
     * A long method that processes data with nested logic.
     * This tests long_method detection (15+ lines).
     */
    fun processData(items: List<String>): String {
        val result = StringBuilder()
        var count = 0
        for (item in items) {
            if (item.isEmpty()) {
                result.append("empty")
            } else if (item.length > 10) {
                for (i in 0 until 3) {
                    result.append(item.substring(0, 5))
                }
            } else {
                result.append(item)
            }
            count++
        }
        try {
            result.append(" total: $count")
        } catch (e: Exception) {
            return "error"
        }
        return result.toString()
    }

    // Method chaining example (triggers message_chains metric)
    fun chainedCall(input: String?): String? {
        return input?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?.uppercase()
            ?.replace("A", "X")
    }

    /**
     * Demonstrates when expression usage.
     * @param type the type identifier
     * @return formatted result string
     */
    fun formatByType(type: Int): String {
        val label = when (type) {
            1 -> "one"
            2 -> "two"
            3 -> "three"
            else -> "unknown"
        }
        return "$prefix$label"
    }

    // Extension function example
    fun String.addSuffix(suffix: String): String {
        return this + suffix
    }

    // Inner enum for testing enum extraction
    enum class Status {
        PENDING, ACTIVE, COMPLETED
    }

    // Data class for testing extraction
    data class Result(val value: Int, val message: String)
}
