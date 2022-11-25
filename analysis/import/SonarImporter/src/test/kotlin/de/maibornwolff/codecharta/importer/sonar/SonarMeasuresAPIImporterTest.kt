package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.model.Component
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap
import de.maibornwolff.codecharta.importer.sonar.model.Measure
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test

class SonarMeasuresAPIImporterTest {

    private val metrics = listOf("MetricOne", "MetricTwo", "MetricThree")

    private var measuresDS: SonarMeasuresAPIDatasource? = mockk()

    private var metricsDS: SonarMetricsAPIDatasource = mockk()

    @Test
    fun `should get metrics when metrics given`() {
        // given
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)

        // when
        val metricList = sonar.getMetricList(metrics)

        // then
        assertEquals(metricList.size, 3)
    }

    @Test
    fun `should return metrics from metrics ds when no metric given`() {
        // given
        val emptyMetrics = listOf<String>()
        every { metricsDS.availableMetricKeys } returns listOf("metricKey")
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)

        // when
        val metricList = sonar.getMetricList(emptyMetrics)

        // then
        assertEquals(metricList, listOf("metricKey"))
    }

    @Test
    fun `should return project with node from get project from measure api`() {
        // given
        val projectKey = "testProject"
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)
        val components = ComponentMap()
        val measures = mutableListOf(Measure("metric", "1.2"))
        components.updateComponent(Component("id", "key", "name", "path", Qualifier.FIL, measures))
        every { measuresDS!!.getComponentMap(projectKey, metrics) } returns components

        // when
        val project =
            sonar.getProjectFromMeasureAPI("testProject", metrics)

        // then
        assertNotEquals(project, null)
        assertEquals(project.rootNode.children.size, 1)
    }

    @Test
    fun `should insert no attribute descriptors if requesting unknown metric`() {
        // given
        val projectKey = "testProject"
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)
        val components = ComponentMap()
        val measures = mutableListOf(Measure("metric", "1.2"))
        components.updateComponent(Component("id", "key", "name", "path", Qualifier.FIL, measures))
        every { measuresDS!!.getComponentMap(projectKey, metrics) } returns components

        // when
        val project =
            sonar.getProjectFromMeasureAPI("testProject", metrics)

        // then
        assertEquals(project.attributeDescriptors.size, 0)
    }

    @Test
    fun `should insert only needed descriptors and should be renamed`() {
        // given
        val projectKey = "testProject"
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS, translator = SonarMetricTranslatorFactory.createMetricTranslator())
        val components = ComponentMap()
        val measures = mutableListOf(Measure("metric", "1.2"))
        val actualMetricKeys = listOf("bugs", "ncloc")
        components.updateComponent(Component("id", "key", "name", "path", Qualifier.FIL, measures))
        every { measuresDS!!.getComponentMap(projectKey, actualMetricKeys) } returns components

        // when
        val project =
            sonar.getProjectFromMeasureAPI("testProject", actualMetricKeys)

        // then translation from bugs -> sonar_bugs ; ncloc -> rloc
        assertEquals(project.attributeDescriptors.size, 2)
        assertEquals(project.attributeDescriptors["sonar_bugs"], getAttributeDescriptors()["bugs"])
        assertEquals(project.attributeDescriptors["rloc"], getAttributeDescriptors()["ncloc"])
    }
}
