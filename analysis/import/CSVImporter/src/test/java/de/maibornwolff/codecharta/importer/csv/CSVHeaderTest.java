package de.maibornwolff.codecharta.importer.csv;

import com.google.common.collect.ImmutableSet;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class CSVHeaderTest {
    @Test(expected = IllegalArgumentException.class)
    public void emptyHeader_should_throw_exception() {
        new CSVHeader(new String[]{});
    }

    @Test
    public void columnNumbers_should_return_all_columnNumbers() {
        CSVHeader header = new CSVHeader(new String[]{"first", "second"});
        assertThat(header.getColumnNumbers(), is(ImmutableSet.of(0, 1)));
    }

    @Test
    public void empty_header_columns_should_be_ignored() {
        CSVHeader header = new CSVHeader(new String[]{"first", "second", ""});
        assertThat(header.getColumnNumbers(), is(ImmutableSet.of(0, 1)));
    }

    @Test
    public void null_in_header_columns_should_be_ignored() {
        CSVHeader header = new CSVHeader(new String[]{"first", "second", null});
        assertThat(header.getColumnNumbers(), is(ImmutableSet.of(0, 1)));
    }

    @Test
    public void duplicate_header_columns_should_be_ignored() {
        CSVHeader header = new CSVHeader(new String[]{"first", "second", "first"});
        assertThat(header.getColumnNumbers(), is(ImmutableSet.of(0, 1)));
    }

    @Test
    public void getColumnName_should_return_header_column() {
        String secondHeaderColumn = "second";
        CSVHeader header = new CSVHeader(new String[]{"first", secondHeaderColumn, "third"});
        assertThat(header.getColumnName(1), is(secondHeaderColumn));
    }

    @Test(expected = IllegalArgumentException.class)
    public void getColumnName_should_throw_Exception_if_no_column_present() {
        CSVHeader header = new CSVHeader(new String[]{"first", "second", "third"});
        header.getColumnName(4);
    }

    @Test
    public void getPathColumn_should_return_header_column_named_path() {
        CSVHeader header = new CSVHeader(new String[]{"first", "path", "third"});

        assertThat(header.getPathColumn(), is(1));
    }

    @Test
    public void getPathColumn_should_return_first_column_if_no_path_colum_present_and_first_column_nonempty() {
        CSVHeader header = new CSVHeader(new String[]{"first", "second", "third"});

        assertThat(header.getPathColumn(), is(0));
    }

    @Test
    public void getPathColumn_should_return_first_nonempty_column_if_no_path_colum_present() {
        CSVHeader header = new CSVHeader(new String[]{"", "second", "third"});

        assertThat(header.getPathColumn(), is(1));
    }
}