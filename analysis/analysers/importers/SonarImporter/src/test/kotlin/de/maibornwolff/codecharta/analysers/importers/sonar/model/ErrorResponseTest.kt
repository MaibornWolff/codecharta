package de.maibornwolff.codecharta.analysers.importers.sonar.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test

class ErrorResponseTest {
    private val errorResponseFull = ErrorResponse(arrayOf(ErrorEntity("stuff"), ErrorEntity("stuff2")))
    private val errorResponseFullModified =
        ErrorResponse(arrayOf(ErrorEntity("stuff"), ErrorEntity("stuff2"), ErrorEntity("more stuff")))
    private val errorResponseFull2 = ErrorResponse(arrayOf(ErrorEntity("stuff"), ErrorEntity("stuff2")))

    @Test
    fun `should identify equals correctly`() {
        val errorResponse = ErrorResponse(arrayOf())
        val errorResponse2 = ErrorResponse(arrayOf())
        val errorResponseImage = errorResponse
        val errorResponse3: ErrorResponse? = null

        assertEquals(errorResponse, errorResponse2)
        assertEquals(errorResponse, errorResponseImage)
        assertNotEquals(errorResponse, errorResponse3)
        assertNotEquals(errorResponse, null)
        assertEquals(errorResponseFull, errorResponseFull2)
        assertNotEquals(errorResponseFull, errorResponseFullModified)
        assertEquals(errorResponseFull.hashCode(), errorResponseFull2.hashCode())
    }

    @Test
    fun `should have correct toString output`() {
        assertThat(errorResponseFull.toString()).contains("stuff", "stuff2")
    }
}
