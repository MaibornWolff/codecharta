package de.maibornwolff.treesitter.excavationsite.languages.angular

import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.extractTemplateComment
import de.maibornwolff.treesitter.excavationsite.languages.angular.extractors.extractTemplateIdentifier
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Angular template extraction definitions: the identifiers of bindings, interpolations and control flow blocks,
 * HTML comments, and the text content and string literals of the template. Plain attribute values are left out.
 */
object AngularExtractionMapping : ExtractionMapping {
    override val nodeExtractions: Map<String, Extract> = buildMap {
        put("identifier", Extract.Identifier(customSingle = ::extractTemplateIdentifier))

        put("comment", Extract.Comment(custom = ::extractTemplateComment))

        put("text", Extract.StringLiteral(format = StringFormats.Trimmed))
        put("string", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
        put("template_string", Extract.StringLiteral(format = StringFormats.Template))
    }
}
