package de.maibornwolff.codecharta.importer.sonar.dataaccess;

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;
import com.google.common.io.CharStreams;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import de.maibornwolff.codecharta.importer.sonar.model.Measures;
import org.junit.Rule;
import org.junit.Test;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

public class SonarMeasuresAPIDatasourceIntegrationTest {
    private static final int PORT = 8089;
    private static final String PROJECT_KEY = "someProject";
    private static final Gson GSON = new GsonBuilder().create();

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

    @Test
    public void getMeasures() throws Exception {
        // given
        String urlPath = "/api/measures/component_tree?baseComponentKey=" + PROJECT_KEY + "&qualifiers=FIL,UTS&metricKeys=coverage&p=1&ps=100";

        String responseString = createResponseString();
        Measures expectedMeasures = GSON.fromJson(responseString, Measures.class);
        stubFor(get(urlEqualTo(urlPath))
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withStatus(200)
                        .withBody(responseString)));

        // when
        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource("", createBaseUrl(), PROJECT_KEY);
        Measures measures = ds.getMeasures(ImmutableList.of("coverage"), 1);

        // then
        assertThat(measures, is(expectedMeasures));
    }

}