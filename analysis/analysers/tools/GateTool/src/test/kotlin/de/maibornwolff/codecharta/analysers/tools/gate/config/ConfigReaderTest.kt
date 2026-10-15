package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class ConfigReaderTest {
    private val catalog =
        FakeAnalyserCatalog(
            mapOf(
                "rawtextparser" to listOf("tab-width", "exclude"),
                "unifiedparser" to listOf("exclude", "include-build-folders", "file-extensions")
            )
        )
    private val reader = ConfigReader(catalog)

    @Test
    fun `should read an empty file as the default config`() {
        // Arrange
        val text = ""

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config).isEqualTo(GateConfig())
    }

    @Test
    fun `should read a fully commented file as the default config`() {
        // Arrange
        val text =
            """
            # metrics:
            #   rloc:
            #     error:
            #       max:
            """.trimIndent()

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config).isEqualTo(GateConfig())
    }

    @Test
    fun `should read every section of a complete config`() {
        // Arrange
        val text =
            """
            output: build/check
            analysers:
              rawtextparser: off
              unifiedparser: on
            exitCodes:
              error: 3
              warning: 1
            metrics:
              rloc:
                warning:
                  max: 200
                  instruction: Watch the size.
                error:
                  max: 400
            cycles:
              betweenFiles:
                severity: error
                instruction: Break the cycle.
                ignore:
                  - src/a.kt
              upward:
                severity: warning
                ignore:
                  - src/legacy
            overrides:
              - paths:
                  - src/legacy/**
                metrics:
                  rloc:
                    error:
                      max: 2000
              - paths:
                  - "**/generated/**"
                metrics:
                  rloc: off
            """.trimIndent()

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config).isEqualTo(
            GateConfig(
                output = "build/check",
                analysers = mapOf("rawtextparser" to AnalyserSetting(false), "unifiedparser" to AnalyserSetting(true)),
                exitCodes = mapOf(Severity.ERROR to 3, Severity.WARNING to 1),
                metrics =
                    mapOf(
                        "rloc" to
                            MetricRule(
                                mapOf(Severity.WARNING to LevelRule(200.0, "Watch the size."), Severity.ERROR to LevelRule(400.0))
                            )
                    ),
                cycles =
                    CycleRules(
                        betweenFiles = CycleRule(Severity.ERROR, "Break the cycle.", ignore = listOf("src/a.kt")),
                        upward = CycleRule(Severity.WARNING, ignore = listOf("src/legacy"))
                    ),
                overrides =
                    listOf(
                        PathOverride(
                            listOf("src/legacy/**"),
                            mapOf("rloc" to MetricOverride.Levels(mapOf(Severity.ERROR to LevelOverride(max = 2000.0))))
                        ),
                        PathOverride(listOf("**/generated/**"), mapOf("rloc" to MetricOverride.Off))
                    )
            )
        )
    }

    @Test
    fun `should report broken yaml syntax with its line`() {
        // Arrange
        val text = "metrics:\n  rloc: [unclosed\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).hasSize(1)
        assertThat(result.problems.first().line).isEqualTo(3)
    }

    @Test
    fun `should report an unknown top level key with its line`() {
        // Arrange
        val text = "output: out\nmetrix:\n  rloc: {}\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(
            result.problems
        ).containsExactly(
            ConfigProblem(
                2,
                "unknown key 'metrix', expected one of: input, output, parallel, analysers, exitCodes, metrics, cycles, overrides"
            )
        )
    }

    @Test
    fun `should report a metric level without a limit`() {
        // Arrange
        val text = "metrics:\n  rloc:\n    error:\n      max:\n      instruction: Split it.\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(ConfigProblem(4, "metrics.rloc.error.max needs a number"))
    }

    @Test
    fun `should report a limit that is not a number`() {
        // Arrange
        val text = "metrics:\n  rloc:\n    error:\n      max: many\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(ConfigProblem(4, "metrics.rloc.error.max must be a number, found 'many'"))
    }

    @Test
    fun `should report a warning limit above the error limit`() {
        // Arrange
        val text = "metrics:\n  rloc:\n    warning:\n      max: 500\n    error:\n      max: 400\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(
            result.problems
        ).containsExactly(ConfigProblem(4, "metrics.rloc.warning.max (500) must not be above metrics.rloc.error.max (400)"))
    }

    @Test
    fun `should report an unknown severity in a metric`() {
        // Arrange
        val text = "metrics:\n  rloc:\n    critical:\n      max: 10\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(
            result.problems
        ).containsExactly(ConfigProblem(3, "unknown key 'critical' in metrics.rloc, expected one of: warning, error"))
    }

    @Test
    fun `should report an exit code that collides with the tool failure code`() {
        // Arrange
        val text = "exitCodes:\n  error: 2\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(
            result.problems
        ).containsExactly(ConfigProblem(2, "exitCodes.error must not be 2, that code is reserved for tool failures"))
    }

    @Test
    fun `should report an exit code outside the range a process can return`() {
        // Arrange
        val text = "exitCodes:\n  warning: 300\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(ConfigProblem(2, "exitCodes.warning must be a whole number from 0 to 255, found '300'"))
    }

    @Test
    fun `should report an unknown analyser and a switch that is neither on nor off`() {
        // Arrange
        val text = "analysers:\n  gitlogparser: on\n  unifiedparser: maybe\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(
            ConfigProblem(2, "unknown key 'gitlogparser' in analysers, expected one of: rawtextparser, unifiedparser"),
            ConfigProblem(3, "analysers.unifiedparser must be on or off, found 'maybe'")
        )
    }

    @Test
    fun `should report a cycle rule with an unknown severity`() {
        // Arrange
        val text = "cycles:\n  betweenFiles:\n    severity: fatal\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(
            result.problems
        ).containsExactly(ConfigProblem(3, "cycles.betweenFiles.severity must be one of: warning, error, found 'fatal'"))
    }

    @Test
    fun `should report an ignore pattern that is not valid`() {
        // Arrange
        val text = "cycles:\n  betweenFiles:\n    severity: error\n    ignore:\n      - \"src/[a\"\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(
            result.problems
        ).containsExactly(ConfigProblem(5, "cycles.betweenFiles.ignore[0] is not a valid path pattern: 'src/[a' (Missing '] near index 5)"))
    }

    @Test
    fun `should report an override without paths`() {
        // Arrange
        val text = "overrides:\n  - metrics:\n      rloc: off\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(ConfigProblem(2, "overrides[0].paths needs at least one path pattern"))
    }

    @Test
    fun `should read an override level that only replaces the instruction`() {
        // Arrange
        val text = "overrides:\n  - paths:\n      - src/**\n    metrics:\n      rloc:\n        error:\n          instruction: Shrink it.\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config.overrides.single().metrics).isEqualTo(
            mapOf("rloc" to MetricOverride.Levels(mapOf(Severity.ERROR to LevelOverride(instruction = "Shrink it."))))
        )
    }

    @Test
    fun `should report a key given twice`() {
        // Arrange
        val text = "output: a\noutput: b\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(ConfigProblem(2, "key 'output' is given twice"))
    }

    @Test
    fun `should report a section that is not a mapping`() {
        // Arrange
        val text = "metrics: rloc\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(ConfigProblem(1, "metrics must be a mapping"))
    }

    @Test
    fun `should collect every problem of a file instead of stopping at the first`() {
        // Arrange
        val text = "output: out\nmetrix: 1\nexitCodes:\n  error: 2\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems.map { it.line }).containsExactly(2, 4)
    }

    @Test
    fun `should read the input folder relative to the folder of the config`(
        @TempDir configFolder: File
    ) {
        // Arrange
        File(configFolder, "src").mkdirs()

        // Act
        val result = ConfigReader(FakeAnalyserCatalog(emptyMap()), configFolder).read("input: src\n")

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config.input).isEqualTo("src")
    }

    @Test
    fun `should report an input folder that does not exist`(
        @TempDir configFolder: File
    ) {
        // Arrange
        val text = "input: missing\n"

        // Act
        val result = ConfigReader(FakeAnalyserCatalog(emptyMap()), configFolder).read(text)

        // Assert
        assertThat(result.problems).containsExactly(ConfigProblem(1, "input folder 'missing' does not exist"))
    }

    @Test
    fun `should turn the options of an analyser into its command line arguments`() {
        // Arrange
        val text =
            """
            analysers:
              unifiedparser:
                exclude:
                  - generated/
                  - build/
                include-build-folders: true
                file-extensions: kt
              rawtextparser:
                exclude: []
            """.trimIndent()

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config.analysers).isEqualTo(
            mapOf(
                "unifiedparser" to
                    AnalyserSetting(
                        true,
                        listOf("--exclude=generated/", "--exclude=build/", "--include-build-folders", "--file-extensions=kt")
                    ),
                "rawtextparser" to AnalyserSetting(true)
            )
        )
    }

    @Test
    fun `should leave out a flag that is switched off`() {
        // Arrange
        val text = "analysers:\n  unifiedparser:\n    include-build-folders: false\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.config.argumentsFor("unifiedparser")).isEmpty()
        assertThat(result.config.isAnalyserEnabled("unifiedparser")).isTrue()
    }

    @Test
    fun `should report an option the analyser does not have`() {
        // Arrange
        val text = "analysers:\n  unifiedparser:\n    excludes: generated/\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(
            ConfigProblem(3, "unifiedparser has no option 'excludes', expected one of: exclude, include-build-folders, file-extensions")
        )
    }

    @Test
    fun `should report an option value the analyser refuses`() {
        // Arrange
        val text = "analysers:\n  rawtextparser:\n    tab-width: lots\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(
            result.problems
        ).containsExactly(ConfigProblem(3, "analysers.rawtextparser.tab-width: Invalid value: 'lots' is not an int"))
    }

    @Test
    fun `should read whether the analysers run in parallel`() {
        // Arrange
        val text = "parallel: on\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).isEmpty()
        assertThat(result.config.parallel).isTrue()
        assertThat(reader.read("").config.parallel).isFalse()
    }

    @Test
    fun `should report a parallel switch that is neither on nor off`() {
        // Arrange
        val text = "parallel: sometimes\n"

        // Act
        val result = reader.read(text)

        // Assert
        assertThat(result.problems).containsExactly(ConfigProblem(1, "parallel must be on or off, found 'sometimes'"))
    }
}
