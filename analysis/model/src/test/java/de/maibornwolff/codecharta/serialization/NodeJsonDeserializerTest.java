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

package de.maibornwolff.codecharta.serialization;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonArray;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.junit.Assert.assertThat;

public class NodeJsonDeserializerTest {
    private final NodeJsonDeserializer deserializer = new NodeJsonDeserializer();

    private static final String NAME = "nodeName";
    private static final NodeType TYPE = NodeType.Folder;

    private JsonObject createMinimalJsonObject() {
        JsonObject obj = new JsonObject();
        obj.addProperty("name", NAME);
        obj.addProperty("type", TYPE.toString());
        return obj;
    }

    @Test(expected = IllegalStateException.class)
    public void should_throw_exception_if_not_given_a_jsonObject() {
        // when
        deserializer.deserialize(JsonNull.INSTANCE, null, null);
        // then throw
    }

    @Test
    public void should_deserialize_node() {
        // given
        Node expectedNode = new Node(NAME, TYPE, ImmutableMap.of(), null, ImmutableList.of());
        JsonObject obj = createMinimalJsonObject();
        // when
        Node node = deserializer.deserialize(obj, null, null);
        // then
        assertThat(node, is(expectedNode));
        assertThat(node.getName(), is(NAME));
        assertThat(node.getType(), is(TYPE));
        assertThat(node.getLink(), nullValue());
        assertThat(node.getAttributes().size(), is(0));
        assertThat(node.getChildren().size(), is(0));
    }

    @Test(expected = JsonParseException.class)
    public void should_throw_exception_if_type_not_given() {
        // given
        JsonObject obj = createMinimalJsonObject();
        obj.remove("type");
        // when
        deserializer.deserialize(obj, null, null);
        // then throw
    }

    @Test(expected = JsonParseException.class)
    public void should_throw_exception_if_type_cryptic() {
        // given
        JsonObject obj = createMinimalJsonObject();
        obj.addProperty("type", "someCrypticType");
        // when
        deserializer.deserialize(obj, null, null);
        // then throw
    }

    @Test(expected = JsonParseException.class)
    public void should_throw_exception_if_name_not_given() {
        // given
        JsonObject obj = createMinimalJsonObject();
        obj.remove("name");
        // when
        deserializer.deserialize(obj, null, null);
        // then throw
    }

    @Test
    public void should_deserialize_link() {
        // given
        JsonObject obj = createMinimalJsonObject();
        String url = "someUrl";
        obj.addProperty("link", url);
        // when
        Node node = deserializer.deserialize(obj, null, null);
        // then
        assertThat(node.getLink(), is(url));
    }

    @Test
    public void should_deserialize_int_attribute() {
        // given
        String attributeName = "bla";
        Integer attributeValue = 1;
        JsonObject obj = createMinimalJsonObject();
        JsonObject attributesObject = new JsonObject();
        attributesObject.addProperty(attributeName, attributeValue);
        obj.add("attributes", attributesObject);
        // when
        Node node = deserializer.deserialize(obj, null, null);
        // then
        assertThat(node.getAttributes().get(attributeName), is(attributeValue.doubleValue()));
    }

    @Test(expected = IllegalStateException.class)
    public void should_throw_exception_if_children_null_object() {
        // given
        JsonObject obj = createMinimalJsonObject();
        obj.add("children", JsonNull.INSTANCE);
        // when
        deserializer.deserialize(obj, null, null);
        // then throw
    }

    @Test
    public void should_deserialize_children() {
        // given
        JsonObject obj = createMinimalJsonObject();
        JsonArray childrenElement = new JsonArray();
        childrenElement.add(createMinimalJsonObject());
        obj.add("children", childrenElement);
        // when
        Node node = deserializer.deserialize(obj, null, null);
        // then
        assertThat(node.getChildren().size(), is(1));
    }
}