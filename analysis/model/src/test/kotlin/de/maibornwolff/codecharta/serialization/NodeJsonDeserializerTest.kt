package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonArray
import com.google.gson.JsonNull
import com.google.gson.JsonObject
import com.google.gson.JsonParseException
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import io.mockk.mockk
import model.src.main.kotlin.de.maibornwolff.codecharta.serialization.NodeJsonDeserializer
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.nullValue
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import kotlin.test.assertFailsWith

class NodeJsonDeserializerTest: Spek({
    val NAME = "nodeName"
    val TYPE = NodeType.Folder
    val nodeClass = MutableNode::class.java

    fun createMinimalJsonObject(): JsonObject {
        val obj = JsonObject()
        obj.addProperty("name", NAME)
        obj.addProperty("type", TYPE.toString())
        return obj
    }

    describe("a node json deserializer") {
        val deserializer = NodeJsonDeserializer()

        it("deserialize should throw exception if not given a jsonObject") {
            assertFailsWith(IllegalStateException::class) {
                deserializer.deserialize(JsonNull.INSTANCE, nodeClass, mockk())
            }
        }

        it("deserialize should throw exception if type not given") {
            val obj = createMinimalJsonObject()
            obj.remove("type")

            assertFailsWith(JsonParseException::class) {
                deserializer.deserialize(obj, nodeClass, mockk())
            }
        }

        it("deserialize should throw exception if type cryptic") {
            val obj = createMinimalJsonObject()
            obj.addProperty("type", "someCrypticType")

            assertFailsWith(JsonParseException::class) {
                deserializer.deserialize(obj, nodeClass, mockk())
            }
        }

        it("deserialize should throw exception if name not given") {
            val obj = createMinimalJsonObject()
            obj.remove("name")

            assertFailsWith(JsonParseException::class) {
                deserializer.deserialize(obj, nodeClass, mockk())
            }
        }

        it("deserialize should deserialize node") {
            val obj = createMinimalJsonObject()
            val node = deserializer.deserialize(obj, nodeClass, mockk())

            assertThat(node.name, `is`(NAME))
            assertThat(node.type, `is`(TYPE))
            assertThat(node.link, nullValue())
            assertThat(node.attributes.size, `is`(0))
            assertThat(node.children.size, `is`(0))
        }

        it("deserialize should throw exception if children null object") {
            val obj = createMinimalJsonObject()
            obj.add("children", JsonNull.INSTANCE)

            assertFailsWith(IllegalStateException::class) {
                deserializer.deserialize(obj, nodeClass, mockk())
            }
        }

        describe("with json object") {
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

            context("deserializing") {

                val node = deserializer.deserialize(obj, nodeClass, mockk())

                it("should deserialize link") {
                    assertThat(node.link, `is`(url))
                }

                it("should deserialize int attribute") {
                    assertThat(node.attributes[attributeName] as Double, `is`(attributeValue.toDouble()))
                }

                it("should deserialize children") {
                    assertThat(node.children.size, `is`(1))
                }
            }
        }
    }
})