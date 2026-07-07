package de.maibornwolff.codecharta.analysers.tools.validation

/**
 * Thrown by [EveritValidator] when a schema-valid 2.0 cc.json contains references — metrics-lens keys
 * or edge endpoints — that do not resolve to any file-tree node id. JSON Schema cannot express this
 * cross-reference, so `ccsh check` enforces it in code and fails loudly instead of letting the reader
 * silently drop the dangling entries (see [de.maibornwolff.codecharta.serialization.CcJsonV2ToProjectMapper],
 * which only warns).
 */
class ReferentialIntegrityException(message: String) : RuntimeException(message)
