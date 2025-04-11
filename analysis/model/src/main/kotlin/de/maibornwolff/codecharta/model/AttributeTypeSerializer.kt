package de.maibornwolff.codecharta.model

import com.google.gson.JsonElement
import com.google.gson.JsonPrimitive
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import java.lang.reflect.Type
import java.util.Locale

class AttributeTypeSerializer : JsonSerializer<AttributeType> {
    override fun serialize(src: AttributeType?, typeOfSrc: Type?, context: JsonSerializationContext?): JsonElement {
        return JsonPrimitive(src?.value?.lowercase(Locale.getDefault()))
    }
}
