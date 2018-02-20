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
import de.maibornwolff.codecharta.model.NodeType
import io.mockk.mockk
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.CoreMatchers.nullValue
import org.junit.Assert.assertThat
import org.junit.Test

class NodeJsonDeserializerTest {
    private val deserializer = NodeJsonDeserializer()

    private fun createMinimalJsonObject(): JsonObject {
        val obj = JsonObject()
        obj.addProperty("name", NAME)
        obj.addProperty("type", TYPE.toString())
        return obj
    }

    @Test(expected = IllegalStateException::class)
    fun should_throw_exception_if_not_given_a_jsonObject() {
        // when
        deserializer.deserialize(JsonNull.INSTANCE, mockk(), mockk())
        // then throw
    }

    @Test
    fun should_deserialize_node() {
        // given
        val obj = createMinimalJsonObject()
        // when
        val node = deserializer.deserialize(obj, mockk(), mockk())
        // then
        assertThat(node.name, `is`(NAME))
        assertThat(node.type, `is`(TYPE))
        assertThat(node.link, nullValue())
        assertThat(node.attributes.size, `is`(0))
        assertThat(node.children.size, `is`(0))
    }

    @Test(expected = JsonParseException::class)
    fun should_throw_exception_if_type_not_given() {
        // given
        val obj = createMinimalJsonObject()
        obj.remove("type")
        // when
        deserializer.deserialize(obj, mockk(), mockk())
        // then throw
    }

    @Test(expected = JsonParseException::class)
    fun should_throw_exception_if_type_cryptic() {
        // given
        val obj = createMinimalJsonObject()
        obj.addProperty("type", "someCrypticType")
        // when
        deserializer.deserialize(obj, mockk(), mockk())
        // then throw
    }

    @Test(expected = JsonParseException::class)
    fun should_throw_exception_if_name_not_given() {
        // given
        val obj = createMinimalJsonObject()
        obj.remove("name")
        // when
        deserializer.deserialize(obj, mockk(), mockk())
        // then throw
    }

    @Test
    fun should_deserialize_link() {
        // given
        val obj = createMinimalJsonObject()
        val url = "someUrl"
        obj.addProperty("link", url)
        // when
        val node = deserializer.deserialize(obj, mockk(), mockk())
        // then
        assertThat(node.link, `is`(url))
    }

    @Test
    fun should_deserialize_int_attribute() {
        // given
        val attributeName = "bla"
        val attributeValue = 1
        val obj = createMinimalJsonObject()
        val attributesObject = JsonObject()
        attributesObject.addProperty(attributeName, attributeValue)
        obj.add("attributes", attributesObject)
        // when
        val node = deserializer.deserialize(obj, mockk(), mockk())
        // then
        assertThat<Any>(node.attributes[attributeName], `is`(attributeValue.toDouble()))
    }

    @Test(expected = IllegalStateException::class)
    fun should_throw_exception_if_children_null_object() {
        // given
        val obj = createMinimalJsonObject()
        obj.add("children", JsonNull.INSTANCE)
        // when
        deserializer.deserialize(obj, mockk(), mockk())
        // then throw
    }

    @Test
    fun should_deserialize_children() {
        // given
        val obj = createMinimalJsonObject()
        val childrenElement = JsonArray()
        childrenElement.add(createMinimalJsonObject())
        obj.add("children", childrenElement)
        // when
        val node = deserializer.deserialize(obj, mockk(), mockk())
        // then
        assertThat(node.children.size, `is`(1))
    }

    companion object {

        private const val NAME = "nodeName"
        private val TYPE = NodeType.Folder
    }
}