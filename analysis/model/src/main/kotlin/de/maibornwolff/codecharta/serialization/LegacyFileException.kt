package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonParseException

/**
 * Signals that a file is a legacy cc.json 1.x document rejected because legacy reading was not
 * enabled (only `ccsh convert` sets `allowLegacy`). Distinct from a genuinely corrupt/unparseable
 * file so callers can react differently — e.g. `ccsh merge` must fail with the convert hint instead
 * of silently skipping the file. Subclasses [JsonParseException] so every existing
 * `catch (JsonParseException)` / `catch (Exception)` site keeps behaving as before.
 */
class LegacyFileException(message: String) : JsonParseException(message) {
    companion object {
        /** The shared user-facing message pointing a legacy-1.x file at `ccsh convert`. */
        const val CONVERT_HINT =
            "This is a legacy cc.json 1.x file. Run `ccsh convert <file>` to upgrade it to the 2.0 format first."
    }
}
