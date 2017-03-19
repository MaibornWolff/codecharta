package de.maibornwolff.codecharta.importer.sourcemon;

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;

import java.io.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class SourcemonCsvImporter {
    public static void main(String... args) throws IOException {
        if (args.length == 0) {
            System.out.println("Usage: sourceMonitorImporter <sourcemon-1.csv> <sourcemon-2.csv> ... <sourcemon-n.csv>");
            System.exit(0);
        }

        SourceMonitorProjectAdapter project = new SourceMonitorProjectAdapter("test");
        getInputStreamsFromArgs(args).forEach(project::addSourceMonitorProjectFromCsv);
        ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));
    }

    private static List<InputStream> getInputStreamsFromArgs(String[] args) {
        List<InputStream> fileList = Arrays.stream(args).map(SourcemonCsvImporter::createFileInputStream).collect(Collectors.toList());
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

