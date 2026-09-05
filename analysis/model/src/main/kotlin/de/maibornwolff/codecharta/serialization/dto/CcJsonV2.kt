package de.maibornwolff.codecharta.serialization.dto

import com.google.gson.JsonElement
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.DependencyLeaf
import de.maibornwolff.codecharta.model.DependencyNamespace
import de.maibornwolff.codecharta.model.DependencyNode
import de.maibornwolff.codecharta.model.DomainLens

class CcJsonV2(val meta: MetaDto, val files: List<FileDto>, val lenses: LensesDto)

class MetaDto(val projectName: String, val apiVersion: String, val checksum: String, val commitHash: String? = null)

class FileDto(
    val id: String,
    val name: String,
    val type: String,
    val children: List<FileDto>? = null,
    val contentHash: String? = null,
    val link: String? = null
)

class LensesDto(
    val metrics: MetricsLensDto = MetricsLensDto(),
    val dependency: DependencyLensDto = DependencyLensDto(),
    // The domain lens is keyed by node id on the wire exactly as it is in the model, so it needs no
    // DTO of its own; CcJsonV2Gson keeps an empty one as the reserved `{}` slot.
    val domain: DomainLens? = null,
    val opaqueLenses: Map<String, JsonElement> = emptyMap()
)

class MetricsLensDto(
    val attributes: Map<String, Map<String, Any>> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    val attributeTypes: Map<String, AttributeType> = emptyMap()
)

class DependencyLensDto(
    val edges: List<EdgeDto> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    // Keyed by node id on the wire exactly as in the model, so it needs no DTO of its own. Null rather
    // than empty so a lens without per-node data stays byte-identical to what earlier writers emitted.
    val nodes: Map<String, DependencyNode>? = null,
    // The logical projection, keyed by dotted logical path. Null on the same terms as `nodes`, so a file
    // that carries only the physical projection is byte-identical to what earlier writers emitted.
    val namespaces: Map<String, DependencyNamespace>? = null,
    val leaves: Map<String, DependencyLeaf>? = null,
    val leafEdges: List<LeafEdgeDto>? = null
)

// The graph flags are nullable rather than defaulted to false so GSON omits them unless they are set:
// an edge that is neither cyclic nor upward-pointing serializes exactly as it did before the flags existed.
class EdgeDto(
    val fromId: String,
    val toId: String,
    val attributes: Map<String, Any> = emptyMap(),
    val isCyclic: Boolean? = null,
    val isPointingUpwards: Boolean? = null
)

// Nullable on the same terms as EdgeDto's flags: a leaf edge that is neither cyclic nor upward-pointing
// and whose usage the producer did not record serializes as its endpoints and weight alone.
class LeafEdgeDto(
    val fromLeaf: String,
    val toLeaf: String,
    val attributes: Map<String, Any> = emptyMap(),
    val usage: List<String>? = null,
    val isCyclic: Boolean? = null,
    val isPointingUpwards: Boolean? = null
)
