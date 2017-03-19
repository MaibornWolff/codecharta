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

package de.maibornwolff.codecharta.importer.sonar.dataaccess;

import com.google.common.io.CharStreams;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import de.maibornwolff.codecharta.importer.sonar.SonarImporterException;
import de.maibornwolff.codecharta.importer.sonar.model.MetricObject;
import de.maibornwolff.codecharta.importer.sonar.model.Metrics;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Requests Data from Sonar Instance through REST-API
 */
public class SonarRESTDatasource {

    private static final String METRICS = "/api/metrics/search";
    private static final String RESOURCE = "/api/resources?resource=%s&depth=-1&metrics=%s";

    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().disableHtmlEscaping().create();

    private final String user;

    private final URL baseUrl;

    private final String projectKey;

    SonarRESTDatasource(URL baseUrl, String projectKey) {
        this("", baseUrl, projectKey);
    }

    public SonarRESTDatasource(String user, URL baseUrl, String projectKey) {
        this.user = user;
        this.baseUrl = baseUrl;
        this.projectKey = projectKey;
    }


    /**
     * Reads values of metrics from SonarQube server using REST API
     *
     * @param metricList xml-String containing values for metrics for given project
     * @return server's response in XML
     */
    public String getMetricValues(List<String> metricList) throws SonarImporterException {
        HttpURLConnection connection = null;
        try {
            URL projectMetricValuesRequestUrl = createProjectMetricValuesRequestUrl(metricList);
            connection = createOpenConnection(projectMetricValuesRequestUrl);
            connection.setRequestProperty("Content-Type", "application/xml");
            connection.setRequestProperty("Accept", "application/xml");
            return getResponseAsString(connection);
        } catch (IOException e) {
            throw new SonarImporterException(e);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private HttpURLConnection createOpenConnection(URL url) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        if (!user.isEmpty()) {
            connection.setRequestProperty("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user));
        }
        connection.setRequestMethod("GET");
        connection.setDoOutput(true);
        return connection;
    }

    URL createProjectMetricValuesRequestUrl(List<String> metricList) throws SonarImporterException {
        if (metricList.isEmpty()) {
            metricList.addAll(getAvailableMetrics());
        }
        String metricString = metricList.stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));
        try {
            return new URL(String.format(baseUrl + RESOURCE, projectKey, metricString));
        } catch (MalformedURLException e) {
            throw new SonarImporterException(e);
        }
    }

    /**
     * Reads available metrics from SonarQube server using REST API
     *
     * @return List of available metrics
     */
    List<String> getAvailableMetrics() throws SonarImporterException {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(baseUrl + METRICS);
            connection = createOpenConnection(url);
            String metricJson = getResponseAsString(connection);
            return getMetricsFromJson(metricJson);
        } catch (IOException e) {
            throw new SonarImporterException(e);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    static List<String> getMetricsFromJson(String metricJson) {
        Metrics parsedMetrics = GSON.fromJson(metricJson, Metrics.class);
        return parsedMetrics.getMetrics().stream().map(MetricObject::getKey).collect(Collectors.toList());
    }

    private static String getResponseAsString(HttpURLConnection connection) throws IOException, SonarImporterException {
        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            return CharStreams.toString(new InputStreamReader(connection.getInputStream()));
        } else if (responseCode == HttpURLConnection.HTTP_UNAUTHORIZED) {
            throw new IOException("You are not authorized to access the server");
        }
        throw new SonarImporterException("Unable to get response from server: HTTP code " + responseCode);
    }
}
