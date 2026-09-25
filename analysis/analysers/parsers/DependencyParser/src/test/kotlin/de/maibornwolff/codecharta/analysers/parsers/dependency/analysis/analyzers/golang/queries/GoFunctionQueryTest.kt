package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.treesitter.TSParser
import org.treesitter.TreeSitterGo
import kotlin.test.assertTrue

class GoFunctionQueryTest {
    private val golang = TreeSitterGo()
    private val query = GoFunctionQuery(golang)

    private fun parseGoCode(code: String) = TSParser()
        .apply {
            language = golang
        }.parseString(null, code)
        .rootNode

    @Test
    fun `should detect function calls in function body`() {
        // Arrange - This test should FAIL initially
        val goCode = """
            package main

            func processData() {
                result := resources.LoadConfigFile("config.json")
                formatted := log.FormatIndentedInterfaceAsJson(result, "", "  ")
                return formatted
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        // Find the function declaration
        val functionNode = findFunctionNode(rootNode, goCode, "processData")
        assertNotNull(functionNode, "Function 'processData' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        assertTrue(
            typeNames.contains("LoadConfigFile"),
            "Should detect LoadConfigFile function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("FormatIndentedInterfaceAsJson"),
            "Should detect FormatIndentedInterfaceAsJson function call. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect function calls in method body`() {
        // Arrange - This test should FAIL initially
        val goCode = """
            package schema

            type Config struct {
                Name string
            }

            func (c *Config) LoadSettings() error {
                data, err := resources.LoadConfigFile("settings.json")
                if err != nil {
                    return err
                }
                formatted := log.FormatIndentedInterfaceAsJson(data, "", "  ")
                return nil
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        // Find the method declaration
        val methodNode = findMethodNode(rootNode, goCode, "LoadSettings")
        assertNotNull(methodNode, "Method 'LoadSettings' should be found")

        val usedTypes = query.execute(methodNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        assertTrue(
            typeNames.contains("LoadConfigFile"),
            "Should detect LoadConfigFile function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("FormatIndentedInterfaceAsJson"),
            "Should detect FormatIndentedInterfaceAsJson function call. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect all function calls including private ones`() {
        // Arrange - Updated test to reflect new behavior
        val goCode = """
            package main

            func processData() {
                // Public function calls (capitalized)
                result := resources.LoadConfigFile("config.json")
                formatted := log.FormatAsJson(result)
                
                // Private function calls (lowercase) - should now be detected
                helper := utils.validateInput(result)
                internal := config.parseSettings(formatted)
                
                return formatted
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "processData")
        assertNotNull(functionNode, "Function 'processData' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        // Should detect public functions (capitalized)
        assertTrue(
            typeNames.contains("LoadConfigFile"),
            "Should detect public LoadConfigFile function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("FormatAsJson"),
            "Should detect public FormatAsJson function call. Found types: $typeNames"
        )

        // Should NOW detect private functions (lowercase)
        assertTrue(
            typeNames.contains("validateInput"),
            "Should detect private validateInput function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("parseSettings"),
            "Should detect private parseSettings function call. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect nested function calls`() {
        // Arrange - This test should FAIL initially
        val goCode = """
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
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "complexProcessing")
        assertNotNull(functionNode, "Function 'complexProcessing' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        assertTrue(
            typeNames.contains("LoadConfigFile"),
            "Should detect LoadConfigFile in if block. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Transform"),
            "Should detect Transform in for loop. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("ToJson"),
            "Should detect ToJson in for loop. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect method chaining calls`() {
        // Arrange - Critical edge case for method chaining
        val goCode = """
            package main

            func processChainedCalls() {
                // Method chaining - should detect all public methods
                result := client.Connect().Authenticate().Execute().GetResult()
                
                // Mixed chaining with private method (should skip private)
                data := builder.SetName("test").setValue(123).Build()
                
                return result
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "processChainedCalls")
        assertNotNull(functionNode, "Function 'processChainedCalls' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        // Should detect all public methods in chain
        assertTrue(
            typeNames.contains("Connect"),
            "Should detect Connect in method chain. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Authenticate"),
            "Should detect Authenticate in method chain. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Execute"),
            "Should detect Execute in method chain. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("GetResult"),
            "Should detect GetResult in method chain. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("SetName"),
            "Should detect public SetName method. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Build"),
            "Should detect public Build method. Found types: $typeNames"
        )

        // Should now detect private method
        assertTrue(
            typeNames.contains("setValue"),
            "Should detect private setValue method. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect struct field method calls`() {
        // Arrange - Critical edge case for struct field access
        val goCode = """
            package main

            func processFieldMethods() {
                // Struct field method calls - should detect method on field
                config.Logger.Info("message")
                app.Database.Connect()
                service.Client.Execute()
                
                // Nested field access
                server.Config.Security.Validate()
                
                return nil
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "processFieldMethods")
        assertNotNull(functionNode, "Function 'processFieldMethods' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        assertTrue(
            typeNames.contains("Info"),
            "Should detect Info method on Logger field. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Connect"),
            "Should detect Connect method on Database field. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Execute"),
            "Should detect Execute method on Client field. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Validate"),
            "Should detect Validate method on nested field access. Found types: $typeNames"
        )
    }

    private fun findFunctionNode(rootNode: org.treesitter.TSNode, sourceCode: String, functionName: String): org.treesitter.TSNode? =
        findDeclarationNode(rootNode, sourceCode, functionName, "function_declaration")

    private fun findMethodNode(rootNode: org.treesitter.TSNode, sourceCode: String, methodName: String): org.treesitter.TSNode? =
        findDeclarationNode(rootNode, sourceCode, methodName, "method_declaration")

    @Test
    fun `should detect interface method calls`() {
        // Arrange - Interface method calls through interface variables
        val goCode = """
            package main

            type Logger interface {
                Info(string)
                Error(string)
                Debug(string)
            }

            func processWithInterface(logger Logger) {
                // Interface method calls - should detect public methods
                logger.Info("Processing started")
                logger.Error("An error occurred")
                logger.Debug("Debug information")
                
                // Method calls on interface returned from function
                getLogger().Warn("Warning message")
                
                return
            }

            func getLogger() Logger {
                return nil
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "processWithInterface")
        assertNotNull(functionNode, "Function 'processWithInterface' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        assertTrue(
            typeNames.contains("Info"),
            "Should detect Info interface method call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Error"),
            "Should detect Error interface method call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Debug"),
            "Should detect Debug interface method call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Warn"),
            "Should detect Warn method call on returned interface. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect variadic function calls with multiple arguments`() {
        // Arrange - Variadic function calls with various argument patterns
        val goCode = """
            package main

            func processVariadicCalls() {
                // Simple variadic calls
                fmt.Printf("Hello %s %d", name, age)
                log.Errorf("Error: %v", err)
                
                // Variadic calls with slice expansion
                args := []interface{}{"test", 123, true}
                formatter.Sprintf("Format: %s %d %t", args...)
                
                // Mixed argument types
                validator.CheckFields("required", field1, field2, field3)
                builder.AddElements(container, elem1, elem2, elem3)
                
                return
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "processVariadicCalls")
        assertNotNull(functionNode, "Function 'processVariadicCalls' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        assertTrue(
            typeNames.contains("Printf"),
            "Should detect Printf variadic function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Errorf"),
            "Should detect Errorf variadic function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Sprintf"),
            "Should detect Sprintf with slice expansion. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("CheckFields"),
            "Should detect CheckFields with multiple args. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("AddElements"),
            "Should detect AddElements with multiple args. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect generic function calls`() {
        // Arrange - Generic function calls (Go 1.18+ syntax)
        val goCode = """
            package main

            func processGenericCalls() {
                // Generic function calls with type parameters
                result := utils.Map[string, int](data, transformer)
                filtered := collections.Filter[User](users, predicate)
                
                // Generic method calls
                container := storage.NewContainer[Data]()
                container.Add(item)
                value := container.Get[string]("key")
                
                // Nested generic calls
                processed := pipeline.Transform[Input, Output](
                    mapper.Convert[Raw, Input](rawData),
                    processor,
                )
                
                return result
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "processGenericCalls")
        assertNotNull(functionNode, "Function 'processGenericCalls' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        assertTrue(
            typeNames.contains("Map"),
            "Should detect Map generic function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Filter"),
            "Should detect Filter generic function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("NewContainer"),
            "Should detect NewContainer generic constructor. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Add"),
            "Should detect Add method on generic container. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Get"),
            "Should detect Get generic method call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Transform"),
            "Should detect Transform generic function. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Convert"),
            "Should detect Convert in nested generic call. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect function calls in variable assignments`() {
        // Arrange - Test for the exact case from task.md
        val goCode = """
            package main

            func NewQueryFromClauseError(qr *QueryRequest, detail string) *QueryError {
                var err = NewQueryError(qr, MSG_QUERY_INVALID_FROM_CLAUSE, detail)
                return err
            }
            
            func FormatStructE(dataStructure interface{}) (string, error) {
                return innerFormatStruct(dataStructure, log.indentRunes, log.spacesIncrement, log.maxStrLength)
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)

        // Test NewQueryFromClauseError
        val queryErrorNode = findFunctionNode(rootNode, goCode, "NewQueryFromClauseError")
        assertNotNull(queryErrorNode, "Function 'NewQueryFromClauseError' should be found")
        val queryErrorTypes = query.execute(queryErrorNode!!, goCode)
        val queryErrorTypeNames = queryErrorTypes.map { it.name }

        // Test FormatStructE
        val formatNode = findFunctionNode(rootNode, goCode, "FormatStructE")
        assertNotNull(formatNode, "Function 'FormatStructE' should be found")
        val formatTypes = query.execute(formatNode!!, goCode)
        val formatTypeNames = formatTypes.map { it.name }

        // Assert
        assertTrue(
            queryErrorTypeNames.contains("NewQueryError"),
            "Should detect NewQueryError in variable assignment. Found types: $queryErrorTypeNames"
        )

        // Private function should now be detected
        assertTrue(
            formatTypeNames.contains("innerFormatStruct"),
            "Should detect private innerFormatStruct. Found types: $formatTypeNames"
        )
    }

    @Test
    fun `should detect direct function calls without selector`() {
        // Arrange - Test for direct function calls like NewQueryError()
        val goCode = """
            package main

            func processErrors() {
                // Direct function calls (no selector)
                err := NewQueryError(request, "invalid", "details")
                formatted := FormatStruct(data)
                result := innerFormatStruct(data, runes, spaces, 128)
                
                // Direct calls in return statements
                return NewError("failed")
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "processErrors")
        assertNotNull(functionNode, "Function 'processErrors' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        // This test should FAIL initially - direct calls are not detected
        assertTrue(
            typeNames.contains("NewQueryError"),
            "Should detect NewQueryError direct function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("FormatStruct"),
            "Should detect FormatStruct direct function call. Found types: $typeNames"
        )

        // Private function should now be detected (filtering removed)
        assertTrue(
            typeNames.contains("innerFormatStruct"),
            "Should detect private innerFormatStruct. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("NewError"),
            "Should detect NewError in return statement. Found types: $typeNames"
        )
    }

    @Test
    fun `should detect function calls as arguments to other functions`() {
        // Arrange - Function calls used as arguments to other functions
        val goCode = """
            package main

            func processNestedFunctionCalls() {
                // Function calls as arguments
                result := processor.Transform(
                    loader.LoadData("file.json"),
                    validator.Validate(schema.GetSchema()),
                )
                
                // Chained calls as arguments
                output := formatter.Format(
                    converter.Convert(parser.Parse(input)),
                    options.GetFormatOptions(),
                )
                
                // Multiple nested levels
                final := aggregator.Combine(
                    mapper.MapValues(
                        filter.FilterValid(
                            reader.ReadAll("source.txt")
                        )
                    ),
                    config.GetDefaultValues(),
                )
                
                return final
            }
        """.trimIndent()

        // Act
        val rootNode = parseGoCode(goCode)
        val functionNode = findFunctionNode(rootNode, goCode, "processNestedFunctionCalls")
        assertNotNull(functionNode, "Function 'processNestedFunctionCalls' should be found")

        val usedTypes = query.execute(functionNode!!, goCode)

        // Assert
        val typeNames = usedTypes.map { it.name }

        // First level function calls
        assertTrue(
            typeNames.contains("Transform"),
            "Should detect Transform function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Format"),
            "Should detect Format function call. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Combine"),
            "Should detect Combine function call. Found types: $typeNames"
        )

        // Nested function calls as arguments
        assertTrue(
            typeNames.contains("LoadData"),
            "Should detect LoadData as argument. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Validate"),
            "Should detect Validate as argument. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("GetSchema"),
            "Should detect GetSchema nested in Validate. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Convert"),
            "Should detect Convert in chained argument. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("Parse"),
            "Should detect Parse nested in Convert. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("GetFormatOptions"),
            "Should detect GetFormatOptions. Found types: $typeNames"
        )

        // Deep nesting
        assertTrue(
            typeNames.contains("MapValues"),
            "Should detect MapValues in deep nesting. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("FilterValid"),
            "Should detect FilterValid in deep nesting. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("ReadAll"),
            "Should detect ReadAll in deepest nesting. Found types: $typeNames"
        )

        assertTrue(
            typeNames.contains("GetDefaultValues"),
            "Should detect GetDefaultValues. Found types: $typeNames"
        )
    }

    private fun findDeclarationNode(
        rootNode: org.treesitter.TSNode,
        sourceCode: String,
        name: String,
        nodeType: String
    ): org.treesitter.TSNode? {
        // Walk through all child nodes to find the declaration
        for (i in 0 until rootNode.childCount) {
            val child = rootNode.getChild(i)
            if (child.type == nodeType) {
                val nameNode = child.getChildByFieldName("name")
                if (nameNode != null && !nameNode.isNull) {
                    val actualName = nodeAsString(nameNode, sourceCode)
                    if (actualName == name) {
                        return child
                    }
                }
            }
        }
        return null
    }
}
