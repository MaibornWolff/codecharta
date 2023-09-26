package de.maibornwolff.codecharta.importer.sonar.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test

class ErrorResponseTest {
    private val erFull = ErrorResponse(arrayOf(ErrorEntity("stuff"), ErrorEntity("stuff2")))
    private val erFullMod = ErrorResponse(arrayOf(ErrorEntity("stuff"), ErrorEntity("stuff2"), ErrorEntity("more stuff")))
    private val erFull2 = ErrorResponse(arrayOf(ErrorEntity("stuff"), ErrorEntity("stuff2")))

    @Test
    fun `should identify equals correctly`() {
        val er = ErrorResponse(arrayOf())
        val er2 = ErrorResponse(arrayOf())
        val erImage = er
        val er3: ErrorResponse? = null

        assertEquals(er, er2)
        assertEquals(er, erImage)
        assertNotEquals(er, er3)
        assertNotEquals(er, null)
        assertEquals(erFull, erFull2)
        assertNotEquals(erFull, erFullMod)
        assertEquals(erFull.hashCode(), erFull2.hashCode())
    }

    @Test
    fun `should have correct toString output`() {
        assertThat(erFull.toString()).contains("stuff", "stuff2")
    }
}
