package de.maibornwolff.codecharta.serialization

import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParseException
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import java.lang.reflect.Type

internal class NodeJsonDeserializer : JsonDeserializer<Node> {
    override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext?): Node {
        val jsonNode = json.asJsonObject

        val name = deserializeName(jsonNode)
        val nodeType = deserializeNodeType(jsonNode)
        val attributes = deserializeAttributes(jsonNode)
        val link = deserializeLink(jsonNode)
        val children = deserializeChildren(jsonNode)

        return Node(name, nodeType, attributes, link, children.toSet())
    }

    private fun deserializeLink(jsonNode: JsonObject): String? {
        return jsonNode.get("link")?.asString
    }

    private fun deserializeNodeType(jsonNode: JsonObject): NodeType {
        val typeElement = jsonNode.get("type") ?: throw JsonParseException("Type element is missing.")
        val nodeType: NodeType
        try {
            nodeType = NodeType.valueOf(typeElement.asString)
        } catch (e: IllegalArgumentException) {
            throw JsonParseException("Type " + typeElement.asString + " not supported.", e)
        }

        return nodeType
    }

    private fun deserializeName(jsonNode: JsonObject): String {
        val nameElement = jsonNode.get("name") ?: throw JsonParseException("Name element is missing.")
        return nameElement.asString
    }

    private fun deserializeAttributes(jsonNode: JsonObject): Map<String, Any> {
        val attributes = jsonNode.get("attributes") ?: return mapOf()

        val gson = GsonBuilder().create()
        return gson.fromJson<Map<String, Any>>(attributes, Map::class.java)
    }

    private fun deserializeChildren(jsonNode: JsonObject): List<Node> {
        val children = jsonNode.get("children") ?: return listOf()

        return children.asJsonArray.mapTo(ArrayList()) {
            deserialize(it, Node::class.java, null)
        }
    }
}
