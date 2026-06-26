package de.maibornwolff.codecharta.serialization

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import com.google.gson.reflect.TypeToken
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
    private val anyMapType: Type = object : TypeToken<Map<String, Any>>() {}.type

    val gson: Gson =
        GsonBuilder()
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeSerializer())
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeDeserializer())
            .registerTypeAdapter(LensesDto::class.java, LensesDtoSerializer())
            .registerTypeAdapter(LensesDto::class.java, LensesDtoDeserializer())
            .create()

    const val METRICS_KEY = "metrics"
    const val DEPENDENCY_KEY = "dependency"
    const val DOMAIN_KEY = "domain"
    const val SECURITY_KEY = "security"

    private val KNOWN_LENSES = setOf(METRICS_KEY, DEPENDENCY_KEY, DOMAIN_KEY, SECURITY_KEY)

    /** Serializes the known lenses and re-emits every unknown lens verbatim as a sibling key. */
    private class LensesDtoSerializer : JsonSerializer<LensesDto> {
        override fun serialize(src: LensesDto, typeOfSrc: Type, context: JsonSerializationContext): JsonElement {
            val result = JsonObject()
            result.add(METRICS_KEY, context.serialize(src.metrics))
            result.add(DEPENDENCY_KEY, context.serialize(src.dependency))
            result.add(DOMAIN_KEY, context.serialize(src.domain))
            result.add(SECURITY_KEY, context.serialize(src.security))
            src.additionalLenses.forEach { (lensName, lensValue) -> result.add(lensName, lensValue) }
            return result
        }
    }

    /** Reads the known lenses into typed fields and captures every other key into `additionalLenses`. */
    private class LensesDtoDeserializer : JsonDeserializer<LensesDto> {
        override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): LensesDto {
            val jsonObject = json.asJsonObject
            val metrics =
                jsonObject.get(METRICS_KEY)?.let { context.deserialize<MetricsLensDto>(it, MetricsLensDto::class.java) }
                    ?: MetricsLensDto()
            val dependency =
                jsonObject.get(DEPENDENCY_KEY)?.let { context.deserialize<DependencyLensDto>(it, DependencyLensDto::class.java) }
                    ?: DependencyLensDto()
            val domain = jsonObject.get(DOMAIN_KEY)?.let { context.deserialize<Map<String, Any>>(it, anyMapType) } ?: emptyMap()
            val security = jsonObject.get(SECURITY_KEY)?.let { context.deserialize<Map<String, Any>>(it, anyMapType) } ?: emptyMap()
            val additionalLenses =
                jsonObject
                    .entrySet()
                    .filter { it.key !in KNOWN_LENSES }
                    .associate { it.key to it.value }
            return LensesDto(metrics, dependency, domain, security, additionalLenses)
        }
    }
}
