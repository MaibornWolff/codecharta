package de.maibornwolff.codecharta.importer.sonar;

import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.Assert.*;

/**
 * Created by fernandog on 11.04.17.
 */
public class SonarMeasuresAPIImporterParameterTest {

    public String[] importerLocal = {"-l"};
    public String[] importerHelp = {"-h"};
    public String[] importerFiles = {"givenFile"};
    public String[] importerOutput = {"-o", "outputFile"};
    public String[] importerMetrics = {"-m", "metrics1,metrics2"};
    public String[] importerName = {"-u", "userTest"};
    public String[] importerApi = {"--old-api"};

    SonarImporterParameter sonarImporterParameterLocal = new SonarImporterParameter(importerLocal);
    SonarImporterParameter sonarImporterParameterHelp = new SonarImporterParameter(importerHelp);
    SonarImporterParameter sonarImporterParameterFiles = new SonarImporterParameter(importerFiles);
    SonarImporterParameter sonarImporterParameterOutput = new SonarImporterParameter(importerOutput);
    SonarImporterParameter sonarImporterParameterMetrics = new SonarImporterParameter(importerMetrics);
    SonarImporterParameter sonarImporterParameterName = new SonarImporterParameter(importerName);
    SonarImporterParameter sonarImporterParameterApi = new SonarImporterParameter(importerApi);

    @Test
    public void shouldReturnIsLocal() {
        assert (sonarImporterParameterLocal.isLocal());
    }

    @Test
    public void shouldReturnIsNotLocal() {
        assert (!sonarImporterParameterHelp.isLocal());
        assert (!sonarImporterParameterFiles.isLocal());
        assert (!sonarImporterParameterOutput.isLocal());
        assert (!sonarImporterParameterMetrics.isLocal());
        assert (!sonarImporterParameterName.isLocal());
        assert (!sonarImporterParameterApi.isLocal());
    }

    @Test
    public void shouldReturnThereIsNoHelp() {
        assert (sonarImporterParameterHelp.isHelp());
    }

    @Test
    public void shouldReturnIsNotHelp() {
        assert (!sonarImporterParameterLocal.isHelp());
        assert (!sonarImporterParameterFiles.isHelp());
        assert (!sonarImporterParameterOutput.isHelp());
        assert (!sonarImporterParameterMetrics.isHelp());
        assert (!sonarImporterParameterName.isHelp());
        assert (!sonarImporterParameterApi.isHelp());
    }

    @Test
    public void shouldReturnListOfFiles() {
        assertThat(sonarImporterParameterFiles.getFiles(), hasSize(1));
    }

    @Test
    public void shouldReturnThatListOfFilesIsEmpty() {
        assertThat(sonarImporterParameterLocal.getFiles(), hasSize(0));
        assertThat(sonarImporterParameterHelp.getFiles(), hasSize(0));
        assertThat(sonarImporterParameterOutput.getFiles(), hasSize(0));
        assertThat(sonarImporterParameterMetrics.getFiles(), hasSize(0));
        assertThat(sonarImporterParameterName.getFiles(), hasSize(0));
        assertThat(sonarImporterParameterApi.getFiles(), hasSize(0));
    }

    @Test
    public void shouldReturnOutPutFile() {
        assertEquals(sonarImporterParameterOutput.getOutputFile(), "outputFile");
    }

    @Test
    public void shouldReturnThereIsNoOutPutFile() {
        assertEquals(sonarImporterParameterLocal.getOutputFile(), "");
        assertEquals(sonarImporterParameterHelp.getOutputFile(), "");
        assertEquals(sonarImporterParameterFiles.getOutputFile(), "");
        assertEquals(sonarImporterParameterMetrics.getOutputFile(), "");
        assertEquals(sonarImporterParameterName.getOutputFile(), "");
        assertEquals(sonarImporterParameterApi.getOutputFile(), "");
    }

    @Test
    public void shouldReturnMetrics() {
        assertEquals(sonarImporterParameterMetrics.getMetrics().get(0), "metrics1");
        assertEquals(sonarImporterParameterMetrics.getMetrics().get(1), "metrics2");
    }

    @Test
    public void shouldReturnUserName() {
        assertEquals(sonarImporterParameterName.getUser(), "userTest");
    }

    @Test
    public void shouldNotReturnUserName() {
        assertEquals(sonarImporterParameterLocal.getUser(), "");
        assertEquals(sonarImporterParameterHelp.getUser(), "");
        assertEquals(sonarImporterParameterFiles.getUser(), "");
        assertEquals(sonarImporterParameterMetrics.getUser(), "");
        assertEquals(sonarImporterParameterOutput.getUser(), "");
        assertEquals(sonarImporterParameterApi.getUser(), "");
    }

    @Test
    public void shouldReturnOldSonarQubeApi() {
        assert (sonarImporterParameterApi.isOldApi());
    }

    @Test
    public void shouldNotReturnOldSonarQubeApi() {
        assert (!sonarImporterParameterName.isOldApi());
        assert (!sonarImporterParameterHelp.isOldApi());
        assert (!sonarImporterParameterFiles.isOldApi());
        assert (!sonarImporterParameterMetrics.isOldApi());
        assert (!sonarImporterParameterOutput.isOldApi());
        assert (!sonarImporterParameterLocal.isOldApi());
    }

    @Test
    public void shouldPrintUsage() {
        // given
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        PrintStream printStream = new PrintStream(outStream);
        PrintStream old = System.out;
        System.setOut(printStream);
        // when
        sonarImporterParameterName.printUsage();
        System.out.flush();
        System.setOut(old);
        // Then
        assertTrue(outStream.toString().contains("Usage:"));
    }
}
