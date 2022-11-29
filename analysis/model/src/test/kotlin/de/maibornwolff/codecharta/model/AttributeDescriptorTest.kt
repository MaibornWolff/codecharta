package de.maibornwolff.codecharta.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test

class AttributeDescriptorTest {
    private val descriptor = AttributeDescriptor("Description", link = "aLink")

    @Test
    fun `should store attribute information`() {
        assertEquals(descriptor.hintHighValue, "")
        assertEquals(descriptor.hintLowValue, "")
        assertEquals(descriptor.link, "aLink")
    }

    @Test
    fun `should calculate equals correctly`() {
        var anotherDescriptor = AttributeDescriptor("No", link = "bLink")
        assertNotEquals(anotherDescriptor, descriptor)
        anotherDescriptor = AttributeDescriptor("Description", link = "aLink")
        assertEquals(descriptor, anotherDescriptor)

        val descriptorCopy = descriptor
        assertEquals(descriptor, descriptorCopy)
    }
}
