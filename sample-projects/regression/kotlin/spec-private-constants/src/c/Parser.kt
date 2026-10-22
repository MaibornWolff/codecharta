package c

object Parser {
    private const val IDENTIFIER = "identifier"

    fun parse(text: String): String = text + IDENTIFIER
}
