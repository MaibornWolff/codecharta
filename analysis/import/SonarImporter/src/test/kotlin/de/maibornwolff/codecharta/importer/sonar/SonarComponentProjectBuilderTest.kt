package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.importer.sonar.model.Component
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap
import de.maibornwolff.codecharta.importer.sonar.model.Measure
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.hamcrest.Matchers.*
import org.junit.Assert.assertThat
import org.junit.Test

class SonarComponentProjectBuilderTest {

    @Test
    fun should_insert_a_node_from_file_component_without_key_and_use_name_as_backup_value() {
        // given
        val measure = Measure("metric", "50.0")
        val name = "name"
        val component = Component("id", null, name, "path", Qualifier.FIL, listOf(measure).toMutableList())
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertThat(project.rootNode.children, hasSize(1))
        val actualNode = project.rootNode.children[0]
        assertThat(actualNode.name, `is`(name))
    }

    @Test
    fun should_insert_a_node_from_file_component_without_key_and_name_and_use_id_as_backup_value() {
        // given
        val measure = Measure("metric", "50.0")
        val id = "id"
        val component = Component(id, null, null, null, Qualifier.FIL, listOf(measure).toMutableList())
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertThat(project.rootNode.children, hasSize(1))
        val actualNode = project.rootNode.children[0]
        assertThat(actualNode.name, `is`(id))
    }

    @Test
    fun should_insert_a_node_from_file_component() {
        // given
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
        assertThat(project.rootNode.children, hasSize(1))
        val actualNode = project.rootNode.children[0]
        assertThat(actualNode.name, `is`(key))
        assertThat(actualNode.type, `is`(NodeType.File))
        assertThat(actualNode.attributes, hasEntry<String, Any>(metric, java.lang.Double.valueOf(value)))
        assertThat(actualNode.children, hasSize(0))
        assertThat(actualNode.link, `is`(""))
    }

    @Test
    fun should_ignore_string_measures() {
        // given
        val measure = Measure("metric", "bla")
        val component = Component("id", "key", "name", "path", Qualifier.FIL, listOf(measure).toMutableList())
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertThat(project.rootNode.children, hasSize(1))
        val actualNode = project.rootNode.children[0]
        assertThat<Set<String>>(actualNode.attributes.keys, hasSize(0))
    }

    @Test
    fun should_insert_a_file_node_from_uts_component() {
        // given
        val component = Component("id", "key", "name", "path", Qualifier.UTS)
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertThat(project.rootNode.children, hasSize(1))
        val actualNode = project.rootNode.children[0]
        assertThat(actualNode.type, `is`(NodeType.File))
    }

    @Test
    fun should_insert_a_folder_node_from_dir_component() {
        // given
        val component = Component("id", "key", "name", "path", Qualifier.DIR)
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component)

        // then
        assertThat(project.size, `is`(1))
    }

    @Test
    fun should_insert_component_from_component_map() {
        // given
        val component = Component("id", "key", "name", "path", Qualifier.FIL)
        val components = ComponentMap()
        components.updateComponent(component)
        val projectBuilder = SonarComponentProjectBuilder()

        // when
        val project = projectBuilder.addComponentAsNode(component)

        // then
        assertThat(project.size, `is`(1))
    }

    @Test
    fun should_insert_component_by_path_if_configured() {
        // given
        val path = "someFileName"
        val component = Component("id", "key", "name", path, Qualifier.FIL)
        val projectBuilder =
                SonarComponentProjectBuilder(SonarCodeURLLinker.NULL, MetricNameTranslator.TRIVIAL, true)

        // when
        val project = projectBuilder.addComponentAsNode(component).build()

        // then
        assertThat(project.rootNode.children, hasSize(1))
        val actualNode = project.rootNode.children[0]
        assertThat(actualNode.name, `is`(path))
        assertThat(actualNode.type, `is`(NodeType.File))
    }
}