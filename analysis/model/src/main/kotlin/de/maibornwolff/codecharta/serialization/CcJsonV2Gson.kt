package de.maibornwolff.codecharta.serialization

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import com.google.gson.ToNumberPolicy
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypeDeserializer
import de.maibornwolff.codecharta.model.AttributeTypeSerializer
import de.maibornwolff.codecharta.model.DomainLens
import de.maibornwolff.codecharta.serialization.dto.DependencyLensDto
import de.maibornwolff.codecharta.serialization.dto.LensesDto
import de.maibornwolff.codecharta.serialization.dto.MetricsLensDto
import java.lang.reflect.Type

object CcJsonV2Gson {
    val gson: Gson =
        GsonBuilder()
            // Keep integer attributes as Long so a read→write round-trip doesn't coerce `1` to `1.0`.
            .setObjectToNumberStrategy(ToNumberPolicy.LONG_OR_DOUBLE)
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeSerializer())
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeDeserializer())
            .registerTypeAdapter(LensesDto::class.java, LensesDtoSerializer())
            .registerTypeAdapter(LensesDto::class.java, LensesDtoDeserializer())
            .create()

    const val METRICS_KEY = "metrics"
    const val DEPENDENCY_KEY = "dependency"
    const val DOMAIN_KEY = "domain"

    private const val NODES_KEY = "nodes"

    private val TYPED_LENS_KEYS = setOf(METRICS_KEY, DEPENDENCY_KEY, DOMAIN_KEY)

    private class LensesDtoSerializer : JsonSerializer<LensesDto> {
        override fun serialize(src: LensesDto, typeOfSrc: Type, context: JsonSerializationContext): JsonElement {
            val result = JsonObject()
            result.add(METRICS_KEY, context.serialize(src.metrics))
            result.add(DEPENDENCY_KEY, context.serialize(src.dependency))
            src.domain?.let { result.add(DOMAIN_KEY, serializeDomain(it, context)) }
            src.opaqueLenses.forEach { (lensName, lensValue) -> result.add(lensName, lensValue) }
            return result
        }

        // A lens without nodes stays the reserved `{}` slot rather than growing an empty `nodes` object,
        // so a file that reserved the key round-trips unchanged.
        private fun serializeDomain(domain: DomainLens, context: JsonSerializationContext): JsonElement {
            val result = JsonObject()
            if (domain.carriesData) result.add(NODES_KEY, context.serialize(domain.nodes))
            return result
        }
    }

    private class LensesDtoDeserializer : JsonDeserializer<LensesDto> {
        override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): LensesDto {
            val jsonObject = json.asJsonObject
            val metrics =
                jsonObject.get(METRICS_KEY)?.let { context.deserialize<MetricsLensDto>(it, MetricsLensDto::class.java) }
                    ?: MetricsLensDto()
            val dependency =
                jsonObject.get(DEPENDENCY_KEY)?.let { context.deserialize<DependencyLensDto>(it, DependencyLensDto::class.java) }
                    ?: DependencyLensDto()
            val domain = jsonObject.get(DOMAIN_KEY)?.let { context.deserialize<DomainLens>(it, DomainLens::class.java) }
            val opaqueLenses =
                jsonObject
                    .entrySet()
                    .filter { it.key !in TYPED_LENS_KEYS }
                    .associate { it.key to it.value }
            return LensesDto(metrics, dependency, domain, opaqueLenses)
        }
    }
}
