package de.maibornwolff.treesitter.excavationsite.languages.javascript

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class JavascriptExtractionTest {
    @Nested
    inner class JavaScriptTests {
        @Test
        fun `should extract class declaration identifier`() {
            // Arrange
            val code = "class UserProfile {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("UserProfile")
        }

        @Test
        fun `should extract function declaration identifier`() {
            // Arrange
            val code = "function processOrder() {}"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("processOrder")
        }

        @Test
        fun `should extract variable declarator identifiers`() {
            // Arrange
            val code = """
                const userName = "John";
                let userAge = 30;
                var isActive = true;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("userName", "userAge", "isActive")
        }

        @Test
        fun `should extract method definition identifier`() {
            // Arrange
            val code = """
                class Calculator {
                    add(a, b) {
                        return a + b;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("Calculator", "add")
        }

        @Test
        fun `should extract arrow function assigned to variable`() {
            // Arrange
            val code = "const double = (x) => x * 2;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("double")
        }

        @Test
        fun `should extract generator function identifier`() {
            // Arrange
            val code = "function* idGenerator() { yield 1; }"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).containsExactly("idGenerator")
        }

        @Test
        fun `should extract single line comment`() {
            // Arrange
            val code = """
                // This is a comment
                const x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.comments).hasSize(1)
            assertThat(result.comments[0]).isEqualTo("This is a comment")
        }

        @Test
        fun `should extract multiline comment`() {
            // Arrange
            val code = """
                /*
                 * This is a
                 * multiline comment
                 */
                const x = 1;
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.comments).containsExactly("This is a\nmultiline comment")
        }

        @Test
        fun `should extract double quoted string`() {
            // Arrange
            val code = """const message = "Hello World";"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract single quoted string`() {
            // Arrange
            val code = """const message = 'Hello World';"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should extract template string`() {
            // Arrange
            val code = "const message = `Hello World`;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World")
        }

        @Test
        fun `should handle empty source code`() {
            // Arrange
            val code = ""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.identifiers).isEmpty()
            assertThat(result.comments).isEmpty()
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should extract identifiers from complex class`() {
            // Arrange
            val code = """
                class OrderProcessor {
                    constructor(orderId) {
                        this.orderId = orderId;
                    }

                    processOrder(customerId) {
                        const result = this.validate();
                        return result;
                    }

                    validate() {
                        return true;
                    }
                }
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            // Note: JS parameters (orderId, customerId) are not extracted as they're bare identifiers
            // TypeScript parameters are extracted via required_parameter nodes
            // 'constructor' is a keyword, not a meaningful identifier, so it's not extracted
            assertThat(result.identifiers).containsExactly(
                "OrderProcessor",
                "processOrder",
                "result",
                "validate"
            )
        }
    }

    @Nested
    inner class ImportStringTests {
        @Test
        fun `should not extract import path strings`() {
            // Arrange
            val code = """
                import { Component } from '@angular/core';
                import React from "react";
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should not extract export path strings`() {
            // Arrange
            val code = """
                export { foo } from './foo';
                export * from "../utils";
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should not extract require path strings`() {
            // Arrange
            val code = """
                const fs = require('fs');
                const path = require("path");
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should still extract regular strings alongside imports`() {
            // Arrange
            val code = """
                import React from 'react';
                const message = "Hello World";
                const greeting = 'Welcome';
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello World", "Welcome")
        }

        @Test
        fun `should still extract template strings not in imports`() {
            // Arrange
            val code = "const msg = `Hello`;"

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Hello")
        }

        @Test
        fun `should not extract dynamic import strings`() {
            // Arrange
            val code = """const mod = import('./module');"""

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).isEmpty()
        }

        @Test
        fun `should extract the strings of exported declarations`() {
            // Arrange
            val code = """
                export const greeting = 'Welcome';
                export default function greet() { return "Hello"; }
                export * from './greetings';
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("Welcome", "Hello")
        }

        @Test
        fun `should handle mixed imports and regular strings`() {
            // Arrange
            val code = """
                import { service } from '@app/services';
                const config = require('./config');
                const name = "MyApp";
                export { utils } from './utils';
                const version = '1.0.0';
            """.trimIndent()

            // Act
            val result = TreeSitterExtraction.extract(code, Language.JAVASCRIPT)

            // Assert
            assertThat(result.strings).containsExactly("MyApp", "1.0.0")
        }
    }

    @Nested
    inner class APITests {
        @Test
        fun `should report extraction is supported for JavaScript`() {
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.JAVASCRIPT)).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".js")).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".jsx")).isTrue()
        }

        @Test
        fun `should report extraction is supported for TypeScript`() {
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.TYPESCRIPT)).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".ts")).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(".tsx")).isTrue()
        }

        @Test
        fun `should return JavaScript and TypeScript in supported languages`() {
            // Act & Assert
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.JAVASCRIPT)).isTrue()
            assertThat(TreeSitterExtraction.isExtractionSupported(Language.TYPESCRIPT)).isTrue()
        }
    }
}
