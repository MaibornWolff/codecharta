package de.maibornwolff.codecharta.serialization

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.ToNumberPolicy
import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonWriter
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypeDeserializer
import de.maibornwolff.codecharta.model.AttributeTypeSerializer
import de.maibornwolff.codecharta.model.DomainLens
import de.maibornwolff.codecharta.model.SecurityLens
import de.maibornwolff.codecharta.serialization.dto.ClustersLensDto
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
            // The deserializer, registered last, takes precedence and leaves writing to the writer before it
            .registerTypeAdapter(LensesDto::class.java, LensesDtoWriter { gson })
            .registerTypeAdapter(LensesDto::class.java, LensesDtoDeserializer())
            .create()

    const val METRICS_KEY = "metrics"
    const val DEPENDENCY_KEY = "dependency"
    const val DOMAIN_KEY = "domain"
    const val CLUSTERS_KEY = "clusters"
    const val SECURITY_KEY = "security"

    private const val NODES_KEY = "nodes"

    private val TYPED_LENS_KEYS = setOf(METRICS_KEY, DEPENDENCY_KEY, DOMAIN_KEY, CLUSTERS_KEY, SECURITY_KEY)

    // Streams the lenses straight to the output: building them as a JSON tree first held a second copy of a large domain
    // lens in memory and took as long again
    private class LensesDtoWriter(private val gson: () -> Gson) : TypeAdapter<LensesDto>() {
        override fun write(out: JsonWriter, src: LensesDto) {
            out.beginObject()
            writeMember(out, METRICS_KEY, src.metrics)
            writeMember(out, DEPENDENCY_KEY, src.dependency)
            src.domain?.let { writeDomain(out, it) }
            src.clusters?.let { writeMember(out, CLUSTERS_KEY, it) }
            src.security?.let { writeMember(out, SECURITY_KEY, it) }
            src.opaqueLenses.forEach { (lensName, lensValue) -> writeMember(out, lensName, lensValue) }
            out.endObject()
        }

        // A lens without nodes stays the reserved `{}` slot rather than growing an empty `nodes` object,
        // so a file that reserved the key round-trips unchanged.
        private fun writeDomain(out: JsonWriter, domain: DomainLens) {
            out.name(DOMAIN_KEY).beginObject()
            if (domain.carriesData) writeMember(out, NODES_KEY, domain.nodes)
            out.endObject()
        }

        private fun writeMember(out: JsonWriter, name: String, value: Any) {
            out.name(name)
            gson().toJson(value, value.javaClass, out)
        }

        override fun read(reader: JsonReader): LensesDto = throw UnsupportedOperationException("LensesDtoDeserializer reads the lenses")
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
            val clusters = jsonObject.get(CLUSTERS_KEY)?.let { context.deserialize<ClustersLensDto>(it, ClustersLensDto::class.java) }
            val security = jsonObject.get(SECURITY_KEY)?.let { context.deserialize<SecurityLens>(it, SecurityLens::class.java) }
            val opaqueLenses =
                jsonObject
                    .entrySet()
                    .filter { it.key !in TYPED_LENS_KEYS }
                    .associate { it.key to it.value }
            return LensesDto(metrics, dependency, domain, clusters, security, opaqueLenses)
        }
    }
}
