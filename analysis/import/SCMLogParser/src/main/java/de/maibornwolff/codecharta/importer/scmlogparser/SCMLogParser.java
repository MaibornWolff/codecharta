package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.importer.scmlogparser.parser.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParser;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.SVNLogParserStrategy;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;

import java.io.IOException;

public class SCMLogParser {

    public static void main(String[] args) throws IOException {
        if (args.length >= 1) {
            if (args[0].equals("-help") || args[0].equals("--help")) {
                showHelpAndTerminate();
            }
        }
        if (args.length >= 2) {
            String pathToLog = args[0];
            String gitOrSvn = args[1];

            Project project = parseDataFromLog(pathToLog, gitOrSvn);
            if (args.length >= 3) {
                ProjectSerializer.serializeProjectAndWriteToFile(project, args[2]);
            } else {
                ProjectSerializer.serializeProjectAndWriteToFile(project, "./parsedLog.cc.json");
            }
        } else {
            showErrorAndTerminate();
        }
    }

    private static Project parseDataFromLog(String pathToLog, String gitOrSvn) {
        LogParserStrategy parserStrategy = null;
        switch (gitOrSvn) {
            case "-git":
                parserStrategy = new GitLogParserStrategy();
                break;
            case "-svn":
                parserStrategy = new SVNLogParserStrategy();
                break;
            default:
                showErrorAndTerminate();
        }
        return new LogParser(parserStrategy).parse(pathToLog);
    }

    private static void showErrorAndTerminate() {
        System.out.println("Invalid arguments!\n");
        showHelpAndTerminate();
    }

    private static void showHelpAndTerminate() {
        System.out.println("Please use the following syntax\n\"SCMLogParser-x.x.jar <pathToLogFile> -git/-svn\" [<pathToOutputfile>]\n" +
                "The log file must have been created by using \"svn log --verbose\" or \"git log --name-status\"\n" +
                "If no output file was specified, the output will be stored in \"./parsedLog.json\"");
        System.exit(0);
    }

}
