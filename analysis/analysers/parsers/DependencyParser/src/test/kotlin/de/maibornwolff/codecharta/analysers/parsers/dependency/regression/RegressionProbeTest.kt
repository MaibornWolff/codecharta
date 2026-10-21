package de.maibornwolff.codecharta.analysers.parsers.dependency.regression

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class RegressionProbeTest {
    @Test
    fun `should keep the comments of an expectation when rewriting it`(
        @TempDir probeDirectory: File
    ) {
        // Arrange
        File(probeDirectory, "src/a").mkdirs()
        File(probeDirectory, "src/a/App.java").writeText("package a;\n\npublic class App { private Config config; }\n")
        File(probeDirectory, "src/a/Config.java").writeText("package a;\n\npublic class Config {}\n")
        File(probeDirectory, "expected.txt").writeText("# App holds a Config\nfile a/App.java -> a/Other.java\n")

        // Act
        RegressionProbe(probeDirectory).writeExpectedLines()

        // Assert
        assertThat(File(probeDirectory, "expected.txt").readLines()).containsExactly(
            "# App holds a Config",
            "file a/App.java -> a/Config.java",
            "leaf a/App.java#App -> a/Config.java#Config"
        )
    }
}
