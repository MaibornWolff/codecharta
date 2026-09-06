package de.maibornwolff.treesitter.excavationsite.languages.javascript

internal const val DEFAULT_EXPORT = "DEFAULT_EXPORT"
internal const val DEFAULT_KEYWORD = "default"

internal fun normalizeDefaultKeyword(name: String): String = if (name == DEFAULT_KEYWORD) DEFAULT_EXPORT else name

// Shared tree-sitter node-type constants used across JS/TS/TSX extractors
internal const val TYPE_IDENTIFIER = "type_identifier"
internal const val IDENTIFIER = "identifier"
internal const val STRING = "string"
internal const val CALL_EXPRESSION = "call_expression"
internal const val PROPERTY_IDENTIFIER = "property_identifier"
internal const val IMPORT_CLAUSE = "import_clause"
internal const val NAMESPACE_IMPORT = "namespace_import"
internal const val NAMED_IMPORTS = "named_imports"
internal const val IMPORT_SPECIFIER = "import_specifier"
internal const val EXPORT_CLAUSE = "export_clause"
internal const val EXPORT_SPECIFIER = "export_specifier"
internal const val VARIABLE_DECLARATOR = "variable_declarator"
internal const val OBJECT_PATTERN = "object_pattern"
internal const val ARRAY_PATTERN = "array_pattern"
internal const val SHORTHAND_PROPERTY_IDENTIFIER_PATTERN = "shorthand_property_identifier_pattern"
internal const val PAIR_PATTERN = "pair_pattern"
internal const val REQUIRE = "require"
internal const val IMPORT_STATEMENT = "import_statement"
internal const val EXPORT_STATEMENT = "export_statement"
internal const val DECORATOR = "decorator"
internal const val TYPE_ALIAS_DECLARATION = "type_alias_declaration"
