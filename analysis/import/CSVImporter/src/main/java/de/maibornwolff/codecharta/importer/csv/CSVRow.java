package de.maibornwolff.codecharta.importer.csv;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class CSVRow {
    private static final Pattern FLOAT_PATTERN = Pattern.compile("\\d+[,.]?\\d*");

    private final String[] row;
    private final CSVHeader header;
    private final char pathSeparator;

    public CSVRow(String[] row, CSVHeader header, char pathSeparator) {
        if (row.length <= header.getPathColumn()) {
            throw new IllegalArgumentException(
                    "Row " + Arrays.toString(row) + " has no column containing the file path. Should be in " + header.getPathColumn() + "th column.");
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

    private boolean validAttributeOfRow(int i) {
        return i < row.length && row[i] != null && FLOAT_PATTERN.matcher(row[i]).matches();
    }

    public Map<String, Object> getAttributes() {
        Function<Integer, String> attributeNameLambda = i -> header.getColumnName(i);
        Function<Integer, Object> attributeValueLambda = i -> Float.parseFloat(row[i].replace(',', '.'));

        return header.getColumnNumbers()
                .stream()
                .filter(this::validAttributeOfRow)
                .collect(
                        Collectors.toMap(
                                attributeNameLambda,
                                attributeValueLambda
                        )
                );
    }
}
