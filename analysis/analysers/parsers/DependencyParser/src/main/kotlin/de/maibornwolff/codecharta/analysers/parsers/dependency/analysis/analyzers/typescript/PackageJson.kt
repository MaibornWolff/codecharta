package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import com.google.gson.Gson
import com.google.gson.JsonParser
import com.google.gson.Strictness
import com.google.gson.stream.JsonReader
import java.io.File
import java.io.StringReader

/** What a `package.json` says about the module its folder is: its name and the file its entry fields name. */
internal class PackageJson(
    val name: String? = null,
    private val types: String? = null,
    private val typings: String? = null,
    private val main: String? = null
) {
    /** The entry of the package, as the compiler reads it: `types`, then `typings`, then `main`. */
    fun entry(): String? = types ?: typings ?: main

    companion object {
        private val gson = Gson()

        fun read(file: File): PackageJson? {
            if (!file.isFile) return null
            return runCatching {
                val reader = JsonReader(StringReader(file.readText()))
                reader.strictness = Strictness.LENIENT
                gson.fromJson(JsonParser.parseReader(reader), PackageJson::class.java)
            }.getOrNull()
        }
    }
}
