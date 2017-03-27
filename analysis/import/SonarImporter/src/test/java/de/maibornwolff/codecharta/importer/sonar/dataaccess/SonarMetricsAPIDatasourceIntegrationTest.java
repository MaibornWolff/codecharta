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

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import de.maibornwolff.codecharta.importer.sonar.model.MetricObject;
import org.junit.Rule;
import org.junit.Test;

import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.ServerErrorException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class SonarMetricsAPIDatasourceIntegrationTest {

    private static final String[] METRIC_ARRAY = {"accessors", "blocker_violations", "public_api", "public_documented_api_density", "public_undocumented_api"};

    private static final int PORT = 8089;
    private static final String USERNAME = "somename";
    private static final String METRIC_LIST_URL_PATH = "/api/metrics/search";

    @Rule
    public WireMockRule wireMockRule = new WireMockRule(PORT);

    private static URL createBaseUrl() {
        try {
            return new URL("http://localhost:" + PORT);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    private String createMetricResponseAsJsonString() throws IOException {
        return CharStreams.toString(new InputStreamReader(
                this.getClass().getClassLoader().getResourceAsStream("metrics.json"), Charsets.UTF_8));
    }

    @Test
    public void getAvailableMetrics() throws Exception {
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())));

        SonarMetricsAPIDatasource ds = new SonarMetricsAPIDatasource(createBaseUrl());
        List<String> metricsList = ds.getAvailableMetrics().stream().map(MetricObject::getKey).collect(Collectors.toList());

        assertThat(metricsList, is(Arrays.asList(METRIC_ARRAY)));
    }

    @Test
    public void getAvailableMetricsIfAuth() throws Exception {
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH)).withBasicAuth(USERNAME, "")
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(createMetricResponseAsJsonString())));

        SonarMetricsAPIDatasource ds = new SonarMetricsAPIDatasource(USERNAME, createBaseUrl());
        List<String> metricsList = ds.getAvailableMetrics().stream().map(MetricObject::getKey).collect(Collectors.toList());

        assertThat(metricsList, is(Arrays.asList(METRIC_ARRAY)));
    }

    @Test(expected = NotAuthorizedException.class)
    public void getAvailableMetricsshouldThrowExceptionIfUnauthorized() throws Exception {
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH))
                .willReturn(aResponse()
                        .withStatus(401)));

        SonarMetricsAPIDatasource ds = new SonarMetricsAPIDatasource(createBaseUrl());
        ds.getAvailableMetrics();
    }

    @Test(expected = ServerErrorException.class)
    public void getAvailableMetricsshouldThrowExceptionIfReturnCodeNotOK() throws Exception {
        stubFor(get(urlEqualTo(METRIC_LIST_URL_PATH))
                .willReturn(aResponse()
                        .withStatus(501)));

        SonarMetricsAPIDatasource ds = new SonarMetricsAPIDatasource(createBaseUrl());
        ds.getAvailableMetrics();
    }
}