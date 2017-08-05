package de.maibornwolff.codecharta.translator;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * This class provides methods to translate metric names. This enables normalization of metric names.
 */
public class MetricNameTranslator {
    public static final MetricNameTranslator TRIVIAL = new MetricNameTranslator() {
        @Override
        public String translate(String oldMetricName) {
            return oldMetricName;
        }

        @Override
        public String[] translate(String[] oldMetricName) {
            return oldMetricName;
        }
    };

    private String prefix;

    private Map<String, String> translationMap;

    private MetricNameTranslator() {
    }

    /**
     * @param translationMap a translation map with unique values
     */
    public MetricNameTranslator(Map<String, String> translationMap) {
        this(translationMap, "");
    }

    /**
     * @param translationMap a translation map with unique values
     * @param prefix         a prefix for all Strings not contained in translation map
     */
    public MetricNameTranslator(Map<String, String> translationMap, String prefix) {
        this.translationMap = translationMap;
        this.prefix = prefix;
        validate();
    }

    public String translate(String oldMetricName) {
        String newMetricName;
        if (translationMap.containsKey(oldMetricName)) {
            newMetricName = translationMap.get(oldMetricName);
        } else {
            newMetricName = prefix + oldMetricName.toLowerCase().replace(' ', '_');
        }
        return newMetricName;
    }

    public String[] translate(String[] oldMetricName) {
        return Arrays.stream(oldMetricName).map(this::translate).collect(Collectors.toList()).toArray(new String[0]);
    }

    private void validate() {
        List<String> seen = new ArrayList<>();

        for (String value : translationMap.values()) {
            if (!value.isEmpty() && seen.contains(value)) {
                throw new IllegalArgumentException("Replacement map should not map distinct keys to equal values, e.g. " + value);
            } else {
                seen.add(value);
            }
        }
    }
}
