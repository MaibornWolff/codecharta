package de.maibornwolff.codecharta.importer.csv;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;

import java.util.ArrayList;
import java.util.List;

public class CSVImporterParameter {
    private final JCommander jc;

    private final char pathSeparator = '\\';

    @Parameter(names = {"--csvDelimiter"})
    private char csvDelimiter = ',';

    @Parameter(description = "[file]")
    private List<String> files = new ArrayList<>();

    @Parameter(names = {"-h", "--help"}, description = "This help text", help = true)
    private boolean help = false;

    public CSVImporterParameter(String[] args) {
        this.jc = new JCommander(this, args);
    }

    public char getPathSeparator() {
        return pathSeparator;
    }

    public char getCsvDelimiter() {
        return csvDelimiter;
    }

    public List<String> getFiles() {
        return files;
    }

    public boolean isHelp() {
        return help;
    }

    public void printUsage() {
        jc.usage();
    }
}
