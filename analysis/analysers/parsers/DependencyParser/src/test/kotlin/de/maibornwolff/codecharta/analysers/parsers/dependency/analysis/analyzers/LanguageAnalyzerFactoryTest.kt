package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp.CppAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi.DelphiAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java.JavaAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.javascript.JavascriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.kotlin.KotlinAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.PhpAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.PythonAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust.RustAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.TypescriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.VueAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource

class LanguageAnalyzerFactoryTest {
    companion object {
        @JvmStatic
        fun getFileInfoToAnalyzer(): List<Arguments> {
            val javaFileInfo = FileInfo(
                language = SupportedLanguage.JAVA,
                physicalPath = "",
                content = ""
            )
            val cSharpFileInfo = FileInfo(
                language = SupportedLanguage.C_SHARP,
                physicalPath = "",
                content = ""
            )

            val typescriptFileInfo = FileInfo(
                language = SupportedLanguage.TYPESCRIPT,
                physicalPath = "",
                content = ""
            )
            val kotlinFileInfo = FileInfo(
                language = SupportedLanguage.KOTLIN,
                physicalPath = "",
                content = ""
            )
            val javascriptFileInfo = FileInfo(
                language = SupportedLanguage.JAVASCRIPT,
                physicalPath = "",
                content = ""
            )
            val phpFileInfo = FileInfo(
                language = SupportedLanguage.PHP,
                physicalPath = "",
                content = ""
            )
            val goFileInfo = FileInfo(
                language = SupportedLanguage.GO,
                physicalPath = "",
                content = ""
            )
            val pythonFileInfo = FileInfo(
                language = SupportedLanguage.PYTHON,
                physicalPath = "",
                content = ""
            )
            val cppFileInfo = FileInfo(
                language = SupportedLanguage.CPP,
                physicalPath = "",
                content = ""
            )
            val vueFileInfo = FileInfo(
                language = SupportedLanguage.VUE,
                physicalPath = "",
                content = ""
            )
            val delphiFileInfo = FileInfo(
                language = SupportedLanguage.DELPHI,
                physicalPath = "",
                content = ""
            )
            val rustFileInfo = FileInfo(
                language = SupportedLanguage.RUST,
                physicalPath = "",
                content = ""
            )
            return listOf(
                Arguments.of(javaFileInfo, JavaAnalyzer(javaFileInfo)),
                Arguments.of(cSharpFileInfo, CSharpAnalyzer(cSharpFileInfo)),
                Arguments.of(typescriptFileInfo, TypescriptAnalyzer(typescriptFileInfo)),
                Arguments.of(kotlinFileInfo, KotlinAnalyzer(kotlinFileInfo)),
                Arguments.of(javascriptFileInfo, JavascriptAnalyzer(javascriptFileInfo)),
                Arguments.of(phpFileInfo, PhpAnalyzer(phpFileInfo)),
                Arguments.of(goFileInfo, GoAnalyzer(goFileInfo)),
                Arguments.of(pythonFileInfo, PythonAnalyzer(pythonFileInfo)),
                Arguments.of(cppFileInfo, CppAnalyzer(cppFileInfo)),
                Arguments.of(vueFileInfo, VueAnalyzer(vueFileInfo)),
                Arguments.of(delphiFileInfo, DelphiAnalyzer(delphiFileInfo)),
                Arguments.of(rustFileInfo, RustAnalyzer(rustFileInfo))
            )
        }
    }

    @ParameterizedTest
    @MethodSource("getFileInfoToAnalyzer")
    fun `returns the language of the analyzer`(fileInfo: FileInfo, expected: LanguageAnalyzer) {
        // given & when
        val analyzer = LanguageAnalyzerFactory.createAnalyzer(fileInfo)

        // then
        assertThat(analyzer::class.java).isEqualTo(expected::class.java)
    }
}
