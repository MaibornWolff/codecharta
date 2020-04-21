package de.maibornwolff.codecharta.model

import com.natpryce.hamkrest.assertion.assertThat
import com.natpryce.hamkrest.equalTo
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class AttributeTypesTest : Spek({
    describe("Attribute Types") {
        it("should instantiate with correct type") {
            val result = AttributeTypes(type = "nodes")

            assertThat(result.type, equalTo("nodes"))
        }

        it("should instantiate correctly with attribute types") {
            val attributeMap = mutableMapOf("foo" to AttributeType.relative, "bar" to AttributeType.absolute)

            val result = AttributeTypes(attributeMap, type = "nodes")

            assertThat(result.attributeTypes, equalTo(attributeMap))
        }

        it("should be able to add attribute types") {
            val attributeTypes = AttributeTypes(mutableMapOf("foo" to AttributeType.relative), type = "nodes")
            val expected = mutableMapOf("foo" to AttributeType.relative, "bar" to AttributeType.absolute)

            attributeTypes.add("bar", AttributeType.absolute)

            assertThat(attributeTypes.attributeTypes, equalTo(expected))
        }
    }
})