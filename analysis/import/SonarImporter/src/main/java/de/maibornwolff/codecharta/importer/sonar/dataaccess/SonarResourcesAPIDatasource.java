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

import de.maibornwolff.codecharta.importer.sonar.SonarImporterException;
import de.maibornwolff.codecharta.importer.sonar.filter.ErrorResponseFilter;
import org.glassfish.jersey.client.ClientProperties;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.core.MediaType;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Requests Data from Sonar Instance through REST-API
 */
public class SonarResourcesAPIDatasource {

    private static final String RESOURCE = "%s/api/resources?resource=%s&depth=-1&metrics=%s";
    private static final int TIMEOUT_MS = 5000;

    private final String user;

    private final URL baseUrl;

    private final String projectKey;
    private final Client client;
    private final SonarMetricsAPIDatasource sonarMetricsAPIDatasource;

    public SonarResourcesAPIDatasource(String user, URL baseUrl, String projectKey) {
        this(user, baseUrl, projectKey, new SonarMetricsAPIDatasource(user, baseUrl));
    }

    private SonarResourcesAPIDatasource(String user, URL baseUrl, String projectKey, SonarMetricsAPIDatasource sonarMetricsAPIDatasource) {
        this.user = user;
        this.baseUrl = baseUrl;
        this.projectKey = projectKey;
        this.sonarMetricsAPIDatasource = sonarMetricsAPIDatasource;

        client = ClientBuilder.newClient()
                .property(ClientProperties.CONNECT_TIMEOUT, TIMEOUT_MS)
                .property(ClientProperties.READ_TIMEOUT, TIMEOUT_MS);
        client.register(ErrorResponseFilter.class);
        client.register(GsonProvider.class);
    }

    /**
     * Reads values of metrics from SonarQube server using REST API
     *
     * @param metricList xml-String containing values for metrics for given project
     * @return server's response in XML
     */
    public String getResourcesAsString(List<String> metricList) throws SonarImporterException {

        Invocation.Builder request = client.target(createProjectMetricValuesRequestUrl(metricList)).request();
        if (!user.isEmpty()) {
            request.header("Authorization", "Basic " + AuthentificationHandler.createAuthTxtBase64Encoded(user));
        }
        return request.accept(MediaType.APPLICATION_XML_TYPE).get(String.class);
    }

    private URI createProjectMetricValuesRequestUrl(List<String> metricList) throws SonarImporterException {
        String metricString = createMetricString(metricList);
        try {
            return new URI(String.format(RESOURCE, baseUrl, projectKey, metricString));
        } catch (URISyntaxException e) {
            throw new SonarImporterException(e);
        }
    }

    private String createMetricString(List<String> metricList) {
        if (metricList.isEmpty()) {
            sonarMetricsAPIDatasource
                    .getAvailableMetrics(0).getMetrics()
                    .forEach(m -> metricList.add(m.getKey()));
        }
        return metricList.stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));
    }
}
