package de.maibornwolff.codecharta.importer.csv;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class CSVRow {
    private static final Pattern FLOAT_PATTERN = Pattern.compile("\\d+[,.]?\\d*");

    private final String[] row;
    private final CSVHeader header;
    private final char pathSeparator;

    public CSVRow(String[] row, CSVHeader header, char pathSeparator) {
        if (row.length <= header.getPathColumn()) {
            throw new IllegalArgumentException("Row " + Arrays.toString(row) + " has no column containing the file path. Should be in " + header.getPathColumn() + "th column.");
        }

        this.pathSeparator = pathSeparator;
        this.row = row;
        this.header = header;
    }

    public String getPath() {
        return row[header.getPathColumn()];
    }

    public String getFileName() {
        String path = getPath();
        return path.substring(path.lastIndexOf(pathSeparator) + 1);
    }

    public String getFolderWithFile() {
        String path = getPath();
        return path.substring(0, path.lastIndexOf(pathSeparator) + 1);
    }


    public Map<String, Object> getAttributes() {
        Map<String, Object> metrics = new HashMap<>();
        for (int i = 0; i < row.length && i < header.length(); ++i) {
            if (row[i] != null && FLOAT_PATTERN.matcher(row[i]).matches()) {
                metrics.put(header.getColumnName(i), Float.parseFloat(row[i].replace(',', '.')));
            }
        }
        return metrics;
    }
}
