package de.maibornwolff.codecharta.importer.sourcemonitor;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;

import java.util.ArrayList;
import java.util.List;

public class SourceMonitorImporterParameter {
    private final JCommander jc;

    @Parameter(names = {"-p", "--projectName"}, description = "Project name")
    private String projectName = "testProject";

    @Parameter(description = "[file]")
    private List<String> files = new ArrayList<>();

    @Parameter(names = {"-h", "--help"}, description = "This help text", help = true)
    private boolean help = false;

    public SourceMonitorImporterParameter(String[] args) {
        this.jc = new JCommander(this);
        this.jc.parse(args);
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
