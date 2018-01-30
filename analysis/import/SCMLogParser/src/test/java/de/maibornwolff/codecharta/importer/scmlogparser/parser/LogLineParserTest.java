package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import org.junit.Test;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class LogLineParserTest {

    @Test
    public void parseCommitRaisesExceptionWhenAuthorIsMissing() {
        // given
        MetricsFactory metricsFactory = mock(MetricsFactory.class);
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        when(parserStrategy.parseAuthor(any())).thenReturn(Optional.empty());
        when(parserStrategy.parseDate(any())).thenReturn(Optional.of(OffsetDateTime.now()));
        when(parserStrategy.parseModifications(any())).thenReturn(Collections.emptyList());
        LogLineParser parser = new LogLineParser(parserStrategy, metricsFactory);

        // when & then
        assertThatThrownBy(() -> parser.parseCommit(Collections.emptyList())).isInstanceOf(RuntimeException.class);
    }

    @Test
    public void parseCommitRaisesExceptionWhenCommitDateIsMissing() {
        // given
        MetricsFactory metricsFactory = mock(MetricsFactory.class);
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        when(parserStrategy.parseAuthor(any())).thenReturn(Optional.of("An Author"));
        when(parserStrategy.parseDate(any())).thenReturn(Optional.empty());
        when(parserStrategy.parseModifications(any())).thenReturn(Collections.emptyList());
        LogLineParser parser = new LogLineParser(parserStrategy, metricsFactory);

        // when & then
        assertThatThrownBy(() -> parser.parseCommit(Collections.emptyList())).isInstanceOf(RuntimeException.class);
    }

    @Test
    public void parseCommit() {
        // given
        MetricsFactory metricsFactory = mock(MetricsFactory.class);
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        String author = "An Author";
        OffsetDateTime commitDate = OffsetDateTime.now();
        List<String> filenames = Arrays.asList("src/Main.java", "src/Util.java");
        List<String> input = Collections.emptyList();
        when(parserStrategy.parseAuthor(input)).thenReturn(Optional.of(author));
        when(parserStrategy.parseDate(input)).thenReturn(Optional.of(commitDate));
        when(parserStrategy.parseModifications(input))
                .thenReturn(filenames.stream().map(Modification::new).collect(Collectors.toList()));
        LogLineParser parser = new LogLineParser(parserStrategy, metricsFactory);

        // when
        Commit commit = parser.parseCommit(input);

        //then
        assertThat(commit.getAuthor()).isEqualTo(author);
        assertThat(commit.getFilenames()).isEqualTo(filenames);
        assertThat(commit.getCommitDate()).isEqualTo(commitDate);
    }
}