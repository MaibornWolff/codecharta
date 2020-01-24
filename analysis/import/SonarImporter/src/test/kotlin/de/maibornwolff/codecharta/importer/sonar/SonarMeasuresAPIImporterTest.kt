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
        val project =
                sonar.getProjectFromMeasureAPI("testProject", metrics)

        // then
        assertThat(project, not(nullValue()))
        assertThat(project.rootNode.children, hasSize(1))
    }
}
