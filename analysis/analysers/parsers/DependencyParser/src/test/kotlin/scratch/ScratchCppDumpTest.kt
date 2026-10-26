package scratch

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.extractFrom
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.junit.jupiter.api.Test
import java.io.File

class ScratchCppDumpTest {
    @Test
    fun dump() {
        val out = System.getenv("CPP_DUMP_OUT") ?: return
        val reports = extractFrom("src/test/resources/analysis/contract/examples/cpp", SupportedLanguage.CPP)
        File(out).writeText(
            reports.flatMap { it.nodes }.sortedBy { it.physicalPath }.joinToString("\n") { node ->
                "${node.physicalPath} ${node.pathWithName.withDots()}\n" +
                    node.usedTypes.joinToString("\n") { "    $it ${it.usageSource}" }
            }
        )
    }
}
