package de.maibornwolff.codecharta.analysers.parsers.unified.metriccollectors

import de.maibornwolff.codecharta.analysers.parsers.unified.metricnodetypes.AvailableFileMetrics
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.treesitter.TSParser
import org.treesitter.TreeSitterScala
import java.io.File

class ScalaCollectorTest {
    private var parser = TSParser()
    private val collector = ScalaCollector()

    @BeforeEach
    fun setUp() {
        parser.setLanguage(TreeSitterScala())
    }

    private fun createTestFile(content: String): File {
        val tempFile = File.createTempFile("testFile", ".scala")
        tempFile.writeText(content)
        tempFile.deleteOnExit()
        return tempFile
    }

    @Test
    fun `should count if expression for complexity`() {
        // Arrange
        val fileContent = """if (x > 0) true else false"""
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count pattern matching cases for complexity`() {
        // Arrange
        val fileContent = """
            def classify(x: Int): String = x match {
              case 1 => "one"
              case 2 => "two"
              case 3 => "three"
              case _ => "other"
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(5.0)
    }

    @Test
    fun `should count case guards in pattern matching for complexity`() {
        // Arrange
        val fileContent = """
            def getPriorityLabel(priority: Int): String = priority match {
              case 0 => "Zero"
              case p if p < 20 => "Low"
              case p if p < 50 => "Medium"
              case p if p < 80 => "High"
              case _ => "Critical"
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(9.0)
    }

    @Test
    fun `should count loops for complexity`() {
        // Arrange
        val fileContent = """
            var counter = n
            while (counter > 0) {
              counter -= 1
            }

            var value = start
            do {
              value -= 1
            } while (value > 0)

            val result = for {
              id <- ids
              if id > 0
            } yield id * 2
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count try-catch for complexity`() {
        // Arrange
        val fileContent = """
            def safeDivide(a: Int, b: Int): Try[Int] = {
              try {
                Success(a / b)
              } catch {
                case e: ArithmeticException => Failure(e)
                case e: Exception => Failure(e)
              }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count lambda expressions for complexity`() {
        // Arrange
        val fileContent = """
            val doubleValue: Int => Int = (x: Int) => x * 2
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count single-line and multi-line comments for comment_lines`() {
        // Arrange
        val fileContent = """
            // Single-line comment
            /* Multi-line comment
               spanning multiple lines */
            /** Scaladoc comment
              * for documentation
              */
            def hello(): Unit = {
              println("Hello") // inline comment
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMMENT_LINES.metricName]).isEqualTo(7.0)
    }

    @Test
    fun `should not include comments or empty lines for rloc`() {
        // Arrange
        val fileContent = """
            // comment


            val x = 5
        """.trimIndent() + "\n"
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.REAL_LINES_OF_CODE.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should count empty lines and comments for loc`() {
        // Arrange
        val fileContent = """
            // comment


            val x = 5
        """.trimIndent() + "\n"
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.LINES_OF_CODE.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should count function definitions for number of functions`() {
        // Arrange
        val fileContent = $$"""
            def add(x: Int, y: Int): Int = x + y

            def multiply(x: Int, y: Int): Int = {
              x * y
            }

            def greet(name: String): Unit = println(s"Hello, $name")
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(3.0)
    }

    @Test
    fun `should count lambda expressions for number of functions`() {
        // Arrange
        val fileContent = """
            val double: Int => Int = (x: Int) => x * 2
            val add = (a: Int, b: Int) => a + b
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should count nested functions for number of functions`() {
        // Arrange
        val fileContent = """
            def outer(x: Int): Int = {
              def inner(y: Int): Int = y * 2
              inner(x) + 10
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(2.0)
    }

    @Test
    fun `should correctly calculate all measures for parameters per function metric`() {
        // Arrange
        val fileContent = """
            def noParams(): Unit = println("Hello")

            def oneParam(x: Int): Int = x * 2

            def twoParams(a: Int, b: Int): Int = a + b

            def threeParams(x: Int, y: Int, z: Int): Int = x + y + z
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(3.0)
        Assertions.assertThat(result.attributes["min_parameters_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_parameters_per_function"]).isEqualTo(1.5)
        Assertions.assertThat(result.attributes["median_parameters_per_function"]).isEqualTo(1.5)
    }

    @Test
    fun `should correctly calculate all measures for complexity per function metric`() {
        // Arrange
        val fileContent = """
            def mediumComplexity(x: Int): String = x match {
              case 1 => "one"
              case 2 => "two"
              case _ => "other"
            }

            def highComplexity(a: Int, b: Int): Int = {
              if (a > 0) {
                a + 1
              } else if (a < 0) {
                a - 1
              } else {
                0
              }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_complexity_per_function"]).isEqualTo(3.0)
        Assertions.assertThat(result.attributes["min_complexity_per_function"]).isEqualTo(0.0)
        Assertions.assertThat(result.attributes["mean_complexity_per_function"]).isEqualTo(2.0)
        Assertions.assertThat(result.attributes["median_complexity_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should correctly calculate rloc per function metric`() {
        // Arrange
        val fileContent = """
            def shortFunction(): Unit = println("short")

            def mediumFunction(x: Int): Int = {
              val doubled = x * 2
              doubled + 1
            }

            def longFunction(a: Int, b: Int): Int = {
              // comment
              val sum = a + b
              val product = a * b
              // another comment

              val result = if (sum > product) sum else product
              return result
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes["max_rloc_per_function"]).isEqualTo(4.0)
        Assertions.assertThat(result.attributes["min_rloc_per_function"]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes["mean_rloc_per_function"]).isEqualTo(2.33)
        Assertions.assertThat(result.attributes["median_rloc_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should detect message chains with 4 or more method calls`() {
        // Arrange
        val fileContent = """
            val result = obj.method1().field.method2().method3().method4()
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.MESSAGE_CHAINS.metricName]).isEqualTo(1.0)
    }

    @Test
    fun `should handle implicit parameters correctly`() {
        // Arrange
        val fileContent = """
            def addTask(task: Task)(implicit logger: String => Unit): Boolean = {
              logger("Task added")
              true
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes["max_parameters_per_function"]).isEqualTo(2.0)
    }

    @Test
    fun `should count val-based function definitions correctly`() {
        // Arrange
        val fileContent = $$"""
            val add = (a: Int, b: Int) => a + b

            val greet = (name: String) => s"Hello, $name"

            val divide: PartialFunction[(Int, Int), Int] = {
              case (a, b) if b != 0 => a / b
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(3.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(4.0)
    }

    @Test
    fun `should handle case classes and traits`() {
        // Arrange
        val fileContent = $$"""
            case class Task(id: Int, name: String, priority: Int)

            trait TaskProcessor {
              def process(task: Task): Unit = {
                if (task.priority > 50) {
                  println(s"High priority: ${task.name}")
                }
              }
            }
        """.trimIndent()
        val input = createTestFile(fileContent)

        // Act
        val result = collector.collectMetricsForFile(input)

        // Assert
        Assertions.assertThat(result.attributes[AvailableFileMetrics.NUMBER_OF_FUNCTIONS.metricName]).isEqualTo(1.0)
        Assertions.assertThat(result.attributes[AvailableFileMetrics.COMPLEXITY.metricName]).isEqualTo(2.0)
    }
}
