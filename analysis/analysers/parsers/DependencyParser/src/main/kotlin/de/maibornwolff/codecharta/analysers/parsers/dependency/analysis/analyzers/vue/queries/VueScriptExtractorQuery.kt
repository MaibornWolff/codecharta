package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.find
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSQuery

data class ScriptBlock(val content: String, val lang: String?, val isSetup: Boolean)

class VueScriptExtractorQuery(language: TSLanguage) {
    private val scriptElementQuery = TSQuery(language, "(script_element) @script")

    fun execute(rootNode: TSNode, fileBody: String): ScriptBlock? {
        val scriptMatches = rootNode.execute(scriptElementQuery)

        if (scriptMatches.isEmpty()) {
            return null
        }

        val scriptElement = scriptMatches
            .first()
            .captures
            .first()
            .node

        // Extract attributes from start tag
        val startTag = scriptElement.find("start_tag")
        var lang: String? = null
        var isSetup = false

        if (startTag != null) {
            for (i in 0 until startTag.childCount) {
                val child = startTag.getChild(i)
                if (child.type == "attribute") {
                    val nameNode = child.find("attribute_name")
                    val name = if (nameNode != null) nodeAsString(nameNode, fileBody) else null
                    when (name) {
                        "setup" -> isSetup = true
                        "lang" -> {
                            val valueNode = child.find("quoted_attribute_value")?.find("attribute_value")
                            lang = if (valueNode != null) nodeAsString(valueNode, fileBody) else null
                        }
                    }
                }
            }
        }

        // Extract script content (raw_text node)
        val rawText = scriptElement.find("raw_text")
        val content = if (rawText != null) nodeAsString(rawText, fileBody) else ""

        return ScriptBlock(
            content = content.trim(),
            lang = lang,
            isSetup = isSetup
        )
    }
}
