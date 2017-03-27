package de.maibornwolff.codecharta.importer.sourcemon;

import com.google.common.collect.ImmutableMap;
import org.junit.Test;

import java.util.Map;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasSize;

public class SourceMonitorCSVRowTest {

    @Test
    public void getPath_should_return_path_from_fourth_column() {
        // given
        String name = "someNodeName";
        String[] csvRow = new String[]{"projectName", "blubb2", "blubb3", name};

        // when
        SourceMonitorCSVRow row = new SourceMonitorCSVRow(csvRow, null);

        // then
        assertThat(row.getPath(), is(name));
    }

    @Test
    public void getFileName_should_return_filename_from_fourth_column() {
        // given
        Map nameExpectedFilenameMap = ImmutableMap.of(
                "someNodeName", "someNodeName",
                "someDir\\someName", "someName",
                "someDir\\anotherDir\\anotherName", "anotherName");

        for (Object name : nameExpectedFilenameMap.keySet()) {
            // when
            SourceMonitorCSVRow row = new SourceMonitorCSVRow(new String[]{"projectName", "blubb2", "blubb3", (String) name}, null);
            // then
            assertThat(row.getFileName(), is(nameExpectedFilenameMap.get(name)));
        }
    }

    @Test
    public void getFolderWithFile_should_return_folderWithFile_from_fourth_column() throws Exception {
        // given
        Map nameExpectedFolderWithFileMap = ImmutableMap.of(
                "someNodeName", "",
                "someDir\\someName", "someDir\\",
                "someDir\\anotherDir\\anotherName", "someDir\\anotherDir\\");

        for (Object name : nameExpectedFolderWithFileMap.keySet()) {
            // when
            SourceMonitorCSVRow row = new SourceMonitorCSVRow(new String[]{"projectName", "blubb2", "blubb3", (String) name}, null);
            // then
            assertThat(row.getFolderWithFile(), is(nameExpectedFolderWithFileMap.get(name)));
        }
    }

    @Test
    public void getAttributes_should_read_float_from_fifth_column() throws Exception {
        // given
        String[] head = new String[]{"head1", "head2", "head3", "head4", "attrib"};
        String[] rawRow = new String[]{"projectName", "blubb2", "blubb3", "name", "3,2"};

        // when
        SourceMonitorCSVRow row = new SourceMonitorCSVRow(rawRow, head);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(1));
        assertThat(row.getAttributes().get("attrib"), is(3.2f));
    }

    @Test
    public void getAttributes_should_ignore_string() throws Exception {
        // given
        String[] head = new String[]{"head1", "head2", "head3", "head4", "attrib"};
        String[] rawRow = new String[]{"projectName", "blubb2", "blubb3", "name", "3bla"};

        // when
        SourceMonitorCSVRow row = new SourceMonitorCSVRow(rawRow, head);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(0));
    }

    @Test
    public void getAttributes_should_ignore_line_if_no_attributeName_in_head() throws Exception {
        // given
        String[] head = new String[]{"head1", "head2", "head3", "head4"};
        String[] rawRow = new String[]{"projectName", "blubb2", "blubb3", "name", "3,0"};

        // when
        SourceMonitorCSVRow row = new SourceMonitorCSVRow(rawRow, head);

        // then
        assertThat(row.getAttributes().keySet(), hasSize(0));
    }

    @Test(expected = IllegalArgumentException.class)
    public void should_throw_exception_if_less_than_3_columns() {
        // when
        new SourceMonitorCSVRow(new String[]{"", ""}, null);

        // then throw
    }
}