package de.maibornwolff.codecharta.importer.scmlogparser.converter.projectmetrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.VersionControlledFile;
import org.apache.commons.math3.stat.correlation.PearsonsCorrelation;
import org.apache.commons.math3.stat.correlation.SpearmansCorrelation;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ProjectCorrelationMetrics implements ProjectMetric {
    private static List<String> getMetricNameList(List<VersionControlledFile> vcFiles) {
        return vcFiles.stream()
                .flatMap(m -> m.getMetricsMap().keySet().stream())
                .distinct()
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Number> value(List<VersionControlledFile> vcFiles) {
        return computeCorrelationDescriptions(vcFiles).stream()
                .filter(x -> !Double.isNaN(x.correlation))
                .collect(Collectors.toMap(CorrelationDescription::getName, CorrelationDescription::getCorrelation));
    }

    private List<CorrelationDescription> computeCorrelationDescriptions(List<VersionControlledFile> vcFiles) {
        final List<String> metricNames = getMetricNameList(vcFiles);
        final List<CorrelationDescription> correlationDescriptions = new ArrayList<>();
        for (String metric1 : metricNames) {
            for (String metric2 : metricNames) {
                if (metric1.compareTo(metric2) < 0) {
                    correlationDescriptions.addAll(computeCorrelationDescriptions(vcFiles, metric1, metric2));
                }
            }
        }
        return correlationDescriptions;
    }

    private List<CorrelationDescription> computeCorrelationDescriptions(
            List<VersionControlledFile> vcFiles,
            String metricNameX,
            String metricNameY) {

        int vcFilesSize = vcFiles.size();

        double[] x = new double[vcFilesSize];
        double[] y = new double[vcFilesSize];

        for (int i = 0; i < vcFilesSize; i++) {
            if (vcFiles.get(i).getMetricsMap().keySet().contains(metricNameX)
                    && vcFiles.get(i).getMetricsMap().keySet().contains(metricNameY)) {
                x[i] = vcFiles.get(i).getMetricValue(metricNameX).doubleValue();
                y[i] = vcFiles.get(i).getMetricValue(metricNameY).doubleValue();
            } else {
                x[i] = 0;
                y[i] = 0;
            }
        }
        double pearsonsCorrelation = new PearsonsCorrelation().correlation(x, y);
        double spearmansCorrelation = new SpearmansCorrelation().correlation(x, y);

        return Arrays.asList(
                new CorrelationDescription("pearson", metricNameX, metricNameY, pearsonsCorrelation),
                new CorrelationDescription("spearman", metricNameX, metricNameY, spearmansCorrelation)
        );
    }

    private static final class CorrelationDescription {
        public static final String SEP = "-";
        private static final String outputFormat = "%s, %s, %s, %f";
        private final String correlationMetric;
        private final String metric1;
        private final String metric2;
        private final double correlation;

        private CorrelationDescription(String correlationMetric, String metric1, String metric2, double correlation) {
            this.correlationMetric = correlationMetric;
            this.metric1 = metric1;
            this.metric2 = metric2;
            this.correlation = correlation;
        }

        public String getName() {
            return correlationMetric + SEP + metric1 + SEP + metric2;
        }

        public double getCorrelation() {
            return correlation;
        }

        @Override
        public String toString() {
            return String.format(outputFormat, correlationMetric, metric1, metric2, correlation);
        }
    }
}
