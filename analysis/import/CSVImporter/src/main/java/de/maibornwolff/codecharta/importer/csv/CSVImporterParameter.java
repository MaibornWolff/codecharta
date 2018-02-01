package de.maibornwolff.codecharta.importer.csv;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;

import java.util.ArrayList;
import java.util.List;

public class CSVImporterParameter {
    private final JCommander jc;

    @Parameter(names = {"-d", "--delimeter"}, description = "delimeter in csv file")
    private String csvDelimiter = ",";

    @Parameter(names = {"-p", "--projectName"}, description = "Project name")
    private String projectName = "SCMLogParser";

    @Parameter(names = {"--backslash"}, description = "Backslash is used as path separator")
    private boolean backslashPathSeparator = false;

    @Parameter(description = "[file]")
    private List<String> files = new ArrayList<>();

    @Parameter(names = {"-h", "--help"}, description = "This help text", help = true)
    private boolean help = false;

    public CSVImporterParameter(String[] args) {
        this.jc = new JCommander(this);
        this.jc.parse(args);
    }

    public char getPathSeparator() {
        return backslashPathSeparator ? '\\' : '/';
    }

    public char getCsvDelimiter() {
        return csvDelimiter.charAt(0);
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

    public String getProjectName() {
        return projectName;
    }
}
