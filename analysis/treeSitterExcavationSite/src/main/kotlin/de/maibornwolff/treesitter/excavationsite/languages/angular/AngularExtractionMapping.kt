package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.extractTemplateComment
import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.extractTemplateIdentifier
import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.extractUserFacingAttributeText
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Angular template extraction definitions: the identifiers of bindings, interpolations and control flow blocks,
 * HTML comments, and the text content, the user-facing attribute values and the string literals of the template.
 */
object AngularExtractionMapping : ExtractionMapping {
    override val nodeExtractions: Map<String, Extract> = buildMap {
        put("identifier", Extract.Identifier(customSingle = ::extractTemplateIdentifier))

        put("comment", Extract.Comment(custom = ::extractTemplateComment))

        put("text", Extract.StringLiteral(format = StringFormats.Trimmed))
        put("attribute_value", Extract.StringLiteral(custom = ::extractUserFacingAttributeText))
        put("string", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
        put("template_string", Extract.StringLiteral(format = StringFormats.Template))
    }
}
