package c

private const val IDENTIFIER = "identifier"

fun extractAll(text: String): List<String> = listOf(Parser.parse(text), extractOne(text), IDENTIFIER)
