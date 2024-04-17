package de.maibornwolff.codecharta.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test

class AttributeDescriptorTest {
private val descriptor = AttributeDescriptor("Description", link = "aLink", direction = -1)

    @Test
    fun `should store attribute information`() {
        assertEquals(descriptor.hintHighValue, "")
        assertEquals(descriptor.hintLowValue, "")
        assertEquals(descriptor.link, "aLink")
    }

    @Test
    fun `should calculate equals correctly`() {
        var anotherDescriptor = AttributeDescriptor("No", link = "bLink", direction = -1)
        assertNotEquals(anotherDescriptor, descriptor)
        anotherDescriptor = AttributeDescriptor("Description", link = "aLink", direction = -1)
        assertEquals(descriptor, anotherDescriptor)

        val descriptorCopy = descriptor
        assertEquals(descriptor, descriptorCopy)
    }
}
