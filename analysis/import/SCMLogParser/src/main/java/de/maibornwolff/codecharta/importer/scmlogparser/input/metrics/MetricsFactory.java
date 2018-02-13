package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class MetricsFactory {

    private final List<Class<? extends Metric>> metricClasses;

    public MetricsFactory() {
        this.metricClasses = createAllMetrics().stream()
                .map(Metric::getClass)
                .collect(Collectors.toList());
    }

    public MetricsFactory(List<String> metricNames) {
        this.metricClasses = createAllMetrics().stream()
                .filter(m -> metricNames.contains(m.metricName()))
                .map(Metric::getClass)
                .collect(Collectors.toList());

    }

    private static Metric createMetric(Class<? extends Metric> clazz) {
        try {
            return clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            throw new IllegalArgumentException("metric " + clazz + " not found.");
        }
    }

    private List<Metric> createAllMetrics() {
        return Arrays.asList(
                new AbsoluteCodeChurn(),
                new LinesOfCode(),
                new NumberOfAuthors(),
                new NumberOfOccurencesInCommits(),
                new RangeOfWeeksWithCommits(),
                new RelativeCodeChurn(),
                new SuccessiveWeeksWithCommits(),
                new WeeksWithCommits(),
                new HighlyCoupledFiles(),
                new MedianCoupledFiles(),
                new AbsoluteCoupledChurn(),
                new AverageCodeChurnPerCommit(),
                new AddQuotDel()
        );
    }

    public List<Metric> createMetrics() {
        return metricClasses.stream()
                .map(MetricsFactory::createMetric)
                .collect(Collectors.toList());
    }
}
