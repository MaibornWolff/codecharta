package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.reflect.TypeToken
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Project
import java.lang.reflect.Type


class ProjectJsonDeserializer : JsonDeserializer<Project> {
    override fun deserialize(json: JsonElement, typeOfT: Type?, context: JsonDeserializationContext): Project {
        val jsonNode = json.asJsonObject

        val listOfNodesType = object : TypeToken<List<Node>>() {}.type
        val listOfEdgesType = object : TypeToken<List<Edge>>() {}.type

        val projectName = jsonNode.get("projectName")?.asString ?: ""
        val nodes = context.deserialize<List<Node>>(jsonNode.get("nodes"), listOfNodesType) ?: listOf()
        val apiVersion = jsonNode.get("apiVersion")?.asString ?: Project.API_VERSION
        val edges = context.deserialize<List<Edge>>(jsonNode.get("edges"), listOfEdgesType) ?: listOf()

        return Project(projectName, nodes, apiVersion, edges.toMutableList())
    }

}
