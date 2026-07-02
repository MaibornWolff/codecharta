package de.maibornwolff.codecharta.model

import com.google.gson.JsonParseException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class NodeTypeTest {
    @Test
    fun `should parse a known type`() {
        // Arrange + Act
        val parsed = NodeType.parse("Folder")

        // Assert
        assertEquals(NodeType.Folder, parsed)
    }

    @Test
    fun `should throw a descriptive JsonParseException for an unknown type`() {
        // Arrange + Act
        val thrown = assertThrows<JsonParseException> { NodeType.parse("Bogus") }

        // Assert
        assertEquals("Type Bogus not supported.", thrown.message)
    }
}
