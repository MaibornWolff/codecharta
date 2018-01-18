package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class Metrics implements Metric {
    private final List<Metric> metricList;

    private Metrics(List<Metric> metricsToRegister) {
        metricList = metricsToRegister;
    }

    public static Metric of(List<Metric> metricsToRegister) {
        return new Metrics(new ArrayList<>(metricsToRegister));
    }

    public static Metric of(Metric... metrics) {
        return of(Arrays.asList(metrics));
    }

    @Override
    public String metricName() {
        return "all";
    }


    @Override
    public Map<String, Number> value() {
        return metricList.stream()
                .map(Metric::value)
                .flatMap(m -> m.entrySet().stream())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    @Override
    public void registerModification(Modification modification) {
        metricList.forEach(m -> m.registerModification(modification));
    }

    @Override
    public void registerCommit(Commit commit) {
        metricList.forEach(m -> m.registerCommit(commit));
    }

    @Override
    public Number value(String metricName) {
        return metricList.stream()
                .filter(m -> m.value().containsKey(metricName))
                .findFirst()
                .map(m -> m.value(metricName))
                .orElseThrow(() -> new RuntimeException("metric " + metricName + " not found."));
    }
}
