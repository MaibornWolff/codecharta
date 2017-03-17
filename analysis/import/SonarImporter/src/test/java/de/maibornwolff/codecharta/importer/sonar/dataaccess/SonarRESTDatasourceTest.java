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

import com.google.common.base.Charsets;
import com.google.common.collect.ImmutableList;
import com.google.common.io.CharStreams;
import de.maibornwolff.codecharta.importer.sonar.SonarImporterException;
import org.junit.Test;

import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;

import static junit.framework.TestCase.assertTrue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class SonarRESTDatasourceTest {

    private static final String[] EXPECTED_METRIC_ARRAY = {"accessors", "blocker_violations", "public_api", "public_documented_api_density", "public_undocumented_api"};

    @Test
    public void getMetricsFromJson() throws Exception {
        String metricsString = CharStreams.toString(new InputStreamReader(
                this.getClass().getClassLoader().getResourceAsStream("metrics.json"), Charsets.UTF_8));

        List<String> metricsFromJson = SonarRESTDatasource.getMetricsFromJson(metricsString);

        assertTrue(metricsFromJson.size() == 5);
        assertTrue(metricsFromJson.containsAll(Arrays.asList(EXPECTED_METRIC_ARRAY)));
    }

    @Test
    public void createProjectMetricValuesRequestUrl() throws MalformedURLException, SonarImporterException {
        URL baseUrl = new URL("http://someUrl");
        String projectKey = "someProject";
        URL expectdUrl = new URL(baseUrl + "/api/resources?resource=" + projectKey + "&depth=-1&metrics=metric1,metric2");

        SonarRESTDatasource ds = new SonarRESTDatasource(baseUrl, projectKey);
        URL url = ds.createProjectMetricValuesRequestUrl(ImmutableList.of("metric1", "metric2"));

        assertThat(url, is(expectdUrl));
    }
}