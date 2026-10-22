package de.maibornwolff.treesitter.excavationsite.languages.go

import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class GoDependencyTest {
    private fun analyze(code: String) = TreeSitterDependencies.analyze(code, Language.GO)

    private fun usedTypeNamesOf(code: String, declarationName: String): List<String> =
        analyze(code).declarations.first { it.name == declarationName }.usedTypes.map { it.name }

    private fun qualifiedNamesOf(code: String, declarationName: String): List<Pair<String, List<String>>> =
        analyze(code).declarations.first { it.name == declarationName }.usedTypes.map { it.name to it.namespacePrefix }

    @Nested
    inner class ApiSupportCheck {
        @Test
        fun `should report Go as dependency-supported`() {
            // Arrange & Act
            val supported = TreeSitterDependencies.isDependencyAnalysisSupported(Language.GO)

            // Assert
            assertThat(supported).isTrue()
        }
    }

    @Nested
    inner class PackageExtraction {
        @Test
        fun `should extract the name of the package clause`() {
            // Arrange
            val code = "package handlers\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.packagePath).containsExactly("handlers")
        }

        @Test
        fun `should return no package name when the package clause is missing`() {
            // Arrange
            val code = "func main() {}\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.packagePath).isEmpty()
        }
    }

    @Nested
    inner class ImportExtraction {
        @Test
        fun `should split the path of a single import at the slashes`() {
            // Arrange
            val code = """
                package main

                import "net/http"
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).containsExactly(ImportDeclaration(path = listOf("net", "http"), isWildcard = false))
        }

        @Test
        fun `should extract every spec of a grouped import in source order`() {
            // Arrange
            val code = """
                package main

                import (
                    "fmt"
                    log "github.com/sirupsen/logrus"
                    _ "embed"
                )
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports.map { it.path }).containsExactly(
                listOf("fmt"),
                listOf("github.com", "sirupsen", "logrus"),
                listOf("embed")
            )
            assertThat(result.imports).noneMatch { it.isWildcard }
        }

        @Test
        fun `should report the alias of an import and the blank identifier as its binding name`() {
            // Arrange
            val code = """
                package main

                import (
                    "fmt"
                    log "github.com/sirupsen/logrus"
                    _ "embed"
                )
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports.map { it.bindingName }).containsExactly(null, "log", "_")
        }

        @Test
        fun `should mark a dot import as wildcard`() {
            // Arrange
            val code = """
                package main

                import . "example.com/project/models"
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(
                result.imports
            ).containsExactly(ImportDeclaration(path = listOf("example.com", "project", "models"), isWildcard = true))
        }

        @Test
        fun `should leave out an import whose path is a raw string`() {
            // Arrange
            val code = "package main\n\nimport `fmt`\n"

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.imports).isEmpty()
        }
    }

    @Nested
    inner class DeclarationExtraction {
        @Test
        fun `should extract functions, structs and interfaces with their kind`() {
            // Arrange
            val code = """
                package shop

                type Order struct {
                    ID int
                }

                type Repository interface {
                    Find(id int) Order
                }

                func NewOrder() Order {
                    return Order{}
                }
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.type }).containsExactly(
                tuple("Order", DeclarationType.CLASS),
                tuple("Repository", DeclarationType.INTERFACE),
                tuple("NewOrder", DeclarationType.FUNCTION)
            )
        }

        @Test
        fun `should not extract a method as a declaration of its own`() {
            // Arrange
            val code = """
                package shop

                type Order struct{}

                func (o Order) Total() int {
                    return 0
                }
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("Order")
        }

        @Test
        fun `should name a grouped type declaration after its first type only`() {
            // Arrange
            val code = """
                package shop

                type (
                    Order struct{}
                    Invoice struct{}
                )
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("Order")
        }

        @Test
        fun `should name a type alias unknown`() {
            // Arrange
            val code = """
                package shop

                type Amount = int
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).extracting({ it.name }, { it.type }).containsExactly(tuple("unknown", DeclarationType.CLASS))
        }

        @Test
        fun `should extract a type declared inside a function as well`() {
            // Arrange
            val code = """
                package shop

                func Build() {
                    type draft struct{}
                }
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations.map { it.name }).containsExactly("Build", "draft")
        }
    }

    @Nested
    inner class UsedTypesOfTypeDeclarations {
        @Test
        fun `should extract field types, a qualified type both as written and by its name, but not the declared name`() {
            // Arrange
            val code = """
                package shop

                type Order struct {
                    Customer Customer
                    Client   *http.Client
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "Order")

            // Assert
            assertThat(usedTypes).containsExactly("Customer", "http.Client", "Client")
        }
    }

    @Nested
    inner class UsedTypesOfFunctions {
        @Test
        fun `should extract parameter types before result types before calls`() {
            // Arrange
            val code = """
                package shop

                func Convert(order *Order, writer io.Writer) (Invoice) {
                    return billing.Create(order)
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "Convert")

            // Assert
            assertThat(usedTypes).containsExactly("Order", "Writer", "Invoice", "Create", "io.Writer")
        }

        @Test
        fun `should extract the result type behind a pointer and a qualified result type by its name`() {
            // Arrange
            val code = """
                package shop

                func Load() *Order {
                    return nil
                }

                func Open() http.Handler {
                    return nil
                }
            """.trimIndent()

            // Act
            val loadTypes = usedTypeNamesOf(code, "Load")
            val openTypes = usedTypeNamesOf(code, "Open")

            // Assert
            assertThat(loadTypes).containsExactly("Order")
            assertThat(openTypes).containsExactly("Handler", "http.Handler")
        }

        @Test
        fun `should extract the functions called through a selector`() {
            // Arrange
            val code = """
                package main

                func processData() {
                    result := resources.LoadConfigFile("config.json")
                    formatted := log.FormatIndentedInterfaceAsJson(result, "", "  ")
                    return formatted
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "processData")

            // Assert
            assertThat(usedTypes).containsExactly("LoadConfigFile", "FormatIndentedInterfaceAsJson")
        }

        @Test
        fun `should extract only the call of a chain that goes through a plain name`() {
            // Arrange
            val code = """
                package main

                func processChainedCalls() {
                    result := client.Connect().Authenticate().Execute().GetResult()
                    return result
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "processChainedCalls")

            // Assert
            assertThat(usedTypes).containsExactly("Connect")
        }

        @Test
        fun `should extract a call passed as an argument after the call that receives it`() {
            // Arrange
            val code = """
                package main

                func processNestedCalls() {
                    formatter.Format(loader.Load("file.txt"))
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "processNestedCalls")

            // Assert
            assertThat(usedTypes).containsExactly("Format", "Load")
        }

        @Test
        fun `should extract calls through a selector before direct calls`() {
            // Arrange
            val code = """
                package main

                func run() {
                    prepare()
                    worker.Start()
                    cleanup(prepare())
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "run")

            // Assert
            assertThat(usedTypes).containsExactly("Start", "prepare", "cleanup")
        }

        @Test
        fun `should extract private functions called through a selector as well`() {
            // Arrange
            val code = """
                package main

                func run() {
                    helper.internalStep()
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "run")

            // Assert
            assertThat(usedTypes).containsExactly("internalStep")
        }

        @Test
        fun `should extract a type that is qualified with a package inside the body`() {
            // Arrange
            val code = """
                package main

                func run() {
                    var buffer bytes.Buffer
                    _ = buffer
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "run")

            // Assert
            assertThat(usedTypes).containsExactly("Buffer", "bytes.Buffer")
        }
    }

    @Nested
    inner class CallsInUnusualPlaces {
        @Test
        fun `should extract calls inside nested blocks`() {
            // Arrange
            val code = """
                package main

                func complexProcessing() {
                    if condition {
                        data := resources.LoadConfigFile("config.json")
                        for _, item := range data {
                            result := processor.Transform(item)
                            output := formatter.ToJson(result)
                        }
                    }
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "complexProcessing")

            // Assert
            assertThat(usedTypes).containsExactly("LoadConfigFile", "Transform", "ToJson")
        }

        @Test
        fun `should leave out a method called on a field`() {
            // Arrange
            val code = """
                package main

                func processFieldMethods() {
                    config.Logger.Info("message")
                    server.Config.Security.Validate()
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "processFieldMethods")

            // Assert
            assertThat(usedTypes).isEmpty()
        }

        @Test
        fun `should leave out a method called on the result of a function`() {
            // Arrange
            val code = """
                package main

                func processWithInterface(logger Logger) {
                    logger.Info("Processing started")
                    getLogger().Warn("Warning message")
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "processWithInterface")

            // Assert
            assertThat(usedTypes).containsExactly("Logger", "Info", "getLogger")
        }

        @Test
        fun `should extract a call that spreads a slice into its arguments`() {
            // Arrange
            val code = """
                package main

                func processVariadicCalls() {
                    fmt.Printf("Hello %s %d", name, age)
                    formatter.Sprintf("Format: %s %d %t", args...)
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "processVariadicCalls")

            // Assert
            assertThat(usedTypes).containsExactly("Printf", "Sprintf")
        }

        @Test
        fun `should extract generic functions and the types they are called with`() {
            // Arrange
            val code = """
                package main

                func processGenericCalls() {
                    result := utils.Map[string, int](data, transformer)
                    container := storage.NewContainer[Data]()
                    container.Add(item)
                    processed := pipeline.Transform[Input, Output](mapper.Convert[Raw, Input](rawData), processor)
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "processGenericCalls")

            // Assert
            assertThat(usedTypes).containsExactly(
                "Map",
                "NewContainer",
                "Add",
                "Transform",
                "Convert",
                "string",
                "int",
                "Data",
                "Input",
                "Output",
                "mapper.Convert",
                "Raw"
            )
        }

        @Test
        fun `should extract a function called in a variable declaration`() {
            // Arrange
            val code = """
                package main

                func NewQueryFromClauseError(qr *QueryRequest, detail string) *QueryError {
                    var err = NewQueryError(qr, MSG_QUERY_INVALID_FROM_CLAUSE, detail)
                    return err
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "NewQueryFromClauseError")

            // Assert
            assertThat(usedTypes).containsExactly("QueryRequest", "string", "QueryError", "NewQueryError")
        }
    }

    @Nested
    inner class BrokenCode {
        @Test
        fun `should extract the name of a qualified type inside another one before the name of the outer one`() {
            // Arrange
            val code = "func F()struct{e t.p.N"

            // Act
            val usedTypes = usedTypeNamesOf(code, "F")

            // Assert
            assertThat(usedTypes).containsExactly("p", "N", "e t.p.N", "t.p")
        }

        @Test
        fun `should extract the empty name of a missing parameter type as a type reference only`() {
            // Arrange
            val code = "func p`r(i,b)a.t)"

            // Act
            val usedTypes = usedTypeNamesOf(code, "p")

            // Assert
            assertThat(usedTypes).containsExactly("t", "", "a.t")
        }
    }

    @Nested
    inner class MethodsOfReceiverTypes {
        @Test
        fun `should add what a method uses to its receiver type`() {
            // Arrange
            val code = """
                package schema

                type Config struct {
                    Name string
                }

                func (c *Config) LoadSettings() error {
                    data := resources.LoadConfigFile("settings.json")
                    return validate(data)
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "Config")

            // Assert
            assertThat(usedTypes).containsExactly("string", "Config", "error", "LoadConfigFile", "validate")
        }

        @Test
        fun `should add what a method with a value receiver uses to its receiver type`() {
            // Arrange
            val code = """
                package schema

                type Config struct{}

                func (c Config) Describe() Description {
                    return Description{}
                }
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "Config")

            // Assert
            assertThat(usedTypes).containsExactly("Config", "Description")
        }

        @Test
        fun `should leave out the method of a generic receiver`() {
            // Arrange
            val code = """
                package schema

                type Stack[T any] struct{}

                func (s *Stack[T]) Push(item Element) {}
            """.trimIndent()

            // Act
            val usedTypes = usedTypeNamesOf(code, "Stack")

            // Assert
            assertThat(usedTypes).doesNotContain("Element")
        }

        @Test
        fun `should leave out a method whose receiver type is declared in another file`() {
            // Arrange
            val code = """
                package schema

                func (c *Config) Describe() Description {
                    return Description{}
                }
            """.trimIndent()

            // Act
            val result = analyze(code)

            // Assert
            assertThat(result.declarations).isEmpty()
        }
    }

    @Nested
    inner class SelectorQualifiers {
        @Test
        fun `should give a type written through a package that package as qualifier`() {
            // Arrange
            val code = """
                package shop

                type Order struct {
                    Client *http.Client
                }
            """.trimIndent()

            // Act
            val usedTypes = qualifiedNamesOf(code, "Order")

            // Assert
            assertThat(usedTypes).containsExactly("http.Client" to emptyList(), "Client" to listOf("http"))
        }

        @Test
        fun `should give the qualified parameter, result and body types their package as qualifier`() {
            // Arrange
            val code = """
                package shop

                func Convert(writer io.Writer) http.Handler {
                    var buffer bytes.Buffer
                    return nil
                }
            """.trimIndent()

            // Act
            val usedTypes = qualifiedNamesOf(code, "Convert")

            // Assert
            assertThat(usedTypes).containsExactly(
                "Writer" to listOf("io"),
                "Handler" to listOf("http"),
                "Buffer" to listOf("bytes"),
                "io.Writer" to emptyList(),
                "http.Handler" to emptyList(),
                "bytes.Buffer" to emptyList()
            )
        }

        @Test
        fun `should give a call through a selector on a plain name that name as qualifier`() {
            // Arrange
            val code = """
                package main

                func run() {
                    util.New()
                }
            """.trimIndent()

            // Act
            val usedTypes = qualifiedNamesOf(code, "run")

            // Assert
            assertThat(usedTypes).containsExactly("New" to listOf("util"))
        }

        @Test
        fun `should leave out a call through a selector on anything but a plain name`() {
            // Arrange
            val code = """
                package main

                func run() {
                    client.Connect().Authenticate()
                    config.server.Start()
                }
            """.trimIndent()

            // Act
            val usedTypes = qualifiedNamesOf(code, "run")

            // Assert
            assertThat(usedTypes).containsExactly("Connect" to listOf("client"))
        }

        @Test
        fun `should give a type written without a package no qualifier`() {
            // Arrange
            val code = """
                package shop

                func Load(order *Order) Invoice {
                    return Invoice{}
                }
            """.trimIndent()

            // Act
            val usedTypes = qualifiedNamesOf(code, "Load")

            // Assert
            assertThat(usedTypes).containsExactly("Order" to emptyList(), "Invoice" to emptyList())
        }
    }
}
