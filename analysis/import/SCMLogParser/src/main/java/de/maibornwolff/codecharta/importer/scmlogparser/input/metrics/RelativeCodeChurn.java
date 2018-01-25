package de.maibornwolff.codecharta.importer.scmlogparser.input.metrics;

import com.google.common.collect.Lists;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;

import java.util.ArrayList;
import java.util.List;

/**
 * this is only an approximation of the correct code churn.
 */
public class RelativeCodeChurn implements Metric {
    private long accumulatedNumberOfLinesAdded = 0;
    private long accumulatedNumberOfLinesDeleted = 0;
    private List<SingleCodeChurn> codeChurns = new ArrayList<>();

    @Override
    public String description() {
        return "Relative Code Churn: Approximation for the quotient of absolute code churn and loc.";
    }

    @Override
    public String metricName() {
        return "rel_code_churn";
    }

    private long add_quot_deletion() {
        if (accumulatedNumberOfLinesDeleted > 0) {
            return 100 * accumulatedNumberOfLinesAdded / accumulatedNumberOfLinesDeleted;
        }
        return 100 * accumulatedNumberOfLinesAdded;
    }

    @Override
    public void registerModification(Modification modification) {
        codeChurns.add(new SingleCodeChurn(modification.getAdditions(), modification.getDeletions()));

        accumulatedNumberOfLinesAdded += modification.getAdditions();
        accumulatedNumberOfLinesDeleted += modification.getDeletions();
    }

    private long loc() {
        long loc = accumulatedNumberOfLinesAdded - accumulatedNumberOfLinesDeleted;
        return loc >= 0 ? loc : 0;
    }

    long absoluteCodeChurn() {
        return accumulatedNumberOfLinesAdded + accumulatedNumberOfLinesDeleted;
    }

    /**
     * @return codeChurn weighted by the maximal number of lines
     */
    @Override
    public Number value() {
        long relativeChurn;

        if (loc() > 0) {
            relativeChurn = absoluteCodeChurn() * 100 / loc();
        } else {
            relativeChurn = 0;
        }

        return relativeChurn;
    }

    long relativeCodeChurn2() {
        long accumulatedRelativeChurn = 0;
        long loc = 0;
        long maxLoc = 0;
        for (SingleCodeChurn churn : Lists.reverse(codeChurns)) {
            long absoluteChurn = churn.additions + churn.deletions;
            long singleLoc = churn.additions - churn.deletions;
            loc += Math.abs(singleLoc);
            if (singleLoc < 0) {
                maxLoc -= singleLoc;
            }
            if (loc > maxLoc) {
                maxLoc = loc;
            }
            accumulatedRelativeChurn += absoluteChurn;
        }

        return maxLoc > 0 ? 100 * accumulatedRelativeChurn / maxLoc : 0;
    }

    private static final class SingleCodeChurn {
        private final int additions;
        private final int deletions;

        private SingleCodeChurn(int additions, int deletions) {
            this.additions = additions;
            this.deletions = deletions;
        }
    }
}
