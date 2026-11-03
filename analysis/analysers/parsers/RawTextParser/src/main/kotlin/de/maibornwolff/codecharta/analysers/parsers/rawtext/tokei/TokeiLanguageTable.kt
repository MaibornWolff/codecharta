package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.Delimiters
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax
import de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules.LanguageRules

object TokeiLanguageTable {
    private const val RESOURCE_PATH = "/tokei/languages.json"
    private val ESCAPED_CHARACTER = Regex("""\\(.)""")

    private val knownLanguages = loadKnownLanguages()
    private val syntaxByFileName = indexBy { it.filenames }
    private val syntaxByExtension = indexBy { it.extensions }

    fun syntaxFor(fileName: String): LanguageSyntax? {
        val lowerCaseName = fileName.lowercase()
        return syntaxByFileName[lowerCaseName]
            ?: extensionCandidates(lowerCaseName).firstNotNullOfOrNull { syntaxByExtension[it] }
    }

    private fun extensionCandidates(fileName: String): Sequence<String> = fileName
        .indices
        .asSequence()
        .filter { fileName[it] == '.' }
        .map { fileName.substring(it + 1) }

    private fun loadKnownLanguages(): Map<String, TokeiLanguage> {
        val json = checkNotNull(javaClass.getResource(RESOURCE_PATH)) { "Missing $RESOURCE_PATH" }.readText()
        return Gson()
            .fromJson(json, TokeiLanguageFile::class.java)
            .languages
            .filterValues { it.isLiterate != true }
    }

    private fun indexBy(names: (TokeiLanguage) -> List<String>?): Map<String, LanguageSyntax> {
        val index = mutableMapOf<String, LanguageSyntax>()
        knownLanguages.forEach { (tokeiName, language) ->
            val syntax = LanguageRules.applyTo(tokeiName, toSyntax(language))
            names(language).orEmpty().forEach { index.putIfAbsent(it.lowercase(), syntax) }
        }
        return index
    }

    private fun toSyntax(language: TokeiLanguage): LanguageSyntax {
        val blockComments = toDelimiters(language.blockComments)
        val nestedComments = toDelimiters(language.nestedComments)
        val isNested = language.isNested == true
        return LanguageSyntax(
            lineComments = language.lineComments.orEmpty().map(::unescape),
            blockComments = if (isNested) emptyList() else blockComments,
            nestedBlockComments = if (isNested) blockComments + nestedComments else nestedComments,
            quotes = toDelimiters(language.quotes),
            verbatimQuotes = toDelimiters(language.verbatimQuotes),
            docQuotes = toDelimiters(language.docQuotes)
        )
    }

    private fun toDelimiters(pairs: List<List<String>>?): List<Delimiters> = pairs.orEmpty().map { (start, end) ->
        Delimiters(unescape(start), unescape(end))
    }

    private fun unescape(text: String): String = ESCAPED_CHARACTER.replace(text) { it.groupValues[1] }

    private class TokeiLanguageFile(val languages: Map<String, TokeiLanguage>)

    private class TokeiLanguage(
        @SerializedName("line_comment") val lineComments: List<String>?,
        @SerializedName("multi_line_comments") val blockComments: List<List<String>>?,
        @SerializedName("nested") val isNested: Boolean?,
        @SerializedName("nested_comments") val nestedComments: List<List<String>>?,
        @SerializedName("quotes") val quotes: List<List<String>>?,
        @SerializedName("verbatim_quotes") val verbatimQuotes: List<List<String>>?,
        @SerializedName("doc_quotes") val docQuotes: List<List<String>>?,
        @SerializedName("literate") val isLiterate: Boolean?,
        @SerializedName("extensions") val extensions: List<String>?,
        @SerializedName("filenames") val filenames: List<String>?
    )
}
