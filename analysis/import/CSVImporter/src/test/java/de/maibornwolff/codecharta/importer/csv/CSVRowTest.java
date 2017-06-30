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
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "path", "attrib"});
        String[] csvRow = new String[]{"projectName", "blubb2", "blubb3", name};

        // when
        CSVRow row = new CSVRow(csvRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getPath(), is(name));
    }

    @Test
    public void getFileName_should_return_filename_from_specified_path_column() {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "Path", "attrib"});
        Map<String,String> nameExpectedFilenameMap = ImmutableMap.of(
                "someNodeName", "someNodeName",
                "someDir\\someName", "someName",
                "someDir\\anotherDir\\anotherName", "anotherName");

        for (String name : nameExpectedFilenameMap.keySet()) {
            // when
            CSVRow row = new CSVRow(new String[]{"projectName", "blubb2", "blubb3", name}, header, PATH_SEPARATOR);
            // then
            assertThat(row.getFileName(), is(nameExpectedFilenameMap.get(name)));
        }
    }

    @Test
    public void getFolderWithFile_should_return_folderWithFile_from_specified_path_column() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "PATH", "attrib"});
        Map<String,String> nameExpectedFolderWithFileMap = ImmutableMap.of(
                "someNodeName", "",
                "someDir\\someName", "someDir\\",
                "someDir\\anotherDir\\anotherName", "someDir\\anotherDir\\");

        for (String name : nameExpectedFolderWithFileMap.keySet()) {
            // when
            CSVRow row = new CSVRow(new String[]{"projectName", "blubb2", "blubb3", name}, header, PATH_SEPARATOR);
            // then
            assertThat(row.getFolderWithFile(), is(nameExpectedFolderWithFileMap.get(name)));
        }
    }

    @Test
    public void getAttributes_should_read_float_from_metric_column() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"path", "attrib"});
        String[] rawRow = new String[]{"name", "3,2"};

        // when
        CSVRow row = new CSVRow(rawRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(1));
        assertThat(row.getAttributes().get("attrib"), is(3.2f));
    }

    @Test
    public void getAttributes_should_ignore_string_in_metric_column() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "path", "attrib"});
        String[] rawRow = new String[]{"projectName", "blubb2", "blubb3", "name", "3bla"};

        // when
        CSVRow row = new CSVRow(rawRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(0));
    }

    @Test
    public void getAttributes_should_ignore_column_if_no_attributeName_in_head() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "path"});
        String[] rawRow = new String[]{"projectName", "blubb2", "blubb3", "name", "3,0"};

        // when
        CSVRow row = new CSVRow(rawRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(0));
    }

    @Test
    public void getAttributes_should_ignore_column_if_not_present_in_row() throws Exception {
        // given
        CSVHeader header = new CSVHeader(new String[]{"path", "head2", "head3", "missingValueColumn"});
        String[] rawRow = new String[]{"somePath", "1,2", "1.3"};

        // when
        CSVRow row = new CSVRow(rawRow, header, PATH_SEPARATOR);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(2));
    }

    @Test(expected = IllegalArgumentException.class)
    public void should_throw_exception_if_no_path_column_present() {
        // given
        CSVHeader header = new CSVHeader(new String[]{"head1", "head2", "head3", "path"});

        // when
        new CSVRow(new String[]{"", ""}, header, PATH_SEPARATOR);

        // then throw
    }
}