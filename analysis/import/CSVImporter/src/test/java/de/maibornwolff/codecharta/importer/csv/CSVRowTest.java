package de.maibornwolff.codecharta.importer.csv;

import com.google.common.collect.ImmutableMap;
import org.junit.Test;

import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasSize;

public class CSVRowTest {
    private static final char PATH_SEPARATOR = '\\';

    @Test
    public void getPath_should_return_path_from_specified_path_column() {
        // given
        String name = "someNodeName";
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "head4", "attrib"});
        String[] csvRow = new String[]{"projectName", "blubb2", "blubb3", name};

        // when
        CSVRow row = new CSVRow(csvRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getPath(), is(name));
    }

    @Test
    public void getFileName_should_return_filename_from_specified_path_column() {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "head4", "attrib"});
        Map nameExpectedFilenameMap = ImmutableMap.of(
                "someNodeName", "someNodeName",
                "someDir\\someName", "someName",
                "someDir\\anotherDir\\anotherName", "anotherName");

        for (Object name : nameExpectedFilenameMap.keySet()) {
            // when
            CSVRow row = new CSVRow(new String[]{"projectName", "blubb2", "blubb3", (String) name}, header, PATH_SEPARATOR);
            // then
            assertThat(row.getFileName(), is(nameExpectedFilenameMap.get(name)));
        }
    }

    @Test
    public void getFolderWithFile_should_return_folderWithFile_from_specified_path_column() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "head4", "attrib"});
        Map nameExpectedFolderWithFileMap = ImmutableMap.of(
                "someNodeName", "",
                "someDir\\someName", "someDir\\",
                "someDir\\anotherDir\\anotherName", "someDir\\anotherDir\\");

        for (Object name : nameExpectedFolderWithFileMap.keySet()) {
            // when
            CSVRow row = new CSVRow(new String[]{"projectName", "blubb2", "blubb3", (String) name}, header, PATH_SEPARATOR);
            // then
            assertThat(row.getFolderWithFile(), is(nameExpectedFolderWithFileMap.get(name)));
        }
    }

    @Test
    public void getAttributes_should_read_float_from_metric_column() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "head4", "attrib"});
        String[] rawRow = new String[]{"projectName", "blubb2", "blubb3", "name", "3,2"};

        // when
        CSVRow row = new CSVRow(rawRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(1));
        assertThat(row.getAttributes().get("attrib"), is(3.2f));
    }

    @Test
    public void getAttributes_should_ignore_string_in_metric_column() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "head4", "attrib"});
        String[] rawRow = new String[]{"projectName", "blubb2", "blubb3", "name", "3bla"};

        // when
        CSVRow row = new CSVRow(rawRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(0));
    }

    @Test
    public void getAttributes_should_ignore_column_if_no_attributeName_in_head() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "head4"});
        String[] rawRow = new String[]{"projectName", "blubb2", "blubb3", "name", "3,0"};

        // when
        CSVRow row = new CSVRow(rawRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(0));
    }

    @Test(expected = IllegalArgumentException.class)
    public void should_throw_exception_if_no_path_column_present() {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "head4"});

        // when
        new CSVRow(new String[]{"", ""}, header, PATH_SEPARATOR);

        // then throw
    }
}