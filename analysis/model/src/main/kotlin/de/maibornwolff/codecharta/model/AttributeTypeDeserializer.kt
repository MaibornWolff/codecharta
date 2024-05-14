package de.maibornwolff.codecharta.model

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type

class AttributeTypeDeserializer : JsonDeserializer<AttributeType> {
    override fun deserialize(
    json: JsonElement,
    typeOfT: Type,
    context: JsonDeserializationContext,
    ): AttributeType {
        val typeStr = json.asString
        return AttributeType.entries.first { it.value.equals(typeStr, ignoreCase = true) }
    }
}
