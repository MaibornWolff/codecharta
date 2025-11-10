package de.maibornwolff.codecharta.analysers.importers.sonar.dataaccess

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import jakarta.ws.rs.Consumes
import jakarta.ws.rs.WebApplicationException
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.MultivaluedMap
import jakarta.ws.rs.core.UriInfo
import jakarta.ws.rs.ext.MessageBodyReader
import jakarta.ws.rs.ext.Provider
import java.io.IOException
import java.io.InputStream
import java.io.InputStreamReader
import java.lang.reflect.Type

@Provider
@Consumes(MediaType.APPLICATION_JSON)
class GsonProvider<T> : MessageBodyReader<T> {
    private val gson: Gson

    val uri: UriInfo? = null

    init {
        val builder = GsonBuilder().serializeNulls().enableComplexMapKeySerialization()

        this.gson = builder.create()
    }

    override fun isReadable(type: Class<*>, genericType: Type, annotations: Array<Annotation>, mediaType: MediaType): Boolean {
        return true
    }

    @Throws(IOException::class, WebApplicationException::class)
    override fun readFrom(
        type: Class<T>,
        genericType: Type,
        annotations: Array<Annotation>,
        mediaType: MediaType,
        httpHeaders: MultivaluedMap<String, String>,
        entityStream: InputStream
    ): T {
        InputStreamReader(entityStream, "UTF-8").use { reader -> return gson.fromJson<T>(reader, type) }
    }
}
