package de.maibornwolff.codecharta.serialization.dto

import com.google.gson.JsonElement
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType

/**
 * The wire-format DTO for `.cc.json` 2.0: `{ meta, files, lenses }`.
 *
 * This DTO is the only representation that mirrors the on-disk 2.0 shape. The domain model never
 * serializes itself; [de.maibornwolff.codecharta.serialization.ProjectToCcJsonV2Mapper] and
 * [de.maibornwolff.codecharta.serialization.CcJsonV2ToProjectMapper] are the only bridges between
 * this DTO and the domain `Project`.
 *
 * [LensesDto.opaqueLenses] carries the reserved `domain`/`security` slots and any unknown top-level
 * lens verbatim so a newer tool's lens survives a round-trip through an older tool.
 */
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
    val opaqueLenses: Map<String, JsonElement> = emptyMap()
)

class MetricsLensDto(
    val attributes: Map<String, Map<String, Any>> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val clusters: List<JsonElement> = emptyList()
)

class DependencyLensDto(
    val edges: List<EdgeDto> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap()
)

class EdgeDto(val fromId: String, val toId: String, val attributes: Map<String, Any> = emptyMap())
