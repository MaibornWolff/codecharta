package de.maibornwolff.codecharta.serialization.dto

import com.google.gson.JsonElement
import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType

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
    val attributeTypes: Map<String, AttributeType> = emptyMap()
)

class DependencyLensDto(
    val edges: List<EdgeDto> = emptyList(),
    val attributeTypes: Map<String, AttributeType> = emptyMap(),
    val attributeDescriptors: Map<String, AttributeDescriptor> = emptyMap()
)

class EdgeDto(val fromId: String, val toId: String, val attributes: Map<String, Any> = emptyMap())
