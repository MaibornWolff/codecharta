package de.maibornwolff.codecharta.analysers.importers.sonar.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class ComponentMapTest {
    @Test
    fun `updateComponent should update existing values and add new ones`() {
        val identicalKeyCheck = "someKey"
        val measureBase = Measure("someMetric", "42")
        val measureToAdd = mutableListOf(Measure("anotherMetric", "0"), Measure("someMetric", "5"))
        val componentMap = ComponentMap()
        val component = Component("baseComponent", identicalKeyCheck, null, null, null, mutableListOf(measureBase))
        val anotherComponent = Component("anotherComponent", "someOtherKey", null, null, null)
        val componentToMerge = Component("merger", identicalKeyCheck, null, null, null, measureToAdd)

        assertThat(componentMap.componentList).hasSize(0)
        componentMap.updateComponent(component)
        componentMap.updateComponent(anotherComponent)
        assertThat(componentMap.componentList.take(1)[0]).isEqualTo(component)
        assertThat(componentMap.componentList.take(2)[1]).isEqualTo(anotherComponent)
        assertThat(componentMap.componentList).hasSize(2)

        // Measures are simply added, not merged
        componentMap.updateComponent(componentToMerge)
        assertThat(componentMap.componentList.first().measures).isEqualTo(mutableListOf(measureBase) + measureToAdd)
    }
}
