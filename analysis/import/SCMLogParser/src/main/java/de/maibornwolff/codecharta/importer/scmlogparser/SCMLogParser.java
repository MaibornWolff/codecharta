package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.importer.scmlogparser.parser.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParser;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.SVNLogParserStrategy;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;

public class SCMLogParser {

    public static void main(String[] args) throws IOException {
        if (args.length >= 1) {
            if (args[0].equals("-h") || args[0].equals("--help")) {
                showHelpAndTerminate();
            }
        }
        if (args.length >= 2) {
            String pathToLog = args[0];
            String gitOrSvn = args[1];

            String outputFile = null;

            boolean containsAuthors = false;

            if (args.length >= 3) {
                if ("--a".equals(args[2])) {
                    containsAuthors = true;
                    if (args.length >= 4) {
                        outputFile = args[3];
                    }
                } else {
                    outputFile = args[2];
                }
            }

            Project project = parseDataFromLog(pathToLog, gitOrSvn, containsAuthors);
            if (outputFile != null) {
                ProjectSerializer.serializeProjectAndWriteToFile(project, outputFile);
            } else {
                ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));
            }
        } else {
            showErrorAndTerminate();
        }
    }

    private static Project parseDataFromLog(String pathToLog, String gitOrSvn, boolean containsAuthors) throws IOException {
        LogParserStrategy parserStrategy = null;
        switch (gitOrSvn) {
            case "--git":
                parserStrategy = new GitLogParserStrategy();
                break;
            case "--svn":
                parserStrategy = new SVNLogParserStrategy();
                break;
            default:
                showErrorAndTerminate();
        }
        Stream<String> lines = Files.lines(Paths.get(pathToLog));
        return new LogParser(parserStrategy, containsAuthors).parse(lines);
    }

    private static void showErrorAndTerminate() {
        System.out.println("Invalid arguments!\n");
        showHelpAndTerminate();
    }

    private static void showHelpAndTerminate() {
        System.out.println("Please use the following syntax\n\"SCMLogParser-x.x.jar <pathToLogFile> --git/--svn [--a] [<pathToOutputfile>]\"\n" +
                "The log file must have been created by using \"svn log --verbose\" or \"git log --name-status\"\n" +
                "Set the --a parameter to add an array of authors to every file of your output\n" +
                "If no output file was specified, the output will be piped to standard out");
        System.exit(0);
    }

}
