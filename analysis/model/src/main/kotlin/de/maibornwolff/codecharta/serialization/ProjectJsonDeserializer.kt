package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.reflect.TypeToken
import de.maibornwolff.codecharta.model.Dependency
import de.maibornwolff.codecharta.model.DependencyType
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project
import java.lang.reflect.Type


class ProjectJsonDeserializer : JsonDeserializer<Project> {
    override fun deserialize(json: JsonElement, typeOfT: Type?, context: JsonDeserializationContext): Project {
        val jsonNode = json.asJsonObject

        val listOfNodesType = object : TypeToken<List<Node>>() {}.type
        val dependencyMapType = object : TypeToken<Map<DependencyType, MutableList<Dependency>>>() {}.type

        val projectName = jsonNode.get("projectName")?.asString ?: ""
        val nodes = context.deserialize<List<Node>>(jsonNode.get("nodes"), listOfNodesType) ?: listOf()
        val apiVersion = jsonNode.get("apiVersion")?.asString ?: Project.API_VERSION
        val dependencies =
                context.deserialize<Map<DependencyType, MutableList<Dependency>>>(jsonNode.get("dependencies"), dependencyMapType)
                        ?: mapOf()

        return Project(projectName, nodes, apiVersion, dependencies.toMutableMap())
    }

}
