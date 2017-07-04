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
import com.google.common.collect.ImmutableList;
import com.google.common.io.CharStreams;
import de.maibornwolff.codecharta.importer.sonar.SonarImporterException;
import org.junit.Rule;
import org.junit.Test;
import org.mockito.Mockito;

import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.ServerErrorException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.mock;

public class SonarResourcesAPIDatasourceIntegrationTest {

    private static final int PORT = 8089;
    private static final String USERNAME = "somename";
    private static final String PROJECT_KEY = "someProject";

    @Rule
    public WireMockRule wireMockRule = new WireMockRule(PORT);

    private static URL createBaseUrl() {
        try {
            return new URL("http://localhost:" + PORT);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    private String createResponseString() throws IOException {
        return CharStreams.toString(new InputStreamReader(
                this.getClass().getClassLoader().getResourceAsStream("metrics.json"), Charsets.UTF_8));
    }

    @Test
    public void getResourcesAsString() throws Exception {
        // given
        String urlPath = "/api/resources?resource=" + PROJECT_KEY + "&depth=-1&metrics=metric1,metric2";
        String responseString = createResponseString();
        stubFor(get(urlEqualTo(urlPath))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody(responseString)));

        // when
        SonarResourcesAPIDatasource ds = new SonarResourcesAPIDatasource("", createBaseUrl(), PROJECT_KEY);
        String response = ds.getResourcesAsString(ImmutableList.of("metric1", "metric2"));

        // then
        assertThat(response, is(responseString));
    }

    @Test
    public void getResourcesAsString_if_authenticated() throws Exception {
        // given
        String urlPath = "/api/resources?resource=" + PROJECT_KEY + "&depth=-1&metrics=metric1,metric2";
        String responseString = createResponseString();
        stubFor(get(urlEqualTo(urlPath)).withBasicAuth(USERNAME, "")
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody(responseString)));

        // when
        SonarResourcesAPIDatasource ds = new SonarResourcesAPIDatasource(USERNAME, createBaseUrl(), PROJECT_KEY);
        String response = ds.getResourcesAsString(ImmutableList.of("metric1", "metric2"));

        // then
        assertThat(response, is(responseString));
    }

    @Test(expected = NotAuthorizedException.class)
    public void getResourcesAsString_should_throw_exception_if_unauthorized() throws Exception {
        // given
        String urlPath = "/api/resources?resource=" + PROJECT_KEY + "&depth=-1&metrics=metric1,metric2";
        stubFor(get(urlEqualTo(urlPath))
                .willReturn(aResponse()
                        .withStatus(401)));

        // when
        SonarResourcesAPIDatasource ds = new SonarResourcesAPIDatasource("", createBaseUrl(), PROJECT_KEY);
        ds.getResourcesAsString(ImmutableList.of("metric1", "metric2"));

        // then throw
    }

    @Test(expected = ServerErrorException.class)
    public void getResourcesAsString_should_throw_exception_if_return_code_not_ok() throws Exception {
        // given
        String urlPath = "/api/resources?resource=" + PROJECT_KEY + "&depth=-1&metrics=metric1,metric2";
        stubFor(get(urlEqualTo(urlPath))
                .willReturn(aResponse()
                        .withStatus(501)));

        // when
        SonarResourcesAPIDatasource ds = new SonarResourcesAPIDatasource("", createBaseUrl(), PROJECT_KEY);
        ds.getResourcesAsString(ImmutableList.of("metric1", "metric2"));

        // then throw
    }

    @Test(expected = SonarImporterException.class)
    public void getResourcesAsString_illegal_character_in_project_name_should_throw_exception() throws SonarImporterException {
        // when
        SonarResourcesAPIDatasource ds = new SonarResourcesAPIDatasource("", createBaseUrl(), "invalid project id");
        ds.getResourcesAsString(ImmutableList.of("metric1"));

        // then throw
    }

}