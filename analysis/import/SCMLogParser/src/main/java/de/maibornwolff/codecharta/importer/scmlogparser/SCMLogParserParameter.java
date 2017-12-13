package de.maibornwolff.codecharta.importer.scmlogparser;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.svn.SVNLogParserStrategy;

import java.util.ArrayList;
import java.util.List;

public class SCMLogParserParameter {
    private final JCommander jc;
    @Parameter(description = "[file]")
    private List<String> files = new ArrayList<>();
    @Parameter(names = {"-o", "--outputFile"}, description = "Output File (or empty for stdout)")
    private String outputFile = "";
    @Parameter(names = {"--git"}, description = "Analysis of git log, created via \""
            + GitLogParserStrategy.CORRESPONDING_LOG_CREATION_CMD + "\"")
    private boolean gitLog = false;
    @Parameter(names = {"--svn"}, description = "Analysis of svn log, created via \""
            + SVNLogParserStrategy.CORRESPONDING_LOG_CREATION_CMD + "\"")
    private boolean svnLog = false;
    @Parameter(names = {"--add-author"}, description = "Add an array of authors to every file")
    private boolean addAuthor = false;
    @Parameter(names = {"-h", "--help"}, description = "This help text", help = true)
    private boolean help = false;

    public SCMLogParserParameter(String[] args) {
        this.jc = new JCommander(this, args);
    }

    public List<String> getFiles() {
        return files;
    }

    public boolean isHelp() {
        return help;
    }

    public String getOutputFile() {
        return outputFile;
    }

    public boolean isAddAuthor() {
        return addAuthor;
    }

    public void printUsage() {
        jc.usage();
    }

    public SCM getSCM() {
        if (gitLog && !svnLog) {
            return SCM.GIT;
        } else if (svnLog && !gitLog) {
            return SCM.SVN;
        } else {
            throw new IllegalArgumentException("one and only one of --git or --svn must be set");
        }
    }

    public enum SCM {
        GIT, SVN
    }
}
