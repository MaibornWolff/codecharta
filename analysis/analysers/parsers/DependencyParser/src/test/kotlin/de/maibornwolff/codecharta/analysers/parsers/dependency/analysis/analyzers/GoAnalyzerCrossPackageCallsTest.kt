package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class GoAnalyzerCrossPackageCallsTest {
    @Test
    fun `should detect resources LoadConfigFile function call from schema package`() {
        // Arrange - schema package calling resources.LoadConfigFile()
        val schemaFileContent = """
            package schema

            import (
                "encoding/json"
                "fmt"
                "os"
                "sync"

            )

            type LicensePolicyConfig struct {
                PolicyList              []LicensePolicy   `json:"policies"`
                Annotations             map[string]string `json:"annotations"`
                defaultPolicyConfigFile string
                policyConfigFile        string
            }

            func (config *LicensePolicyConfig) innerLoadLicensePolicies(policyFile string, defaultPolicyFile string) (err error) {
                var buffer []byte

                if policyFile != "" {
                    buffer, err = os.ReadFile(policyFile)
                    if err != nil {
                        return fmt.Errorf("unable to 'ReadFile': '%s'", policyFile)
                    }
                } else {
                    // This call should be detected as a dependency
                    buffer, err = resources.LoadConfigFile(defaultPolicyFile)
                    if err != nil {
                        return fmt.Errorf("unable to read schema config file: '%s' from embedded resources: '%s'",
                            defaultPolicyFile, resources.RESOURCES_CONFIG_DIR)
                    }
                }

                errUnmarshal := json.Unmarshal(buffer, config)
                if errUnmarshal != nil {
                    err = fmt.Errorf("cannot 'Unmarshal': '%s'", policyFile)
                    return
                }

                return
            }
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.GO,
            physicalPath = "/test/schema/license_policy_config.go",
            content = schemaFileContent
        )

        // Act
        val analyzer = GoAnalyzer(fileInfo)
        val fileReport = analyzer.analyze()

        // Assert
        // innerLoadLicensePolicies is a private method, so it should be aggregated into LicensePolicyConfig
        val licensePolicyConfigNode = findNodeByName(fileReport.nodes, "LicensePolicyConfig")
        assertNotNull(licensePolicyConfigNode, "LicensePolicyConfig type should be found")

        // Check if LoadConfigFile is detected as a used type/dependency in the receiver type
        val hasLoadConfigFileCall = licensePolicyConfigNode!!.usedTypes.any { type ->
            type.name == "LoadConfigFile" || type.name.contains("LoadConfigFile")
        }

        assertTrue(
            hasLoadConfigFileCall,
            "LoadConfigFile function call should be detected as a dependency in LicensePolicyConfig. " +
                "Found types: ${licensePolicyConfigNode.usedTypes.map { it.name }}"
        )
    }

    @Test
    fun `should detect log FormatIndentedInterfaceAsJson function call from cmd package`() {
        // Arrange - cmd package calling log.FormatIndentedInterfaceAsJson()
        val cmdFileContent = """
            package cmd

            const (
                ERROR_DETAIL_JSON_DEFAULT_PREFIX = ""
                ERROR_DETAIL_JSON_DEFAULT_INDENT = "  "
                ERROR_DETAIL_JSON_NEWLINE_INDENT = "\n"
            )

            type ValidationErrorResult struct {
                resultMap map[string]interface{}
            }

            func (result *ValidationErrorResult) formatResultMap(flags utils.ValidateCommandFlags) string {
                var formattedResult string
                var errFormatting error
                if flags.ColorizeErrorOutput {
                    formattedResult, errFormatting = log.FormatIndentedInterfaceAsColorizedJson(
                        result.resultMap,
                        len(ERROR_DETAIL_JSON_DEFAULT_INDENT),
                        ERROR_DETAIL_JSON_NEWLINE_INDENT,
                    )
                } else {
                    // This call should be detected as a dependency
                    formattedResult, errFormatting = log.FormatIndentedInterfaceAsJson(
                        result.resultMap,
                        ERROR_DETAIL_JSON_DEFAULT_PREFIX,
                        ERROR_DETAIL_JSON_DEFAULT_INDENT,
                    )
                }
                if errFormatting != nil {
                    return getLogger().Errorf("MSG_ERROR_FORMATTING_ERROR", errFormatting.Error()).Error()
                }

                return formattedResult
            }

            func getLogger() *log.MiniLogger {
                return nil
            }
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.GO,
            physicalPath = "/test/cmd/validate_format.go",
            content = cmdFileContent
        )

        // Act
        val analyzer = GoAnalyzer(fileInfo)
        val fileReport = analyzer.analyze()

        // Assert
        // formatResultMap is a private method, so it should be aggregated into ValidationErrorResult
        val validationErrorResultNode = findNodeByName(fileReport.nodes, "ValidationErrorResult")
        assertNotNull(validationErrorResultNode, "ValidationErrorResult type should be found")

        // Check if FormatIndentedInterfaceAsJson is detected as a used type/dependency in the receiver type
        val hasFormatIndentedInterfaceAsJsonCall = validationErrorResultNode!!.usedTypes.any { type ->
            type.name == "FormatIndentedInterfaceAsJson" || type.name.contains("FormatIndentedInterfaceAsJson")
        }

        assertTrue(
            hasFormatIndentedInterfaceAsJsonCall,
            "FormatIndentedInterfaceAsJson function call should be detected as a dependency in ValidationErrorResult. " +
                "Found types: ${validationErrorResultNode.usedTypes.map { it.name }}"
        )
    }

    @Test
    fun `should detect both FormatIndentedInterfaceAsJson and FormatIndentedInterfaceAsColorizedJson function calls`() {
        // Arrange - cmd package calling both log functions
        val cmdFileContent = """
            package cmd

            type ValidationErrorResult struct {
                resultMap map[string]interface{}
            }

            func (result *ValidationErrorResult) formatResultMap(flags utils.ValidateCommandFlags) string {
                var formattedResult string
                var errFormatting error
                if flags.ColorizeErrorOutput {
                    // This call should be detected
                    formattedResult, errFormatting = log.FormatIndentedInterfaceAsColorizedJson(
                        result.resultMap,
                        2,
                        "\n",
                    )
                } else {
                    // This call should also be detected
                    formattedResult, errFormatting = log.FormatIndentedInterfaceAsJson(
                        result.resultMap,
                        "",
                        "  ",
                    )
                }
                return formattedResult
            }
        """.trimIndent()

        val fileInfo = FileInfo(
            language = SupportedLanguage.GO,
            physicalPath = "/test/cmd/validate_format.go",
            content = cmdFileContent
        )

        // Act
        val analyzer = GoAnalyzer(fileInfo)
        val fileReport = analyzer.analyze()

        // Assert
        // formatResultMap is a private method, so it should be aggregated into ValidationErrorResult
        val validationErrorResultNode = findNodeByName(fileReport.nodes, "ValidationErrorResult")
        assertNotNull(validationErrorResultNode, "ValidationErrorResult type should be found")

        // Check if both function calls are detected in the receiver type
        val usedTypeNames = validationErrorResultNode!!.usedTypes.map { it.name }

        val hasFormatIndentedInterfaceAsJsonCall = usedTypeNames.any {
            it == "FormatIndentedInterfaceAsJson" || it.contains("FormatIndentedInterfaceAsJson")
        }

        val hasFormatIndentedInterfaceAsColorizedJsonCall = usedTypeNames.any {
            it == "FormatIndentedInterfaceAsColorizedJson" || it.contains("FormatIndentedInterfaceAsColorizedJson")
        }

        assertTrue(
            hasFormatIndentedInterfaceAsJsonCall,
            "FormatIndentedInterfaceAsJson function call should be detected in ValidationErrorResult. Found types: $usedTypeNames"
        )

        assertTrue(
            hasFormatIndentedInterfaceAsColorizedJsonCall,
            "FormatIndentedInterfaceAsColorizedJson function call should be detected in ValidationErrorResult. Found types: $usedTypeNames"
        )
    }

    private fun findNodeByName(nodes: List<Node>, name: String): Node? = nodes.find { node ->
        node.pathWithName.parts.lastOrNull() == name
    }
}
