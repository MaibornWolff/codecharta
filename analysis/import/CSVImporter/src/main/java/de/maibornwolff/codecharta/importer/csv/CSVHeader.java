package de.maibornwolff.codecharta.importer.csv;

import java.util.Arrays;
import java.util.List;

/**
 * Created by DominikU on 28.05.2017.
 */
public class CSVHeader {
    private List<String> header;

    public CSVHeader(String[] header) {
        this.header = Arrays.asList(header);
    }

    public int length() {
        return header.size();
    }

    public String getColumnName(int i) {
        return header.get(i);
    }

    public int getPathColumn() {
        //return header.indexOf("File Name");
        return 3;
    }
}
