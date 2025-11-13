package de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.output.formatters

import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ThresholdViolation
import de.maibornwolff.codecharta.analysers.tools.metricthresholdchecker.model.ViolationType

class ExcessCalculator {
    fun calculate(violation: ThresholdViolation): Double {
        val actualValue = violation.actualValue.toDouble()
        val thresholdValue = violation.threshold.getThresholdValue(violation.violationType)?.toDouble() ?: 0.0

        return when (violation.violationType) {
            ViolationType.BELOW_MIN -> thresholdValue - actualValue
            ViolationType.ABOVE_MAX -> actualValue - thresholdValue
        }
    }
}
