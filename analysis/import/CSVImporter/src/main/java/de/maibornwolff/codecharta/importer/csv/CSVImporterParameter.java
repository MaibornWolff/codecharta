package de.maibornwolff.codecharta.importer.csv;

import java.util.regex.Pattern;

/**
 * Created by DominikU on 28.05.2017.
 */
public class CSVImporterParameter {

    private final char CSV_DELIMITER = ',';
    private int PATH_COLUMN = 3;
    private int METRIC_COLUMN_START = 4;
    private Pattern FLOAT_PATTERN = Pattern.compile("\\d+[,.]?\\d*");
    private char PATH_SEPARATOR = '\\';

    public char getCsvDelimiter() {
        return CSV_DELIMITER;
    }

    public int getPathColumn() {
        return PATH_COLUMN;
    }

    public int getMetricColumnStart() {
        return METRIC_COLUMN_START;
    }

    public Pattern getFloatPattern() {
        return FLOAT_PATTERN;
    }

    public char getPathSeparator() {
        return PATH_SEPARATOR;
    }
}
