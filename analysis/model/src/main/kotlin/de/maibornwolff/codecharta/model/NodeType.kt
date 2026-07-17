package de.maibornwolff.codecharta.model

import com.google.gson.JsonParseException

enum class NodeType {
    File,
    Folder,
    Package,
    Class,
    Interface,
    Method,
    Unknown;

    companion object {
        /** Parses a wire `type` string, throwing a descriptive [JsonParseException] for an unknown value. */
        fun parse(type: String): NodeType = try {
            valueOf(type)
        } catch (e: IllegalArgumentException) {
            throw JsonParseException("Type $type not supported.", e)
        }
    }
}
