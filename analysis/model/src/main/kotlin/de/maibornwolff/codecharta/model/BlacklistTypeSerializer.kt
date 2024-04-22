package de.maibornwolff.codecharta.model

import com.google.gson.JsonElement
import com.google.gson.JsonPrimitive
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import java.lang.reflect.Type
import java.util.Locale

class BlacklistTypeSerializer : JsonSerializer<BlacklistType> {
    override fun serialize(
    src: BlacklistType?,
    typeOfSrc: Type?,
    context: JsonSerializationContext?,
    ): JsonElement {
        return JsonPrimitive(src?.value?.lowercase(Locale.getDefault()))
    }
}
