package de.maibornwolff.codecharta.importer.csv;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class CSVRow {
    private static final int FILE_COL = 3;
    private static final int METRICS_START = 4;
    private static final Pattern FLOAT_PATTERN = Pattern.compile("\\d+[,.]?\\d*");
    private static final char PATH_SEP = '\\';

    private final String[] row;
    private final String[] header;

    public CSVRow(String[] row, String[] header) {
        if (row.length <= FILE_COL) {
            throw new IllegalArgumentException("Row length of csv is " + row.length + " (expected > " + FILE_COL + ")");
        }

        this.row = row;
        this.header = header;
    }

    public String getPath() {
        return row[FILE_COL];
    }

    public String getFileName() {
        String path = getPath();
        return path.substring(path.lastIndexOf(PATH_SEP) + 1);
    }

    public String getFolderWithFile() {
        String path = getPath();
        return path.substring(0, path.lastIndexOf(PATH_SEP) + 1);
    }


    public Map<String, Object> getAttributes() {
        Map<String, Object> metrics = new HashMap<>();
        for (int i = METRICS_START; i < row.length && i < header.length; ++i) {
            if (row[i] != null && FLOAT_PATTERN.matcher(row[i]).matches()) {
                metrics.put(header[i], Float.parseFloat(row[i].replace(',', '.')));
            }
        }
        return metrics;
    }
}
