package de.maibornwolff.codecharta.importer.csv;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class CSVHeader {
    public static final String PATH_COLUMN_NAME = "path";
    private final Map<Integer, String> headerMap;

    public CSVHeader(String[] header) {
        headerMap = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            if (header[i] == null || header[i].isEmpty()) {
                System.err.println("Ignoring column number " + i + " (counting from 0) as it has no column name.");
            } else if (headerMap.containsValue(header[i])) {
                System.err.println("Ignoring column number " + i + " (counting from 0) with column name " + header[i] + " as it duplicates a previous column.");
            } else {
                headerMap.put(i, header[i]);
            }
        }

        if (headerMap.isEmpty()) {
            throw new IllegalArgumentException("Header is empty.");
        }
    }

    public Set<Integer> getColumnNumbers() {
        return headerMap.keySet();
    }

    public String getColumnName(int i) {
        String columnName = headerMap.get(i);
        if (columnName == null) {
            throw new IllegalArgumentException("No " + i + "th column present.");
        }
        return columnName;
    }

    public int getPathColumn() {
        return headerMap.keySet().stream()
                .filter(i -> headerMap.get(i).equalsIgnoreCase(PATH_COLUMN_NAME))
                .findFirst()
                .orElse(headerMap.keySet().stream().findFirst().get());
    }
}
