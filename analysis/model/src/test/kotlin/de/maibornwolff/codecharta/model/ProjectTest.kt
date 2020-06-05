package de.maibornwolff.codecharta.model

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class ProjectTest : Spek({
    describe("Project API version") {
        it("should be compatible with same API Version") {
            assertThat(Project.isAPIVersionCompatible(Project.API_VERSION), `is`(true))
        }

        it("should be compatible with same major Version") {
            assertThat(Project.isAPIVersionCompatible("1.2"), `is`(true))
        }

        it("should not be compatible with different major version") {
            assertThat(Project.isAPIVersionCompatible("2.0"), `is`(false))
        }
    }
})