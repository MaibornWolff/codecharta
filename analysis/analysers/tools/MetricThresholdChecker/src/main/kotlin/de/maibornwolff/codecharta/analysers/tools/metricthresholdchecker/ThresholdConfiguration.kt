package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker

data class ThresholdConfiguration(
    val fileMetrics: Map<String, MetricThreshold> = emptyMap()
)

data class MetricThreshold(
    val min: Number? = null,
    val max: Number? = null
) {
    init {
        require(min != null || max != null) {
            "At least one of 'min' or 'max' must be specified for a threshold"
        }
    }

    fun isViolated(value: Number): Boolean {
        val doubleValue = value.toDouble()

        if (min != null && doubleValue < min.toDouble()) {
            return true
        }

        if (max != null && doubleValue > max.toDouble()) {
            return true
        }

        return false
    }

    fun getViolationType(value: Number): ViolationType? {
        val doubleValue = value.toDouble()

        return when {
            min != null && doubleValue < min.toDouble() -> ViolationType.BELOW_MIN
            max != null && doubleValue > max.toDouble() -> ViolationType.ABOVE_MAX
            else -> null
        }
    }

    fun getThresholdValue(violationType: ViolationType): Number? {
        return when (violationType) {
            ViolationType.BELOW_MIN -> min
            ViolationType.ABOVE_MAX -> max
        }
    }
}

enum class ViolationType {
    BELOW_MIN,
    ABOVE_MAX
}

data class ThresholdViolation(
    val path: String,
    val metricName: String,
    val actualValue: Number,
    val threshold: MetricThreshold,
    val violationType: ViolationType
)
