package de.maibornwolff.codecharta.analysers.importers.sonar.model

class ComponentMap {
    private val components = mutableMapOf<String, Component>()

    val componentList: MutableCollection<Component>
        get() = components.values

    fun updateComponent(component: Component) {
        val updatableComponent = components[component.key]
        if (updatableComponent != null) {
            updatableComponent.measures!!.addAll(component.measures!!)
        } else {
            components[component.key!!] = component
        }
    }
}
