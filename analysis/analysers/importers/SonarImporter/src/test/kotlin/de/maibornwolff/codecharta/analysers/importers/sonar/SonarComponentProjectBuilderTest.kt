package de.maibornwolff.codecharta.analysers.importers.sonar

import de.maibornwolff.codecharta.analysers.importers.sonar.model.Component
import de.maibornwolff.codecharta.analysers.importers.sonar.model.ComponentMap
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Measure
import de.maibornwolff.codecharta.analysers.importers.sonar.model.Qualifier
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class SonarComponentProjectBuilderTest {
    @Test
    fun `should insert a node from file component without key and use name as backup value`() { // given
        val measure = Measure("metric", "50.0")
        val name = "name"
        val component = Component("id", null, name, "path", Qualifier.FIL, listOf(measure).toMutableList())
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertEquals(project.rootNode.children.size, 1)
        val actualNode = project.rootNode.children.toMutableList()[0]
        assertEquals(actualNode.name, name)
    }

    @Test
    fun `should insert a node from file component without key and name and use id as backup value`() { // given
        val measure = Measure("metric", "50.0")
        val id = "id"
        val component = Component(id, null, null, null, Qualifier.FIL, listOf(measure).toMutableList())
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertEquals(project.rootNode.children.size, 1)
        val actualNode = project.rootNode.children.toMutableList()[0]
        assertEquals(actualNode.name, id)
    }

    @Test
    fun `should insert a node from file component`() { // given
        val metric = "metric"
        val value = "50.0"
        val measure = Measure(metric, value)
        val id = "id"
        val key = "key"
        val name = "name"
        val path = "someFileName"
        val component = Component(id, key, name, path, Qualifier.FIL, listOf(measure).toMutableList())
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertEquals(project.rootNode.children.size, 1)
        val actualNode = project.rootNode.children.toMutableList()[0]
        assertEquals(actualNode.name, key)
        assertEquals(actualNode.type, NodeType.File)
        assertEquals(actualNode.attributes[metric], java.lang.Double.valueOf(value))
        assertEquals(actualNode.children.size, 0)
        assertEquals(actualNode.link, "")
    }

    @Test
    fun `should ignore string measures`() { // given
        val measure = Measure("metric", "bla")
        val component = Component("id", "key", "name", "path", Qualifier.FIL, listOf(measure).toMutableList())
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertEquals(project.rootNode.children.size, 1)
        val actualNode = project.rootNode.children.toMutableList()[0]
        assertEquals(actualNode.attributes.keys.size, 0)
    }

    @Test
    fun `should insert a file node from its component`() { // given
        val component = Component("id", "key", "name", "path", Qualifier.UTS)
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertEquals(project.rootNode.children.size, 1)
        val actualNode = project.rootNode.children.toMutableList()[0]
        assertEquals(actualNode.type, NodeType.File)
    }

    @Test
    fun `should insert a folder node from dir component`() { // given
        val component = Component("id", "key", "name", "path", Qualifier.DIR)
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component)

        // then
        assertEquals(project.size, 1)
    }

    @Test
    fun `should insert component from component map`() { // given
        val component = Component("id", "key", "name", "path", Qualifier.FIL)
        val components = ComponentMap()
        components.updateComponent(component)
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component)

        // then
        assertEquals(project.size, 1)
    }

    @Test
    fun `should insert component by path if configured`() { // given
        val path = "someFileName"
        val component = Component("id", "key", "name", path, Qualifier.FIL)
        val projectBuilder = SonarComponentProjectBuilder(SonarCodeURLLinker.NULL, MetricNameTranslator.TRIVIAL, true)

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertEquals(project.rootNode.children.size, 1)
        val actualNode = project.rootNode.children.toMutableList()[0]
        assertEquals(actualNode.name, path)
        assertEquals(actualNode.type, NodeType.File)
    }

    @Test
    fun `should contain attribute descriptors in project after building`() {
        val path = "someFileName"
        val component = Component("id", "key", "name", path, Qualifier.FIL)
        val projectBuilder = SonarComponentProjectBuilder(SonarCodeURLLinker.NULL, MetricNameTranslator.TRIVIAL, true)
        projectBuilder.addComponentAsNode(component).addAttributeDescriptions(getAttributeDescriptors())

        val project = projectBuilder.build()

        assertEquals(project.attributeDescriptors, getAttributeDescriptors())
    }
}
