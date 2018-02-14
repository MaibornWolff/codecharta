package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogNumstatRawParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogRawParserStrategy;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.Project;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collection;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(Parameterized.class)
public class SCMLogProjectCreatorTest {

    @Parameterized.Parameter
    public String testName;

    @Parameterized.Parameter(1)
    public LogParserStrategy strategy;

    @Parameterized.Parameter(2)
    public String logFilename;

    @Parameterized.Parameter(3)
    public long expectedProjectSize;

    private MetricsFactory metricsFactory = new MetricsFactory();
    private ProjectConverter projectConverter = new ProjectConverter(false, "");

    @Parameterized.Parameters(name = "{index}: {0}")
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][]{
               // {"--name-status", new GitLogParserStrategy(), "codecharta_git.log", 358L},
               // {"--raw", new GitLogRawParserStrategy(), "codecharta_git_raw.log", 358L},
                {"--numstat --raw", new GitLogNumstatRawParserStrategy(), "codecharta_git_numstat_raw.log", 358L},
                {"--numstat", new GitLogNumstatParserStrategy(), "codecharta_git_numstat.log", 472L}
        });
    }

    private static long projectSize(Project project) {
        return project.getNodes().isEmpty() ? 0 : project.getNodes().get(0).getLeaves().size();
    }

    private static void assertNodesValid(Project project) {
        Collection<Node> leaves = project.getNodes().get(0).getLeaves().values();
        leaves.stream()
                .flatMap(l -> l.getAttributes().entrySet().stream())
                .forEach(v -> assertThat(((Number) v.getValue()).doubleValue())
                        .as("attribute %s non positive (%s)", v.getKey(), v.getValue())
                        .isGreaterThanOrEqualTo(0));
    }

    @Test
    public void logParserGitExampleTest() throws Exception {
        // given
        SCMLogProjectCreator gitSCMLogProjectCreator = new SCMLogProjectCreator(
                strategy,
                metricsFactory,
                projectConverter
        );
        Stream logStream =
                Files.lines(Paths.get(this.getClass().getClassLoader().getResource(logFilename).toURI()));

        // when
        Project gitProject = gitSCMLogProjectCreator.parse(logStream);

        // then
        assertThat(gitProject)
                .extracting(SCMLogProjectCreatorTest::projectSize)
                .containsExactly(expectedProjectSize);
        assertNodesValid(gitProject);
    }

}