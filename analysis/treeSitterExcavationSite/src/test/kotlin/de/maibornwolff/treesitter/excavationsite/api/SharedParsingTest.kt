package de.maibornwolff.treesitter.excavationsite.api

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource

class SharedParsingTest {
    @ParameterizedTest(name = "{0}")
    @MethodSource("sources")
    fun `should analyse a source the same with a shared parse as with a parse of its own`(language: Language, content: String) {
        // Arrange
        val ownParses = analysesOf(content, language)

        // Act
        val sharedParses = SharedParsing.within { analysesOf(content, language) }

        // Assert
        assertThat(sharedParses).isEqualTo(ownParses)
    }

    private fun analysesOf(content: String, language: Language): List<Any> = listOf(
        TreeSitterMetrics.parse(content, language),
        TreeSitterExtraction.extract(content, language),
        TreeSitterDependencies.analyze(content, language)
    )

    companion object {
        @JvmStatic
        fun sources(): List<Arguments> = listOf(
            Arguments.of(
                Language.JAVA,
                "package a;\nimport b.C;\n/** A hoard. */\nclass Hoard extends C { int gold(int x) { if (x > 0) return x; return 0; } }\n"
            ),
            Arguments.of(
                Language.TYPESCRIPT,
                "import { Component } from '@angular/core';\n" +
                    "@Component({ selector: 'cc-lair', template: '<p>{{ gold }} caf&eacute;</p>' })\n" +
                    "export class Lair { gold = 'coins'; }\n"
            ),
            Arguments.of(
                Language.VUE,
                "<template><p>{{ gold }}</p></template>\n" +
                    "<script setup lang=\"ts\">\nimport { ref } from 'vue';\nconst gold = ref(1);\n</script>\n"
            )
        )
    }
}
