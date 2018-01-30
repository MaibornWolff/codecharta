package de.maibornwolff.codecharta.importer.csv;

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;
import picocli.CommandLine;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;

@CommandLine.Command(name = "csvimport",
        description = "generates cc.json from csv with header",
        footer = "Copyright(c) 2018, MaibornWolff GmbH"
)
public class CSVImporter implements Callable<Void> {

    @CommandLine.Option(names = {"-h", "--help"}, usageHelp = true, description = "displays this help and exits")
    private Boolean help = false;

    @CommandLine.Option(names = {"-d", "--delimeter"}, description = "delimeter in csv file")
    private char csvDelimiter = ',';

    @CommandLine.Option(names = {"-p", "--projectName"}, description = "project name")
    private String projectName = "SCMLogParser";

    @CommandLine.Option(names = "--pathSeparator", description = "path separator (default = '/')")
    private char pathSeparator = '/';

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = "csv files")
    private List<String> files = new ArrayList<>();

    public static void main(String... args) {
        CommandLine.call(new CSVImporter(), System.out, args);
    }

    private static List<InputStream> getInputStreamsFromArgs(List<String> files) {
        List<InputStream> fileList = files.stream().map(CSVImporter::createFileInputStream).collect(Collectors.toList());
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
        CSVProjectAdapter project = new CSVProjectAdapter(projectName, pathSeparator, csvDelimiter);
        getInputStreamsFromArgs(files).forEach(project::addProjectFromCsv);
        ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));

        return null;
    }
}

