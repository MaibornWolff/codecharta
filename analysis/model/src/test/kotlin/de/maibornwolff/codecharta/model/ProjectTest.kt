package de.maibornwolff.codecharta.model

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ProjectTest {
    @Test
    fun `should be compatible with same API Version`() {
        assertThat(Project.isAPIVersionCompatible(Project.API_VERSION)).isTrue
    }

    @Test
    fun `should not be compatible with a legacy 1_x version`() {
        assertThat(Project.isAPIVersionCompatible("1.2")).isFalse
    }

    @Test
    fun `should be compatible with the 2_0 lens format`() {
        assertThat(Project.isAPIVersionCompatible("2.0")).isTrue
    }

    @Test
    fun `should not be compatible with an unsupported major version`() {
        assertThat(Project.isAPIVersionCompatible("3.0")).isFalse
    }
}
