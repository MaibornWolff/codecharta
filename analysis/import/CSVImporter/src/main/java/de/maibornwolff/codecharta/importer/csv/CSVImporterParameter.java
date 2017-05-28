package de.maibornwolff.codecharta.importer.csv;

import java.util.regex.Pattern;

/**
 * Created by DominikU on 28.05.2017.
 */
public class CSVImporterParameter {
    private final Pattern FLOAT_PATTERN = Pattern.compile("\\d+[,.]?\\d*");
    private final char PATH_SEPERATOR = '\\';
    private final char CSV_DELIMITER = ',';

    private int pathColumn = 3;
    private int metricColumnStart = 4;

    public CSVImporterParameter(int pathColumn, int metricColumnStart) {
        this.pathColumn = pathColumn;
        this.metricColumnStart = metricColumnStart;
    }

    public char getCSV_DELIMITER() {
        return CSV_DELIMITER;
    }

    public int getPathColumn() {
        return pathColumn;
    }

    public int getMetricColumnStart() {
        return metricColumnStart;
    }

    public Pattern getFloatPattern() {
        return FLOAT_PATTERN;
    }

    public char getPATH_SEPERATOR() {
        return PATH_SEPERATOR;
    }
}
