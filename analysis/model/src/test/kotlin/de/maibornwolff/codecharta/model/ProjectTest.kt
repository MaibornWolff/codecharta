package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ProjectTest {
@Test
    fun `should be compatible with same API Version`() {
        assertThat(Project.isAPIVersionCompatible(Project.API_VERSION)).isTrue
    }

    @Test
    fun `should be compatible with same major Version`() {
        assertThat(Project.isAPIVersionCompatible("1.2")).isTrue
    }

    @Test
    fun `should not be compatible with different major version`() {
        assertThat(Project.isAPIVersionCompatible("2.0")).isFalse
    }
}
