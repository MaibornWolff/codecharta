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

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource;
import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap;
import de.maibornwolff.codecharta.importer.sonar.model.Measure;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.model.Project;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class SonarMeasuresAPIImporterTest {

    private final String name = "ExampleName";
    private final List<String> metrics = Arrays.asList("MetricOne", "MetricTwo", "MetricThree");

    private SonarMeasuresAPIDatasource measuresDS;

    private SonarMetricsAPIDatasource metricsDS;

    private SonarMeasuresAPIImporter sonar;

    @Test
    public void shouldGetMetricsWhenMetricsGiven() {
        // given
        sonar = new SonarMeasuresAPIImporter(measuresDS, metricsDS);

        // when
        List<String> metricList = sonar.getMetricList(metrics);

        // then
        assertThat(metricList, hasSize(3));
    }

    @Test
    public void shouldReturnMetricsFromMetricsDSWhenNoMetricGiven() {
        // given
        List<String> emptyMetrics = new ArrayList<>();
        metricsDS = mock(SonarMetricsAPIDatasource.class);
        when(metricsDS.getAvailableMetricKeys()).thenReturn(Arrays.asList("metricKey"));
        sonar = new SonarMeasuresAPIImporter(measuresDS, metricsDS);

        // when
        List<String> metricList = sonar.getMetricList(emptyMetrics);

        // then
        assertThat(metricList, is(ImmutableList.of("metricKey")));
    }

    @Test
    public void shouldReturnProjectWithNodeFromGetProjectFromMeasureAPI() {
        // given
        String projectKey = "testProject";
        measuresDS = mock(SonarMeasuresAPIDatasource.class);
        sonar = new SonarMeasuresAPIImporter(measuresDS, metricsDS);
        ComponentMap components = new ComponentMap();
        List<Measure> measures = Arrays.asList(new Measure("metric", "1.2"));
        components.updateComponent(new Component("id", "key", "name", "path", Qualifier.FIL, measures));
        when(measuresDS.getComponentMap(projectKey, metrics)).thenReturn(components);

        // when
        Project project = sonar.getProjectFromMeasureAPI(projectKey, "componentShouldBeInsertedAccordingToComponentPath", metrics);

        // then
        assertThat(project, not(nullValue()));
        assertThat(project.getRootNode().getChildren(), hasSize(1));
    }

}
