package de.maibornwolff.codecharta.importer.sonar.model;

public class Measure {
    private final String metric;

    private final String value;

    public Measure(String metric, String value) {
        this.metric = metric;
        this.value = value;
    }

    public String getMetric() {
        return metric;
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Measure measure = (Measure) o;

        if (metric != null ? !metric.equals(measure.metric) : measure.metric != null) return false;
        return value != null ? value.equals(measure.value) : measure.value == null;
    }

    @Override
    public int hashCode() {
        int result = metric != null ? metric.hashCode() : 0;
        result = 31 * result + (value != null ? value.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Measure{" +
                "metric='" + metric + '\'' +
                ", value='" + value + '\'' +
                '}';
    }
}
