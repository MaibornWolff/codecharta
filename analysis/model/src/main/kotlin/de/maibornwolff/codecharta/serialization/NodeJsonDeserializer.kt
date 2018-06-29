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

import com.google.gson.*
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import java.lang.reflect.Type
import java.util.*

internal class NodeJsonDeserializer : JsonDeserializer<Node> {

    override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): Node {
        val jsonNode = json.asJsonObject

        val name = deserializeName(jsonNode)
        val nodeType = deserializeNodeType(jsonNode)
        val attributes = deserializeAttributes(context, jsonNode)
        val link = deserializeLink(jsonNode)
        val children = deserializeChildren(context, jsonNode)

        return Node(name, nodeType, attributes, link, children)
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

    private fun deserializeAttributes(context: JsonDeserializationContext, jsonNode: JsonObject): Map<String, Any> {
        val attributes = jsonNode.get("attributes") ?: return mapOf()

        val gson = GsonBuilder().create()
        return gson.fromJson<Map<String, Any>>(attributes, Map::class.java)
    }

    private fun deserializeChildren(context: JsonDeserializationContext, jsonNode: JsonObject): List<Node> {
        val children = jsonNode.get("children") ?: return listOf()

        return children.asJsonArray.mapTo(ArrayList()) { deserialize(it, Node::class.java, context) }
    }
}
