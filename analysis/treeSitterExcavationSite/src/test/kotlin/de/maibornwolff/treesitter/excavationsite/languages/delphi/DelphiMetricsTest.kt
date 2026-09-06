package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class DelphiMetricsTest {
    @Nested
    inner class LogicComplexity {
        @Test
        fun `should count if statements for complexity`() {
            // Arrange - one function + one if inside
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  if 1 = 1 then Bar;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert - 1 function (defProc) + 1 if = 2
            assertThat(result.complexity).isEqualTo(2.0)
        }

        @Test
        fun `should count for loops for complexity`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo;
                var i: Integer;
                begin
                  for i := 1 to 10 do Bar(i);
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count while loops for complexity`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  while 1 = 2 do Bar;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count repeat loops for complexity`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  repeat Bar until 1 = 2;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(1.0)
        }

        @Test
        fun `should count try and exception handlers for complexity`() {
            // Arrange - one try + one exceptionHandler
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  try
                    Bar;
                  except
                    on E: Exception do Baz;
                  end;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert - try + exceptionHandler = 2
            assertThat(result.logicComplexity).isEqualTo(2.0)
        }
    }

    @Nested
    inner class ConditionalComplexity {
        @Test
        fun `should count binary and-or operators for complexity`() {
            // Arrange - if + `and` + `or` = 3 logic complexity
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  if (1 = 1) and (2 = 2) or (3 = 3) then Bar;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(3.0)
        }
    }

    @Nested
    inner class FunctionCount {
        @Test
        fun `should count defProc as a function`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                end;
                function Bar: Integer;
                begin
                  Result := 1;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(2.0)
        }

        @Test
        fun `should not count declProc in interface section as a function`() {
            // Arrange - interface-section declaration without implementation
            val code = """
                unit U;
                interface
                procedure Foo;
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.numberOfFunctions).isEqualTo(0.0)
        }
    }

    @Nested
    inner class Parameters {
        @Test
        fun `should count declArg as parameter`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo(A: Integer; B: String);
                begin
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert - two declArg nodes for the two parameters
            assertThat(result.perFunctionMetrics["max_parameters_per_function"]).isEqualTo(2.0)
        }
    }

    @Nested
    inner class Comments {
        @Test
        fun `should count line comment`() {
            // Arrange - single line comment
            val code = """
                unit U; // this is a line comment
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.commentLines).isEqualTo(1.0)
        }

        @Test
        fun `should count brace comment`() {
            // Arrange
            val code = """
                unit U;
                { this is a brace comment }
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.commentLines).isEqualTo(1.0)
        }

        @Test
        fun `should count star comment`() {
            // Arrange
            val code = """
                unit U;
                (* this is a star comment *)
                interface
                implementation
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.commentLines).isEqualTo(1.0)
        }
    }

    @Nested
    inner class CaseStatementComplexity {
        @Test
        fun `should count case arms for complexity`() {
            // Arrange - case container + 3 caseCase arms = 4 logic complexity nodes
            val code = """
                unit U; interface implementation
                procedure Foo(X: Integer);
                begin
                  case X of
                    1: Bar;
                    2: Baz;
                    3: Qux;
                  end;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.logicComplexity).isEqualTo(4.0)
        }
    }

    @Nested
    inner class MessageChains {
        @Test
        fun `should count long method chain with explicit calls`() {
            // Arrange - 4 chained calls (exprCall) triggers the MESSAGE_CHAINS_THRESHOLD of 4.
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  Obj.M1().M2().M3().M4();
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.messageChains).isEqualTo(1.0)
        }

        @Test
        fun `should count paren-less method chain via exprDot calls`() {
            // Arrange - Pascal's paren-less method invocation `Obj.M1.M2.M3.M4` produces
            // a chain of exprDot nodes. With the new exprDot-as-call mapping (and the
            // exprDot-inside-exprCall ignore rule), the chain of 4 dot accesses counts
            // as one message chain.
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  Obj.M1.M2.M3.M4;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.messageChains).isEqualTo(1.0)
        }

        @Test
        fun `should not double count parenthesised chain that wraps exprDot in exprCall`() {
            // Arrange - same chain length as the previous test but parenthesised. The
            // exprCall-wrapping rule prevents the inner exprDot from also counting,
            // so the chain still resolves to a single message-chain count.
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  Obj.M1().M2().M3().M4();
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.messageChains).isEqualTo(1.0)
        }

        @Test
        fun `should count mixed paren-less and parenthesised chain as one chain`() {
            // Arrange - mixed `Obj.M1.M2().M3.M4()` should still resolve to one chain.
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  Obj.M1.M2().M3.M4();
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.messageChains).isEqualTo(1.0)
        }

        @Test
        fun `should not count chains shorter than threshold`() {
            // Arrange - three dot accesses are below MESSAGE_CHAINS_THRESHOLD = 4.
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  A.B.C;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.messageChains).isEqualTo(0.0)
        }

        @Test
        fun `should not count single non-chain expression`() {
            // Arrange
            val code = """
                unit U; interface implementation
                procedure Foo;
                begin
                  Bar;
                end;
                end.
            """.trimIndent()

            // Act
            val result = TreeSitterMetrics.parse(code, Language.DELPHI)

            // Assert
            assertThat(result.messageChains).isEqualTo(0.0)
        }
    }
}
