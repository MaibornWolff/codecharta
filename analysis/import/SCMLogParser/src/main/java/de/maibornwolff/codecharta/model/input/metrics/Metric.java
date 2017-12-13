package de.maibornwolff.codecharta.model.input.metrics;

public interface Metric<T extends Number> {
    String metricName();

    T value();
}
