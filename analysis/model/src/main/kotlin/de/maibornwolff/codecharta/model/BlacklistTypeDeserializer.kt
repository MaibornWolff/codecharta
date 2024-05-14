package de.maibornwolff.codecharta.model

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import java.lang.reflect.Type

class BlacklistTypeDeserializer : JsonDeserializer<BlacklistType> {
    override fun deserialize(
    json: JsonElement,
    typeOfT: Type,
    context: JsonDeserializationContext,
    ): BlacklistType {
        val typeStr = json.asString
        return BlacklistType.entries.first { it.value.equals(typeStr, ignoreCase = true) }
    }
}
