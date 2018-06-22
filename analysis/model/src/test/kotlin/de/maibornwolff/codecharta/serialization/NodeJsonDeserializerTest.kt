/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonArray
import com.google.gson.JsonNull
import com.google.gson.JsonObject
import com.google.gson.JsonParseException
import de.maibornwolff.codecharta.model.MutableNode
import de.maibornwolff.codecharta.model.NodeType
import io.mockk.mockk
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.nullValue
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on
import kotlin.test.assertFailsWith

class NodeJsonDeserializerTest : Spek({
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

            on("deserialize") {

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