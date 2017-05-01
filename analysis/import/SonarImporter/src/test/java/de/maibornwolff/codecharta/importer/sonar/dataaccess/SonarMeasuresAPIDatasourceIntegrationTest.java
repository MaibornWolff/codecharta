package de.maibornwolff.codecharta.importer.sonar.dataaccess;

import com.github.tomakehurst.wiremock.client.ResponseDefinitionBuilder;
import com.github.tomakehurst.wiremock.junit.WireMockRule;
import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;
import com.google.common.io.CharStreams;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import de.maibornwolff.codecharta.importer.sonar.SonarImporterException;
import de.maibornwolff.codecharta.importer.sonar.model.ErrorEntity;
import de.maibornwolff.codecharta.importer.sonar.model.ErrorResponse;
import de.maibornwolff.codecharta.importer.sonar.model.Measures;
import de.maibornwolff.codecharta.importer.sonar.model.PagingInfo;
import org.junit.Rule;
import org.junit.Test;

import javax.ws.rs.WebApplicationException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

import static com.github.tomakehurst.wiremock.client.ResponseDefinitionBuilder.jsonResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

public class SonarMeasuresAPIDatasourceIntegrationTest {
    private static final int PORT = 8089;
    private static final String USERNAME = "somename";
    private static final String PROJECT_KEY = "someProject";
    private static final Gson GSON = new GsonBuilder().create();
    private static final String URL_PATH = "/api/measures/component_tree?baseComponentKey=" + PROJECT_KEY + "&qualifiers=FIL,UTS&metricKeys=coverage&p=1&ps=100";

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
                this.getClass().getClassLoader().getResourceAsStream("sonarqube_measures.json"), Charsets.UTF_8));
    }

    private Measures createExpectedMeasures() throws IOException {
        String responseString = createResponseString();
        return GSON.fromJson(responseString, Measures.class);
    }


    @Test
    public void getMeasures_from_server_if_no_authentication_needed() throws Exception {
        // given
        stubFor(get(urlEqualTo(URL_PATH))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody(createResponseString())));

        // when
        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource("", createBaseUrl(), PROJECT_KEY);
        Measures measures = ds.getMeasures(ImmutableList.of("coverage"), 1);

        // then
        assertThat(measures, is(createExpectedMeasures()));
    }

    @Test
    public void getMeasures_from_server_if_authenticated() throws Exception {
        // given
        stubFor(get(urlEqualTo(URL_PATH)).withBasicAuth(USERNAME, "")
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody(createResponseString())));

        // when
        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource(USERNAME, createBaseUrl(), PROJECT_KEY);
        Measures measures = ds.getMeasures(ImmutableList.of("coverage"), 1);

        // then
        assertThat(measures, is(createExpectedMeasures()));
    }

    @Test(expected = WebApplicationException.class)
    public void getMeasures_throws_exception_if_bad_request() throws Exception {
        // given
        ErrorEntity error = new ErrorEntity("some Error");
        ErrorResponse errorResponse = new ErrorResponse(new ErrorEntity[]{error});
        stubFor(get(urlEqualTo(URL_PATH)).withBasicAuth(USERNAME, "")
                .willReturn(ResponseDefinitionBuilder.like(
                        jsonResponse(errorResponse, 400))));

        // when
        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource(USERNAME, createBaseUrl(), PROJECT_KEY);
        ds.getMeasures(ImmutableList.of("coverage"), 1);
    }

    @Test
    public void getNumberOfPages_from_server() throws Exception {
        // given
        Measures measures = new Measures(
                new PagingInfo(1, 100, 999),
                null,
                null);
        stubFor(get(urlEqualTo(URL_PATH)).withBasicAuth(USERNAME, "")
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody(GSON.toJson(measures))));

        // when
        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource(USERNAME, createBaseUrl(), PROJECT_KEY);
        int numberOfPages = ds.getNumberOfPages(ImmutableList.of("coverage"));

        // then
        assertThat(numberOfPages, is(10));
    }

    @Test
    public void createMeasureAPIRequestURI() throws Exception {
        // given
        URI expectedMeasuresAPIRequestURI = new URI(createBaseUrl() + "/api/measures/component_tree?baseComponentKey=&qualifiers=FIL,UTS&metricKeys=coverage&p=0&ps=100");

        // when
        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource("", createBaseUrl(), "");
        URI measureAPIRequestURI = ds.createMeasureAPIRequestURI(ImmutableList.of("coverage"), 0);

        // then
        assertThat(measureAPIRequestURI, is(expectedMeasuresAPIRequestURI));
    }

    @Test(expected = IllegalArgumentException.class)
    public void createMeasureAPIRequestURI_without_metrics_throws_exception() throws Exception {
        // given
        // when
        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource("", createBaseUrl(), "");
        ds.createMeasureAPIRequestURI(ImmutableList.of(), 0);

        // then throw
    }

    @Test(expected = SonarImporterException.class)
    public void createMeasureAPIRequestURI_illegal_character_in_metrics_should_throw_exception() throws Exception {
        // given
        // when
        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource("", createBaseUrl(), "");
        ds.createMeasureAPIRequestURI(ImmutableList.of(" "), 0);

        // then throw
    }
}