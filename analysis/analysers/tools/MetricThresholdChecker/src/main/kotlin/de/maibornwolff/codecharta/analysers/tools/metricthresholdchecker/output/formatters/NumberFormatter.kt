package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

class NumberFormatter {
    companion object {
        private const val DECIMAL_FORMAT = "%.2f"
    }

    fun format(value: Number): String {
        val doubleValue = value.toDouble()

        return if (doubleValue == doubleValue.toLong().toDouble()) {
            doubleValue.toLong().toString()
        } else {
            String.format(DECIMAL_FORMAT, doubleValue)
        }
    }
}
