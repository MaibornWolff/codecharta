package de.maibornwolff.codecharta.importer.sourcemonitor;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import de.maibornwolff.codecharta.importer.csv.CSVProjectAdapter;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;

import java.io.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SourceMonitorImporter {
    public static final char CSV_DELIMITER = ',';
    public static final char PATH_SEPARATOR = '\\';

    public static MetricNameTranslator getSourceMonitorReplacement() {
        String prefix = "sm_";
        Map replacementMap = new HashMap<String, String>();
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

    public static void main(String... args) throws IOException {
        SourceMonitorImporterParameter callParameter = new SourceMonitorImporterParameter(args);

        if (callParameter.isHelp()) {
            callParameter.printUsage();
        } else {
            CSVProjectAdapter project = new CSVProjectAdapter(callParameter.getProjectName(), PATH_SEPARATOR, CSV_DELIMITER);
            getInputStreamsFromArgs(callParameter.getFiles()).forEach(in -> project.addProjectFromCsv(in, getSourceMonitorReplacement()));
            ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));
        }
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
}

