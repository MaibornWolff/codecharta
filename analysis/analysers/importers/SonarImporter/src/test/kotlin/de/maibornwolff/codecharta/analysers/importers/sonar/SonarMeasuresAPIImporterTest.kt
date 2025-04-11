package de.maibornwolff.codecharta.analysers.importers.sonar

import com.github.tomakehurst.wiremock.client.WireMock.aResponse
import com.github.tomakehurst.wiremock.client.WireMock.get
import com.github.tomakehurst.wiremock.client.WireMock.stubFor
import com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Component
import de.maibornwolff.codecharta.analysers.importers.sonar.model.ComponentMap
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Measure
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Qualifier
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.net.URL

private const val PORT = 8089

@WireMockTest(httpPort = PORT)
class SonarMeasuresAPIImporterTest {
    private val metrics = listOf("MetricOne", "MetricTwo", "MetricThree")

    private var measuresDS: SonarMeasuresAPIDatasource? = mockk()

    private var metricsDS: SonarMetricsAPIDatasource = mockk()

    @Test
    fun `should get metrics when metrics given`() { // given
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)

        // when
        val metricList = sonar.getMetricList(metrics)

        // then
        assertEquals(metricList.size, 3)
    }

    @Test
    fun `should return metrics from metrics ds when no metric given`() { // given
        val emptyMetrics = listOf<String>()
        every { metricsDS.availableMetricKeys } returns listOf("metricKey")
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)

        // when
        val metricList = sonar.getMetricList(emptyMetrics)

        // then
        assertEquals(metricList, listOf("metricKey"))
    }

    @Test
    fun `should return project with node from get project from measure api`() { // given
        val projectKey = "testProject"
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)
        val components = ComponentMap()
        val measures = mutableListOf(Measure("metric", "1.2"))
        components.updateComponent(Component("id", "key", "name", "path", Qualifier.FIL, measures))
        every { measuresDS!!.getComponentMap(projectKey, metrics) } returns components

        // when
        val project = sonar.getProjectFromMeasureAPI("testProject", metrics)

        // then
        assertNotEquals(project, null)
        assertEquals(project.rootNode.children.size, 1)
    }

    @Test
    @Throws(Exception::class)
    fun `should build the right structure`() {
        // given
        val projectKey = "someProject"
        val urlPath = "/api/measures/component_tree?component=$projectKey&qualifiers=FIL,UTS&metricKeys=coverage&p=1&ps=500"
        stubFor(
            get(urlEqualTo(urlPath)).willReturn(
                aResponse().withHeader("Content-Type", "application/json").withStatus(200)
                    .withBody(this.javaClass.classLoader.getResource("sonarqube_measures.json")!!.readText())
            )
        )

        val measuresApiDatasource = SonarMeasuresAPIDatasource("", URL("http://localhost:$PORT"))
        val sonar = SonarMeasuresAPIImporter(measuresApiDatasource, metricsDS)

        // when
        val project = sonar.getProjectFromMeasureAPI(projectKey, listOf("coverage"))

        // then
        assertEquals("root", project.rootNode.name)
        assertEquals(1, project.rootNode.children.size)
        assertEquals("codecharta", project.rootNode.children.first().name)
        assertEquals(2, project.rootNode.children.first().children.size)
        assertTrue(project.rootNode.children.first().children.map { it.name }.contains("import"))
        assertTrue(project.rootNode.children.first().children.map { it.name }.contains("model"))
    }

    @Test
    fun `should insert no attribute descriptors if requesting unknown metric`() { // given
        val projectKey = "testProject"
        val sonar = SonarMeasuresAPIImporter(measuresDS, metricsDS)
        val components = ComponentMap()
        val measures = mutableListOf(Measure("metric", "1.2"))
        components.updateComponent(Component("id", "key", "name", "path", Qualifier.FIL, measures))
        every { measuresDS!!.getComponentMap(projectKey, metrics) } returns components

        // when
        val project = sonar.getProjectFromMeasureAPI("testProject", metrics)

        // then
        assertEquals(project.attributeDescriptors.size, 0)
    }

    @Test
    fun `should insert only needed descriptors and should be renamed`() { // given
        val projectKey = "testProject"
        val sonar =
            SonarMeasuresAPIImporter(
                measuresDS,
                metricsDS,
                translator = SonarMetricTranslatorFactory.createMetricTranslator()
            )
        val components = ComponentMap()
        val measures = mutableListOf(Measure("metric", "1.2"))
        val actualMetricKeys = listOf("bugs", "ncloc")
        components.updateComponent(Component("id", "key", "name", "path", Qualifier.FIL, measures))
        every { measuresDS!!.getComponentMap(projectKey, actualMetricKeys) } returns components

        // when
        val project = sonar.getProjectFromMeasureAPI("testProject", actualMetricKeys)

        // then translation from bugs -> sonar_bugs ; ncloc -> rloc
        assertEquals(project.attributeDescriptors.size, 2)
        assertEquals(project.attributeDescriptors["sonar_bugs"], getAttributeDescriptors()["bugs"])
        assertEquals(project.attributeDescriptors["rloc"], getAttributeDescriptors()["ncloc"])
    }
}
