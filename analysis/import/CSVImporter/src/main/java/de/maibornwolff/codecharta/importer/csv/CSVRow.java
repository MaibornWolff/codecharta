package de.maibornwolff.codecharta.importer.csv;

import java.util.HashMap;
import java.util.Map;

public class CSVRow {

    private final String[] row;
    private final String[] header;
    private final CSVImporterParameter callParameter;

    public CSVRow(String[] row, String[] header, CSVImporterParameter callParameter) {
        this.callParameter = callParameter;
        if (row.length <= callParameter.getPathColumn()) {
            throw new IllegalArgumentException("Row length of csv is " + row.length + " (expected > " + callParameter.getPathColumn() + ")");
        }

        this.row = row;
        this.header = header;
    }

    public String getPath() {
        return row[callParameter.getPathColumn()];
    }

    public String getFileName() {
        String path = getPath();
        return path.substring(path.lastIndexOf(callParameter.getPATH_SEPERATOR()) + 1);
    }

    public String getFolderWithFile() {
        String path = getPath();
        return path.substring(0, path.lastIndexOf(callParameter.getPATH_SEPERATOR()) + 1);
    }


    public Map<String, Object> getAttributes() {
        Map<String, Object> metrics = new HashMap<>();
        for (int i = callParameter.getMetricColumnStart(); i < row.length && i < header.length; ++i) {
            if (row[i] != null && callParameter.getFloatPattern().matcher(row[i]).matches()) {
                metrics.put(header[i], Float.parseFloat(row[i].replace(',', '.')));
            }
        }
        return metrics;
    }
}
