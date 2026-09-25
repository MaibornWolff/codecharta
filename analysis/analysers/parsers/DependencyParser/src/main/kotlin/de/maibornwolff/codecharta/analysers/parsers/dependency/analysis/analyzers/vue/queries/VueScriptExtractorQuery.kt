package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.queries

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.execute
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.find
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.getChildren
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.nodeAsString
import org.treesitter.TSLanguage
import org.treesitter.TSNode
import org.treesitter.TSQuery

data class ScriptBlock(val content: String, val lang: String?, val isSetup: Boolean)

/** A single-file component may pair a plain `<script>` with a `<script setup>`; both blocks are returned. */
class VueScriptExtractorQuery(language: TSLanguage) {
    private val scriptElementQuery = TSQuery(language, "(script_element) @script")

    fun execute(rootNode: TSNode, fileBody: String): List<ScriptBlock> = rootNode
        .execute(scriptElementQuery)
        .mapNotNull { match -> match.captures.firstOrNull()?.node }
        .map { scriptElement -> toScriptBlock(scriptElement, fileBody) }

    private fun toScriptBlock(scriptElement: TSNode, fileBody: String): ScriptBlock {
        val attributes = scriptElement.find(START_TAG)?.getChildren().orEmpty().filter { it.type == ATTRIBUTE }
        val attributeValueByName = attributes.associate { attribute ->
            val name = attribute.find(ATTRIBUTE_NAME)?.let { nodeAsString(it, fileBody) }
            val value = attribute.find(QUOTED_ATTRIBUTE_VALUE)?.find(ATTRIBUTE_VALUE)?.let { nodeAsString(it, fileBody) }
            name to value
        }
        val content = scriptElement.find(RAW_TEXT)?.let { nodeAsString(it, fileBody) }.orEmpty()
        return ScriptBlock(
            content = content.trim(),
            lang = attributeValueByName[LANG_ATTRIBUTE],
            isSetup = SETUP_ATTRIBUTE in attributeValueByName
        )
    }

    companion object {
        private const val START_TAG = "start_tag"
        private const val ATTRIBUTE = "attribute"
        private const val ATTRIBUTE_NAME = "attribute_name"
        private const val QUOTED_ATTRIBUTE_VALUE = "quoted_attribute_value"
        private const val ATTRIBUTE_VALUE = "attribute_value"
        private const val RAW_TEXT = "raw_text"
        private const val LANG_ATTRIBUTE = "lang"
        private const val SETUP_ATTRIBUTE = "setup"
    }
}
