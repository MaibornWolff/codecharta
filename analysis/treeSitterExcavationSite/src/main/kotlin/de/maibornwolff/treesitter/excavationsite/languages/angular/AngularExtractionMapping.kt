package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.extractTemplateComment
import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.extractTemplateIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.extractUserFacingAttributeText
import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.joinTemplateText
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats
import de.maibornwolff.treesitter.excavationsite.shared.domain.TextRun

/**
 * Angular template extraction definitions: the identifiers of bindings, interpolations and control flow blocks,
 * HTML comments, and the text content, the user-facing attribute values and the string literals of the template.
 */
object AngularExtractionMapping : ExtractionMapping {
    override val nodeExtractions: Map<String, Extract> = buildMap {
        put(IDENTIFIER, Extract.Identifier(customSingle = ::extractTemplateIdentifier))

        put(COMMENT, Extract.Comment(custom = ::extractTemplateComment))

        put(ATTRIBUTE_VALUE, Extract.Text(::extractUserFacingAttributeText))
        put(STRING, Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
        put(TEMPLATE_STRING, Extract.StringLiteral(format = StringFormats.Template))
    }

    override val textRun = TextRun(setOf(TEXT, ENTITY), ::joinTemplateText)
}
