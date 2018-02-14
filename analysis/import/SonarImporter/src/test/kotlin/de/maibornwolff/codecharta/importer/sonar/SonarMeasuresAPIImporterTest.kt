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

package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.model.Component
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap
import de.maibornwolff.codecharta.importer.sonar.model.Measure
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier
import io.mockk.every
import io.mockk.mockk
import org.hamcrest.CoreMatchers.not
import org.hamcrest.Matchers.*
import org.junit.Assert.assertThat
import org.junit.Test
import java.util.*

class SonarMeasuresAPIImporterTest {

    private val metrics = Arrays.asList("MetricOne", "MetricTwo", "MetricThree")

    private var measuresDS: SonarMeasuresAPIDatasource? = mockk()

    private var metricsDS: SonarMetricsAPIDatasource = mockk()

    @Test
    fun shouldGetMetricsWhenMetricsGiven() {
        // given
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)

        // when
        val metricList = sonar.getMetricList(metrics)

        // then
        assertThat(metricList, hasSize(3))
    }

    @Test
    fun shouldReturnMetricsFromMetricsDSWhenNoMetricGiven() {
        // given
        val emptyMetrics = listOf<String>()
        every { metricsDS.availableMetricKeys } returns listOf("metricKey")
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)

        // when
        val metricList = sonar.getMetricList(emptyMetrics)

        // then
        assertThat(metricList, `is`<List<String>>(listOf("metricKey")))
    }

    @Test
    fun shouldReturnProjectWithNodeFromGetProjectFromMeasureAPI() {
        // given
        val projectKey = "testProject"
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)
        val components = ComponentMap()
        val measures = Arrays.asList(Measure("metric", "1.2"))
        components.updateComponent(Component("id", "key", "name", "path", Qualifier.FIL, measures))
        every { measuresDS!!.getComponentMap(projectKey, metrics) } returns components

        // when
        val project = sonar.getProjectFromMeasureAPI(projectKey, "componentShouldBeInsertedAccordingToComponentPath", metrics)

        // then
        assertThat(project, not(nullValue()))
        assertThat(project.rootNode.children, hasSize(1))
    }

}
