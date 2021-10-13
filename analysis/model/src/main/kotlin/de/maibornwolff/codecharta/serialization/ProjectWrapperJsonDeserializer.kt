package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import de.maibornwolff.codecharta.model.*
import java.lang.reflect.Type

class ProjectWrapperJsonDeserializer : JsonDeserializer<ProjectWrapper> {

        override fun deserialize(json: JsonElement, typeOfT: Type?, context: JsonDeserializationContext): ProjectWrapper {
            val projectJsonDeserializer = ProjectJsonDeserializer()
            val project = projectJsonDeserializer.deserialize(json, typeOfT, context)
            // ToDo: pass the correct projectJson
            return ProjectWrapper(project, "")
        }
}
