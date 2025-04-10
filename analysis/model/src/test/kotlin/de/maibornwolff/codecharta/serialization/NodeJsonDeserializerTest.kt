package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonArray
import com.google.gson.JsonNull
import com.google.gson.JsonObject
import com.google.gson.JsonParseException
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

class NodeJsonDeserializerTest {
    private val type = NodeType.Folder
    private val nodeClass = MutableNode::class.java

    companion object {
        private const val NAME = "nodeName"
    }

    fun createMinimalJsonObject(): JsonObject {
        val obj = JsonObject()
        obj.addProperty("name", NAME)
        obj.addProperty("type", type.toString())
        return obj
    }

    @Test
    fun `node json deserializer should throw exception if not given a jsonObject`() {
        val deserializer = NodeJsonDeserializer()
        assertFailsWith(IllegalStateException::class) {
            deserializer.deserialize(JsonNull.INSTANCE, nodeClass, null)
        }
    }

    @Test
    fun `node json deserializer should throw exception if type not given`() {
        val deserializer = NodeJsonDeserializer()
        val obj = createMinimalJsonObject()
        obj.remove("type")

        assertFailsWith(JsonParseException::class) {
            deserializer.deserialize(obj, nodeClass, null)
        }
    }

    @Test
    fun `node json deserializer should throw exception if type cryptic`() {
        val deserializer = NodeJsonDeserializer()
        val obj = createMinimalJsonObject()
        obj.addProperty("type", "someCrypticType")

        assertFailsWith(JsonParseException::class) {
            deserializer.deserialize(obj, nodeClass, null)
        }
    }

    @Test
    fun `node json deserializer should throw exception if name not given`() {
        val deserializer = NodeJsonDeserializer()
        val obj = createMinimalJsonObject()
        obj.remove("name")

        assertFailsWith(JsonParseException::class) {
            deserializer.deserialize(obj, nodeClass, null)
        }
    }

    @Test
    fun `deserialize should deserialize node`() {
        val deserializer = NodeJsonDeserializer()
        val obj = createMinimalJsonObject()
        val node = deserializer.deserialize(obj, nodeClass, null)

        assertThat(node.name).isEqualTo(NAME)
        assertThat(node.type).isEqualTo(type)
        assertThat(node.link).isNull()
        assertThat(node.attributes.size).isEqualTo(0)
        assertThat(node.children.size).isEqualTo(0)
    }

    @Test
    fun `deserialize should throw exception if children null object`() {
        val deserializer = NodeJsonDeserializer()
        val obj = createMinimalJsonObject()
        obj.add("children", JsonNull.INSTANCE)

        assertFailsWith(IllegalStateException::class) {
            deserializer.deserialize(obj, nodeClass, null)
        }
    }

    @Test
    fun `json object should deserialize correctly`() {
        val deserializer = NodeJsonDeserializer()
        val obj = createMinimalJsonObject()
        val url = "someUrl"
        obj.addProperty("link", url)

        val attributeName = "bla"
        val attributeValue = 1
        val attributesObject = JsonObject()
        attributesObject.addProperty(attributeName, attributeValue)
        obj.add("attributes", attributesObject)

        val childrenElement = JsonArray()
        childrenElement.add(createMinimalJsonObject())
        obj.add("children", childrenElement)

        val node = deserializer.deserialize(obj, nodeClass, null)

        assertThat(node.link).isEqualTo(url)
        assertThat(node.attributes[attributeName] as Double).isEqualTo(attributeValue.toDouble())
        assertThat(node.children.size).isEqualTo(1)
    }
}
