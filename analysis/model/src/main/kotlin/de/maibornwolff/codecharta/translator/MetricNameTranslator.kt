package de.maibornwolff.codecharta.translator

import java.util.Locale

/**
 * This class provides methods to translate metric names. This enables normalization of metric names.
 */
open class MetricNameTranslator(private val translationMap: Map<String, String>, private val prefix: String = "") {
    init {
        validate()
    }

    open fun translate(oldMetricName: String): String = when {
        translationMap.containsKey(oldMetricName) -> translationMap.getValue(oldMetricName)
        else ->
            prefix +
                oldMetricName
                    .lowercase(Locale.getDefault())
                    .replace(' ', '_')
    }

    open fun translate(oldMetricName: Array<String?>): Array<String?> = oldMetricName
        .map {
            it?.let {
                translate(it)
            }
        }.toTypedArray()

    private fun validate() {
        val seen = ArrayList<String>()

        for (value in translationMap.values) {
            require(!(value.isNotEmpty() && seen.contains(value))) {
                "Replacement map should not map distinct keys to equal values, e.g. $value"
            }
            seen.add(value)
        }
    }

    companion object {
        val TRIVIAL: MetricNameTranslator =
            object : MetricNameTranslator(emptyMap()) {
                override fun translate(oldMetricName: String): String = oldMetricName

                override fun translate(oldMetricName: Array<String?>): Array<String?> = oldMetricName
            }
    }
}
