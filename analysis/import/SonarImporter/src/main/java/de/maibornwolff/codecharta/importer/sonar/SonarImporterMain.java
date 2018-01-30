/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.importer.sonar;


import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarResourcesAPIDatasource;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;
import picocli.CommandLine;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

import static java.lang.System.out;

@CommandLine.Command(name = "sonarimport",
        description = "generates cc.json from metric data from SonarQube",
        footer = "Copyright(c) 2018, MaibornWolff GmbH"
)
public class SonarImporterMain implements Callable<Void> {

    @CommandLine.Option(names = {"-h", "--help"}, usageHelp = true, description = "displays this help and exits")
    private Boolean help = false;

    @CommandLine.Parameters(arity = "1..2", description = "[[file]|[url] [project-id]]")
    private List<String> files = new ArrayList<>();

    @CommandLine.Option(names = {"-o", "--outputFile"}, description = "output File (or empty for stdout)")
    private String outputFile = "";

    @CommandLine.Option(names = {"-m", "--metrics"}, description = "comma-separated list of metrics to import")
    private List<String> metrics = new ArrayList<>();

    @CommandLine.Option(names = {"-u", "--user"}, description = "user token for connecting to remote sonar instance")
    private String user = "";

    @CommandLine.Option(names = {"--old-api"}, description = "toggle to old SonarQube API")
    private boolean oldApi = false;

    @CommandLine.Option(names = {"--merge-modules"}, description = "merges modules in multi-module projects")
    private boolean usePath = false;

    @CommandLine.Option(names = {"-l", "--local"}, description = "local run")
    private boolean local = false;

    public static void main(String[] args) {
        CommandLine.call(new SonarImporterMain(), System.out, args);
    }

    private static Reader createFileReader(String file) {
        try {
            return new FileReader(file);
        } catch (FileNotFoundException e) {
            throw new SonarImporterException("File was not found at " + file, e);
        }
    }

    private URL baseUrl() {
        if (files.size() == 2) {
            String urlString = files.get(0);
            try {
                while (urlString.endsWith("/")) {
                    urlString = urlString.substring(0, urlString.length() - 1);
                }
                return new URL(urlString);
            } catch (MalformedURLException e) {
                throw new SonarImporterException("No valid url for remote connection given: " + urlString);
            }
        }
        return null;
    }

    private Writer createWriterFrom() throws IOException {
        if (outputFile.isEmpty()) {
            return new OutputStreamWriter(out);
        } else {
            return new BufferedWriter(new FileWriter(outputFile));
        }
    }

    private Reader createReader() {
        if (local && files.size() == 1) {
            return createFileReader(files.get(0));
        } else if (files.size() == 2) {
            return createStringReaderFromSonarDatasource();
        }
        throw new SonarImporterException("Only <file> or <baseUrl> <project> is supported, given was " + files);
    }

    private Reader createStringReaderFromSonarDatasource() {
        Reader reader;
        SonarResourcesAPIDatasource datasource = new SonarResourcesAPIDatasource(user, baseUrl(), files.get(1));
        reader = new StringReader(datasource.getResourcesAsString(metrics));
        return reader;
    }

    private SonarMeasuresAPIImporter createMesauresAPIImporter() {
        if (files.size() != 2) {
            throw new SonarImporterException("Url and project key missing.");
        }

        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource(user, baseUrl());
        SonarMetricsAPIDatasource metricsDS = new SonarMetricsAPIDatasource(user, baseUrl());
        SonarCodeURLLinker sonarCodeURLLinker = new SonarCodeURLLinker(baseUrl());
        MetricNameTranslator translator = SonarMetricTranslatorFactory.createMetricTranslator();

        return new SonarMeasuresAPIImporter(ds, metricsDS, sonarCodeURLLinker, translator, usePath);
    }

    private void doImport() throws IOException {
        String projectKey = files.get(1);

        SonarMeasuresAPIImporter importer = createMesauresAPIImporter();
        Project project = importer.getProjectFromMeasureAPI(projectKey, projectKey, metrics);

        ProjectSerializer.serializeProject(project, createWriterFrom());
    }

    private void doOldImport() throws IOException {
        Reader reader = createReader();
        URL baseUrl = baseUrl();
        String baseUrlForLink = baseUrl == null ? "" : baseUrl.toString();

        try (Writer writer = createWriterFrom()) {
            new SonarXMLImport(reader, writer, baseUrlForLink).doImport();
        }
    }

    @Override
    public Void call() throws IOException {
        if (oldApi) {
            doOldImport();
        } else {
            doImport();
        }

        return null;
    }
}
