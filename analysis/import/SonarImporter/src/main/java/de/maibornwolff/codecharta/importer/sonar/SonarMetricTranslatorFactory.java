package de.maibornwolff.codecharta.importer.sonar;

import com.google.common.collect.ImmutableMap;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;

import java.util.HashMap;
import java.util.Map;

final class SonarMetricTranslatorFactory {
    private SonarMetricTranslatorFactory() {
    }

    public static MetricNameTranslator createMetricTranslator() {
        String prefix = "sonar_";

        Map<String,String> replacementMap = new HashMap<>();
        replacementMap.put("accessors", "accessors");
        replacementMap.put("commented_out_code_lines", "commented_out_loc");
        replacementMap.put("comment_lines", "comment_lines");
        replacementMap.put("complexity", "mcc");
        replacementMap.put("function_complexity", "average_function_mcc");
        replacementMap.put("branch_coverage", "branch_coverage");
        replacementMap.put("functions", "functions");
        replacementMap.put("line_coverage", "line_coverage");
        replacementMap.put("lines", "loc");
        replacementMap.put("ncloc", "rloc");
        replacementMap.put("public_api", "public_api");
        replacementMap.put("statements", "statements");

        return new MetricNameTranslator(ImmutableMap.copyOf(replacementMap), prefix);

    }
}
