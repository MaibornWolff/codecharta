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

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import static java.lang.System.*;

/**
 * Main Class: Parses command line input and delegates to SonarXMLImport for processing
 */
public class SonarImporterMain {
    private SonarImporterMain() {
        // Main class - no instantiation
    }

    public static void main(String[] args) {
        SonarImporterParameter callParameter = new SonarImporterParameter(args);

        if (callParameter.isHelp()) {
            printHelp(callParameter);
        } else if (callParameter.isOldApi()) {
            try {
                doOldImport(callParameter);
            } catch (SonarImporterException | IOException e) {
                showErrorMessageAndTerminate("unable to import", e);
            }
        } else {
            try {
                doImport(callParameter);
            } catch (SonarImporterException | IOException e) {
                showErrorMessageAndTerminate("unable to import", e);
            }
        }
    }

    private static SonarMeasuresAPIImporter createMesauresAPIImporter(SonarImporterParameter callParameter) {
        if (callParameter.getFiles().size() != 2) {
            callParameter.printUsage();
            throw new SonarImporterException("Url and project key missing.");
        }

        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource(callParameter.getUser(), createBaseUrlFrom(callParameter));
        SonarMetricsAPIDatasource metricsDS = new SonarMetricsAPIDatasource(callParameter.getUser(), createBaseUrlFrom(callParameter));
        SonarCodeURLLinker sonarCodeURLLinker = new SonarCodeURLLinker(createBaseUrlFrom(callParameter));
        MetricNameTranslator translator = SonarMetricTranslatorFactory.createMetricTranslator();

        return new SonarMeasuresAPIImporter(ds, metricsDS, sonarCodeURLLinker, translator, callParameter.isUsePath());
    }

    private static void doImport(SonarImporterParameter callParameter) throws IOException {
        String projectKey = callParameter.getFiles().get(1);

        SonarMeasuresAPIImporter importer = createMesauresAPIImporter(callParameter);
        Project project = importer.getProjectFromMeasureAPI(projectKey, projectKey, callParameter.getMetrics());

        ProjectSerializer.serializeProject(project, createWriterFrom(callParameter));
    }

    private static void printHelp(SonarImporterParameter callParameter) {
        callParameter.printUsage();
    }

    private static void doOldImport(SonarImporterParameter callParameter) throws IOException {
        Reader reader = createReaderFrom(callParameter);
        URL baseUrl = createBaseUrlFrom(callParameter);
        String baseUrlForLink = baseUrl == null ? "" : baseUrl.toString();

        try (Writer writer = createWriterFrom(callParameter)) {
            new SonarXMLImport(reader, writer, baseUrlForLink).doImport();
        }
    }

    private static Reader createReaderFrom(SonarImporterParameter callParameter) {
        if (callParameter.isLocal() && callParameter.getFiles().size() == 1) {
            return createFileReader(callParameter.getFiles().get(0));
        } else if (callParameter.getFiles().size() == 2) {
            return createStringReaderFromSonarDatasource(callParameter);
        }
        throw new SonarImporterException("Only <file> or <baseUrl> <project> is supported, given was " + callParameter.getFiles());
    }

    private static Reader createStringReaderFromSonarDatasource(SonarImporterParameter callParameter) {
        Reader reader;
        String user = callParameter.getUser();
        String projectKey = callParameter.getFiles().get(1);
        List<String> metrics = callParameter.getMetrics();
        SonarResourcesAPIDatasource datasource = new SonarResourcesAPIDatasource(user, createBaseUrlFrom(callParameter), projectKey);
        reader = new StringReader(datasource.getResourcesAsString(metrics));
        return reader;
    }

    private static URL createBaseUrlFrom(SonarImporterParameter callParameter) {
        if (callParameter.getFiles().size() == 2) {
            String urlString = callParameter.getFiles().get(0);
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

    private static Writer createWriterFrom(SonarImporterParameter callParameter) throws IOException {
        if (callParameter.getOutputFile().isEmpty()) {
            return new OutputStreamWriter(out);
        } else {
            return new BufferedWriter(new FileWriter(callParameter.getOutputFile()));
        }
    }

    private static Reader createFileReader(String file) {
        try {
            return new FileReader(file);
        } catch (FileNotFoundException e) {
            throw new SonarImporterException("File was not found at " + file, e);
        }
    }

    private static void showErrorMessageAndTerminate(String message) {
        err.println("Error!");
        err.println(message);
        exit(1);
    }

    private static void showErrorMessageAndTerminate(String s, Exception e) {
        e.printStackTrace();
        showErrorMessageAndTerminate(s + ": " + e.getMessage());
    }
}
