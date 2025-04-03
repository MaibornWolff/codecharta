package de.maibornwolff.codecharta.parser.gitlogparser.input.metrics

import de.maibornwolff.codecharta.parser.gitlogparser.input.Modification
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class NumberOfRenamesTest {
    @Test
    fun `initial value should be zero`() {
        val metric = NumberOfRenames()

        Assertions.assertThat(metric.value()).isEqualTo(0)
    }

    @Test
    fun `metric should not be incremented if not a rename`() {
        val modification = Modification("foo", Modification.Type.ADD)

        val metric = NumberOfRenames()
        metric.registerModification(modification)

        Assertions.assertThat(metric.value()).isEqualTo(0)
    }

    @Test
    fun `metric should be incremented on rename`() {
        val modification = Modification("foo", Modification.Type.RENAME)

        val metric = NumberOfRenames()
        metric.registerModification(modification)
        metric.registerModification(modification)

        Assertions.assertThat(metric.value()).isEqualTo(2)
    }
}
