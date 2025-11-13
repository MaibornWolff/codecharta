package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

import java.math.BigDecimal
import java.math.RoundingMode

class NumberFormatter {
    companion object {
        private const val DECIMAL_PLACES = 2
    }

    fun format(value: Number): String {
        val doubleValue = value.toDouble()

        return if (isWholeNumber(doubleValue)) {
            doubleValue.toLong().toString()
        } else {
            formatWithRounding(doubleValue)
        }
    }

    private fun isWholeNumber(value: Double): Boolean {
        return value == value.toLong().toDouble()
    }

    private fun formatWithRounding(value: Double): String {
        return BigDecimal(value.toString())
            .setScale(DECIMAL_PLACES, RoundingMode.HALF_UP)
            .stripTrailingZeros()
            .toPlainString()
    }
}
