package de.maibornwolff.codecharta.translator

/**
 * This class provides methods to translate metric names. This enables normalization of metric names.
 */
open class MetricNameTranslator(
    private val translationMap: Map<String, String>,
    private val prefix: String = ""
) {

    init {
        validate()
    }

    open fun translate(oldMetricName: String): String {
        return when {
            translationMap.containsKey(oldMetricName) -> translationMap[oldMetricName]!!
            else -> prefix + oldMetricName.toLowerCase().replace(' ', '_')
        }
    }

    open fun translate(oldMetricName: Array<String?>): Array<String?> {
        return oldMetricName.map { it?.let { translate(it) } }.toTypedArray()
    }

    private fun validate() {
        val seen = ArrayList<String>()

        for (value in translationMap.values) {
            if (value.isNotEmpty() && seen.contains(value)) {
                throw IllegalArgumentException("Replacement map should not map distinct keys to equal values, e.g. $value")
            } else {
                seen.add(value)
            }
        }
    }

    companion object {
        val TRIVIAL: MetricNameTranslator = object : MetricNameTranslator(emptyMap()) {
            override fun translate(oldMetricName: String): String {
                return oldMetricName
            }

            override fun translate(oldMetricName: Array<String?>): Array<String?> {
                return oldMetricName
            }
        }
    }
}
