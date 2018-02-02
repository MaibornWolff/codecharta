package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class MedianCoupledFiles implements Metric {
    private final List<Integer> numberCommitedFiles = new ArrayList<>();

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
        return "Median Coupled Files: Median of number of other files that where commited with this file.";
    }

    @Override
    public String metricName() {
        return "median_coupled_files";
    }

    @Override
    public Number value() {
        return median(
                numberCommitedFiles.stream()
                        .map(v -> (double) v)
        );
    }

    @Override
    public void registerCommit(Commit commit) {
        numberCommitedFiles.add(commit.getModifications().size() - 1);
    }

}
