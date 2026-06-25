package de.maibornwolff.codecharta.serialization

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypeSerializer
import de.maibornwolff.codecharta.model.BlacklistType
import de.maibornwolff.codecharta.model.BlacklistTypeSerializer

/** The single owner of the legacy 1.5 wire GSON (lowercase attribute/blacklist enum values). */
object CcJson15Gson {
    val gson: Gson =
        GsonBuilder()
            .registerTypeAdapter(AttributeType::class.java, AttributeTypeSerializer())
            .registerTypeAdapter(BlacklistType::class.java, BlacklistTypeSerializer())
            .create()
}
