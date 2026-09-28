package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.extractDelphiComment
import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.extractDelphiDeclProcName
import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.extractDelphiDeclTypeName
import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.extractDelphiDefProcName
import de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors.extractDelphiMultipleNames
import de.maibornwolff.treesitter.excavationsite.shared.domain.Extract
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionMapping
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionStrategy
import de.maibornwolff.treesitter.excavationsite.shared.domain.StringFormats

/**
 * Delphi extraction definitions.
 *
 * tree-sitter-pascal uses camelCase node types. Pascal-specific comment styles
 * (`{ }` and `(* *)`) are handled by a custom extractor because the shared
 * AutoDetect format does not recognise them.
 */
object DelphiExtractionMapping : ExtractionMapping {
    private const val IDENTIFIER = "identifier"

    override val nodeExtractions: Map<String, Extract> = buildMap {
        // Type declarations (class / interface / record / enum / helper) carry the name on the parent declType.
        put("declType", Extract.Identifier(customSingle = ::extractDelphiDeclTypeName))

        // Procedure / function / method implementations carry the name on the nested declProc header.
        put("defProc", Extract.Identifier(customSingle = ::extractDelphiDefProcName))

        // Procedure / function / method declarations (forward decls, method signatures in classes/interfaces).
        put("declProc", Extract.Identifier(customSingle = ::extractDelphiDeclProcName))

        // Variables, fields, and parameters can declare multiple names at once: `var X, Y: Integer;`.
        put("declVar", Extract.Identifier(customMulti = ::extractDelphiMultipleNames))
        put("declField", Extract.Identifier(customMulti = ::extractDelphiMultipleNames))
        put("declArg", Extract.Identifier(customMulti = ::extractDelphiMultipleNames))

        // Generic type-parameter declarations carry one or more `[name]=identifier` children
        // (`<T, U>` is a single genericArg with two name children). Reuses the multi-name
        // extractor that already handles comma-separated identifier lists.
        put("genericArg", Extract.Identifier(customMulti = ::extractDelphiMultipleNames))

        // Constants — Pascal `declConst` carries exactly one identifier per node; multi-name
        // `const A = 1, B = 2;` is not legal Pascal and the AST splits them into siblings.
        put("declConst", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Property declarations — surface the property name (the first identifier child).
        // Mirrors Java/Kotlin/C#, which all surface property names as identifiers.
        put("declProp", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Enum values.
        put("declEnumValue", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Exception handler bound variable name (`on E: EError do ...` → `E`). The exception
        // type `EError` is a `typeref` descendant and is not captured here.
        put("exceptionHandler", Extract.Identifier(single = ExtractionStrategy.FirstChildByType(IDENTIFIER)))

        // Comments — Pascal has three styles (//, { }, (* *)); custom extractor strips all markers.
        put("comment", Extract.Comment(custom = ::extractDelphiComment))

        // String literals — Pascal strings use single quotes.
        put("literalString", Extract.StringLiteral(format = StringFormats.Quoted(stripSingleQuotes = true)))
    }
}
