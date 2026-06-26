package de.maibornwolff.codecharta.serialization

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypeDeserializer
import de.maibornwolff.codecharta.model.AttributeTypeSerializer
import de.maibornwolff.codecharta.serialization.dto.DependencyLensDto
import de.maibornwolff.codecharta.serialization.dto.LensesDto
import de.maibornwolff.codecharta.serialization.dto.MetricsLensDto
import java.lang.reflect.Type

/**
 * The single owner of the 2.0 wire GSON configuration. Both mappers and the (de)serializer share it
 * so the on-disk shape is defined in exactly one place.
 */
object CcJsonV2Gson {
    val gson: Gson =
        GsonBuilder()
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeSerializer())
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeDeserializer())
            .registerTypeAdapter(LensesDto::class.java, LensesDtoSerializer())
            .registerTypeAdapter(LensesDto::class.java, LensesDtoDeserializer())
            .create()

    const val METRICS_KEY = "metrics"
    const val DEPENDENCY_KEY = "dependency"

    private val TYPED_LENS_KEYS = setOf(METRICS_KEY, DEPENDENCY_KEY)

    /** Serializes the typed lenses and re-emits every opaque lens (domain/security/unknown) verbatim. */
    private class LensesDtoSerializer : JsonSerializer<LensesDto> {
        override fun serialize(src: LensesDto, typeOfSrc: Type, context: JsonSerializationContext): JsonElement {
            val result = JsonObject()
            result.add(METRICS_KEY, context.serialize(src.metrics))
            result.add(DEPENDENCY_KEY, context.serialize(src.dependency))
            src.opaqueLenses.forEach { (lensName, lensValue) -> result.add(lensName, lensValue) }
            return result
        }
    }

    /** Reads the typed lenses into typed fields and captures every other key verbatim into `opaqueLenses`. */
    private class LensesDtoDeserializer : JsonDeserializer<LensesDto> {
        override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): LensesDto {
            val jsonObject = json.asJsonObject
            val metrics =
                jsonObject.get(METRICS_KEY)?.let { context.deserialize<MetricsLensDto>(it, MetricsLensDto::class.java) }
                    ?: MetricsLensDto()
            val dependency =
                jsonObject.get(DEPENDENCY_KEY)?.let { context.deserialize<DependencyLensDto>(it, DependencyLensDto::class.java) }
                    ?: DependencyLensDto()
            val opaqueLenses =
                jsonObject
                    .entrySet()
                    .filter { it.key !in TYPED_LENS_KEYS }
                    .associate { it.key to it.value }
            return LensesDto(metrics, dependency, opaqueLenses)
        }
    }
}
