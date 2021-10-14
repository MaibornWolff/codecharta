package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import de.maibornwolff.codecharta.model.ProjectWrapper
import java.lang.reflect.Type

class ProjectWrapperJsonDeserializer : JsonDeserializer<ProjectWrapper> {

        override fun deserialize(json: JsonElement, typeOfT: Type?, context: JsonDeserializationContext): ProjectWrapper {
            val projectJsonDeserializer = ProjectJsonDeserializer()
            val jsonObject = json.asJsonObject
            return if (jsonObject.get("data") != null) {
                val project = projectJsonDeserializer.deserialize(jsonObject.get("data"), typeOfT, context)
                ProjectWrapper(project, jsonObject.get("data").toString())
            } else {
                val project = projectJsonDeserializer.deserialize(json, typeOfT, context)
                ProjectWrapper(project, json.toString())
            }
        }
}
