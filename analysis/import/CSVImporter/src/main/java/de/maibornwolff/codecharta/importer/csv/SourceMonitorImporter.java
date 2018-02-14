package de.maibornwolff.codecharta.importer.csv;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;
import picocli.CommandLine;

import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

@CommandLine.Command(name = "sourcemonitorimport",
        description = "generates cc.json from sourcemonitor csv",
        footer = "Copyright(c) 2018, MaibornWolff GmbH"
)
public class SourceMonitorImporter implements Callable<Void> {
    public static final char CSV_DELIMITER = ',';
    public static final char PATH_SEPARATOR = '\\';

    @CommandLine.Option(names = {"-h", "--help"}, usageHelp = true, description = "displays this help and exits")
    private Boolean help = false;

    @CommandLine.Option(names = {"-p", "--projectName"}, description = "project name")
    private String projectName = "testProject";

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = "sourcemonitor csv files")
    private List<String> files = new ArrayList<>();

    public static MetricNameTranslator getSourceMonitorReplacement() {
        String prefix = "sm_";
        Map<String, String> replacementMap = new HashMap<>();
        replacementMap.put("Project Name", ""); // should be ignored
        replacementMap.put("Checkpoint Name", ""); // should be ignored
        replacementMap.put("Created On", ""); // should be ignored
        replacementMap.put("File Name", "path");
        replacementMap.put("Lines", "loc");
        replacementMap.put("Statements", "statements");
        replacementMap.put("Classes and Interfaces", "classes");
        replacementMap.put("Methods per Class", "functions_per_classs");
        replacementMap.put("Average Statements per Method", "average_statements_per_function");
        replacementMap.put("Line Number of Most Complex Method*", ""); // should be ignored
        replacementMap.put("Name of Most Complex Method*", ""); // should be ignored
        replacementMap.put("Maximum Complexity*", "max_function_mcc");
        replacementMap.put("Line Number of Deepest Block", ""); // should be ignored
        replacementMap.put("Maximum Block Depth", "max_block_depth");
        replacementMap.put("Average Block Depth", "average_block_depth");
        replacementMap.put("Average Complexity*", "average_function_mcc");

        for (int i = 0; i < 10; i++) {
            replacementMap.put("Statements at block level " + i, "statements_at_level_" + i);
        }

        return new MetricNameTranslator(ImmutableMap.copyOf(replacementMap), prefix);
    }

    public static void main(String... args) {
        CommandLine.call(new SourceMonitorImporter(), System.out, args);

    }

    private static List<InputStream> getInputStreamsFromArgs(List<String> files) {
        List<InputStream> fileList = files.stream().map(SourceMonitorImporter::createFileInputStream).collect(Collectors.toList());
        return fileList.isEmpty() ? ImmutableList.of(System.in) : fileList;
    }

    private static FileInputStream createFileInputStream(String path) {
        try {
            return new FileInputStream(path);
        } catch (FileNotFoundException e) {
            throw new RuntimeException("File " + path + " not found.");
        }
    }

    @Override
    public Void call() throws IOException {
        CSVProjectAdapter project = new CSVProjectAdapter(projectName, PATH_SEPARATOR, CSV_DELIMITER);
        getInputStreamsFromArgs(files).forEach(in -> project.addProjectFromCsv(in, getSourceMonitorReplacement()));
        ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));

        return null;
    }
}

