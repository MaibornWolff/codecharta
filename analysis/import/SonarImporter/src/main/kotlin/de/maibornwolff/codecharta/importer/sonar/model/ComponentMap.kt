package de.maibornwolff.codecharta.importer.sonar.model

class ComponentMap {
    private val components = mutableMapOf<String, Component>()

    val componentList: MutableCollection<Component>
        get() = components.values

    fun updateComponent(component: Component) {
        if (components.containsKey(component.key)) {
            val updateableComponent = components[component.key]!!
            updateableComponent.measures!!.addAll(component.measures!!)
        } else {
            components[component.key!!] = component
        }
    }
}
