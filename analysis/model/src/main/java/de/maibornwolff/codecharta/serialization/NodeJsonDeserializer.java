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

import com.google.gson.*;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class NodeJsonDeserializer implements JsonDeserializer<Node> {

    @Override
    public Node deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) {
        JsonObject jsonNode = json.getAsJsonObject();

        String name = deserializeName(jsonNode);
        NodeType nodeType = deserializeNodeType(jsonNode);
        Map<String, Object> attributes = deserializeAttributes(context, jsonNode);
        String link = deserializeLink(jsonNode);
        List<Node> children = deserializeChildren(context, jsonNode);

        return new Node(name, nodeType, attributes, link, children);
    }

    private String deserializeLink(JsonObject jsonNode) {
        JsonElement linkElement = jsonNode.get("link");
        return linkElement == null ? null : linkElement.getAsString();
    }

    private NodeType deserializeNodeType(JsonObject jsonNode) {
        JsonElement typeElement = jsonNode.get("type");
        if (typeElement == null) {
            throw new JsonParseException("Type element is missing.");
        }
        NodeType nodeType;
        try {
            nodeType = NodeType.valueOf(typeElement.getAsString());
        } catch (IllegalArgumentException e) {
            throw new JsonParseException("Type " + typeElement.getAsString() + " not supported.", e);
        }
        return nodeType;
    }

    private String deserializeName(JsonObject jsonNode) {
        JsonElement nameElement = jsonNode.get("name");
        if (nameElement == null) {
            throw new JsonParseException("Name element is missing.");
        }
        return nameElement.getAsString();
    }

    private Map<String, Object> deserializeAttributes(JsonDeserializationContext context, JsonObject jsonNode) {
        JsonElement attributes = jsonNode.get("attributes");
        if (attributes == null) return new HashMap<>();

        Gson gson = new GsonBuilder().create();
        return gson.fromJson(attributes, Map.class);
    }

    private List<Node> deserializeChildren(JsonDeserializationContext context, JsonObject jsonNode) {
        JsonElement children = jsonNode.get("children");
        if (children == null) return new ArrayList<>();

        List<Node> deserializedChildren = new ArrayList<>();
        JsonArray array = children.getAsJsonArray();
        for (JsonElement element : array) {
            deserializedChildren.add(deserialize(element, Node.class, context));
        }

        return deserializedChildren;
    }
}
