package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

public interface Metric<T extends Number> {
    String metricName();

    T value();
}
