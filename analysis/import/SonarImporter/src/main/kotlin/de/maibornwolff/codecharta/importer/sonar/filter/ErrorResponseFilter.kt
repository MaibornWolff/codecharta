package de.maibornwolff.codecharta.importer.sonar.filter

import com.google.gson.GsonBuilder
import de.maibornwolff.codecharta.importer.sonar.model.ErrorResponse
import mu.KotlinLogging
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
class ErrorResponseFilter: ClientResponseFilter {

    private val logger = KotlinLogging.logger {}

    @Throws(IOException::class)
    override fun filter(requestContext: ClientRequestContext, responseContext: ClientResponseContext) {
        val status = Response.Status.fromStatusCode(responseContext.status)
        if (status != Response.Status.OK && responseContext.hasEntity()) {
            val stream = responseContext.entityStream

            try {
                val gson = GsonBuilder().create()
                val error = gson.fromJson<ErrorResponse>(InputStreamReader(stream, StandardCharsets.UTF_8),
                        ErrorResponse::class.java)

                var message = "Errors: \n"
                for (errorEntity in error.errors) {
                    message += errorEntity.msg + "\n"
                }

                logger.error { message }

                throw WebApplicationException(message)
            } catch (e: RuntimeException) {
                logger.error { "Error response could not be parsed." }
            }
        }
    }
}