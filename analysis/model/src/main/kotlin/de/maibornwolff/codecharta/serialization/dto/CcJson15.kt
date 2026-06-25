package de.maibornwolff.codecharta.serialization.dto

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.BlacklistItem
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.Node

/**
 * The wire DTO for the legacy `.cc.json` 1.5 `{ checksum, data }` envelope. Field order mirrors the
 * pre-2.0 domain `Project` exactly, so the serialized `data` (and therefore its checksum) is
 * byte-identical to what the old GSON-reflected domain produced. Mapping the lens-native domain
 * through this DTO is what lets the domain stop doubling as the wire format without changing 1.5
 * output. The `(data, checksum)` field order matches the historical wrapper so the envelope stays
 * byte-identical too.
 */
class CcJson15Wrapper(val data: CcJson15Project, val checksum: String)

class CcJson15Project(
    val projectName: String,
    val nodes: List<Node>,
    val apiVersion: String,
    val edges: List<Edge>,
    val attributeTypes: Map<String, MutableMap<String, AttributeType>>,
    val attributeDescriptors: Map<String, AttributeDescriptor>,
    val blacklist: List<BlacklistItem>
)
