package de.maibornwolff.codecharta.analysers.importers.sonar.filter

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.analysers.importers.sonar.model.ErrorResponse
import de.maibornwolff.codecharta.util.Logger
import java.io.IOException
import java.io.InputStreamReader
import java.nio.charset.StandardCharsets
import javax.ws.rs.WebApplicationException
import javax.ws.rs.client.ClientRequestContext
import javax.ws.rs.client.ClientResponseContext
import javax.ws.rs.client.ClientResponseFilter
import javax.ws.rs.core.Response
import javax.ws.rs.ext.Provider

@Provider
class ErrorResponseFilter : ClientResponseFilter {
    @Throws(IOException::class)
    override fun filter(requestContext: ClientRequestContext, responseContext: ClientResponseContext) {
        val status = Response.Status.fromStatusCode(responseContext.status)
        if (status != Response.Status.OK && responseContext.hasEntity()) {
            val stream = responseContext.entityStream

            try {
                val gson = GsonBuilder().create()
                val error =
                    gson.fromJson<ErrorResponse>(
                        InputStreamReader(stream, StandardCharsets.UTF_8),
                        ErrorResponse::class.java
                    )

                var message = "Errors: \n"
                for (errorEntity in error.errors) {
                    message += errorEntity.msg + "\n"
                }

                Logger.error { message }

                throw WebApplicationException(message)
            } catch (e: RuntimeException) {
                Logger.error { "Error response could not be parsed." }
            }
        }
    }
}
