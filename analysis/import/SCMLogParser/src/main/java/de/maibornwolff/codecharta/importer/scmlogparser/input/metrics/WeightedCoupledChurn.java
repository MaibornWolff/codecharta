package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/*
 * experimental -> therefore no tests
 */
public final class WeightedCoupledChurn implements Metric {
    public static final double HIGH_COUPLING_VALUE = .35;
    public static final long MIN_NO_COMMITS_FOR_HIGH_COUPLING = 5L;

    private final Map<String, RelativeFileMetric> simultaneouslyCommitedFiles = new HashMap<>();
    private final List<Integer> numberCommitedFiles = new ArrayList<>();
    private long numberOfCommits = 0;

    private static double median(Stream<Double> values) {
        List<Double> list = values.sorted()
                .collect(Collectors.toList());

        int len = list.size();
        if (len == 0) {
            return 0;
        } else if (len % 2 == 0) {
            return (list.get(len / 2 - 1) + list.get(len / 2)) / 2d;
        }
        return list.get(len / 2);
    }

    @Override
    public String description() {
        return "";
    }

    @Override
    public String metricName() {
        return "weighted_coupled_churn";
    }

    /**
     * @return number of highly coupled files
     */
    private long highly_coupled() {
        return simultaneouslyCommitedFiles.entrySet().stream()
                .filter(entry -> isHighlyCoupled(entry.getValue()))
                .count();
    }

    private boolean isHighlyCoupled(RelativeFileMetric fileMetric) {
        if (numberOfCommits > MIN_NO_COMMITS_FOR_HIGH_COUPLING) {
            return (double) fileMetric.numberOfCommits / (double) numberOfCommits > HIGH_COUPLING_VALUE;
        }

        return false;
    }

    /**
     * @return maximal coupling of all coupled files
     */
    private long max_coupling() {
        return (long) simultaneouslyCommitedFiles.values().stream()
                .map(m -> m.numberOfCommits)
                .filter(x -> x < numberOfCommits)
                .mapToDouble(v -> v.doubleValue() / (double) numberOfCommits * 100d)
                .max().orElse(0d);
    }

    /**
     * @return expected coupled churn when the given file is modified
     */
    @Override
    public Number value() {
        return simultaneouslyCommitedFiles.values().stream()
                .filter(m -> m.churn < numberOfCommits)
                .map(m -> (double) m.churn * (double) m.numberOfCommits / (double) numberOfCommits)
                .mapToLong(Double::longValue)
                .sum();
    }

    /**
     * @return number of lines that where modified when the given file was modified
     */
    private long coupled_churn() {
        return simultaneouslyCommitedFiles.values().stream()
                .map(m -> m.churn)
                .mapToLong(Long::longValue)
                .sum();
    }

    /**
     * @return expected number of files that are modified when the given file is modified
     */
    private double median_coupled_files() {
        return median(
                numberCommitedFiles.stream()
                        .map(v -> (double) v)
        );
    }

    @Override
    public void registerCommit(Commit commit) {
        numberOfCommits++;
        commit.getModifications()
                .forEach(
                        mod -> {
                            if (!simultaneouslyCommitedFiles.containsKey(mod.getFilename())) {
                                simultaneouslyCommitedFiles.put(mod.getFilename(), new RelativeFileMetric());
                            }
                            simultaneouslyCommitedFiles.get(mod.getFilename()).registerModification(mod);
                        }
                );
        numberCommitedFiles.add(commit.getModifications().size() - 1);
    }

    private static class RelativeFileMetric {
        private long numberOfCommits = 0;
        private long churn = 0;

        private void registerModification(Modification mod) {
            numberOfCommits++;
            churn += mod.getAdditions() + mod.getDeletions();
        }
    }

}
