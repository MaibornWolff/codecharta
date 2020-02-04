package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.translator.MetricNameTranslator

internal object SonarMetricTranslatorFactory {

    fun createMetricTranslator(): MetricNameTranslator {
        val prefix = "sonar_"

        val replacementMap = mutableMapOf<String, String>()
        replacementMap["accessors"] = "accessors"
        replacementMap["commented_out_code_lines"] = "commented_out_loc"
        replacementMap["comment_lines"] = "comment_lines"
        replacementMap["complexity"] = "mcc"
        replacementMap["function_complexity"] = "average_function_mcc"
        replacementMap["branch_coverage"] = "branch_coverage"
        replacementMap["functions"] = "functions"
        replacementMap["line_coverage"] = "line_coverage"
        replacementMap["lines"] = "loc"
        replacementMap["ncloc"] = "rloc"
        replacementMap["public_api"] = "public_api"
        replacementMap["statements"] = "statements"

        return MetricNameTranslator(replacementMap.toMap(), prefix)
    }
}
