package de.maibornwolff.codecharta.importer.sonar.dataaccess;

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import com.google.common.base.Charsets;
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

public class SonarMeasuresAPIDatasourceTest {
    private static final int PORT = 8089;
    private static final String USERNAME = "somename";
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
    public void getMetricValuesIfAuthorized() throws Exception {
        String urlPath = "/api/measures/component_tree?baseComponentKey=" + PROJECT_KEY + "&metricKeys=coverage";

        String responseString = createResponseString();
        Measures expectedMeasures = GSON.fromJson(responseString, Measures.class);
        stubFor(get(urlEqualTo(urlPath)).withBasicAuth(USERNAME, "")
                .willReturn(aResponse()
                        .withStatus(200)
                        .withBody(responseString)));

        SonarMeasuresAPIDatasource ds = new SonarMeasuresAPIDatasource(USERNAME, createBaseUrl(), PROJECT_KEY);

    }

}