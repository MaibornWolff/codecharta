package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LineClassifier
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LineKind
import de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.TokeiLanguageTable
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class LanguageRulesTest {
    private val code = LineKind(hasCode = true, hasComment = false)
    private val comment = LineKind(hasCode = false, hasComment = true)
    private val codeAndComment = LineKind(hasCode = true, hasComment = true)
    private val blank = LineKind(hasCode = false, hasComment = false)

    private fun classifyAll(fileName: String, vararg lines: String): List<LineKind> {
        val classifier = LineClassifier(checkNotNull(TokeiLanguageTable.syntaxFor(fileName)))
        return lines.map { classifier.classify(it) }
    }

    @Test
    fun `should count every row of a shell heredoc as code including blank and hash rows`() {
        // Arrange
        val lines = arrayOf("cat << EOF", "Don't stop", "", "# text", "EOF", "# comment")

        // Act
        val kinds = classifyAll("run.sh", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, code, code, code, comment)
    }

    @Test
    fun `should end an indented quoted shell heredoc at its indented terminator`() {
        // Arrange
        val lines = arrayOf("cat <<-'END' | sort # sorted", "\tline", "\tEND", "echo done")

        // Act
        val kinds = classifyAll("run.bash", *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment, code, code, code)
    }

    @Test
    fun `should not open a heredoc for a shell here-string`() {
        // Arrange
        val lines = arrayOf("read -r word <<< \"\$text\"", "# comment")

        // Act
        val kinds = classifyAll("run.sh", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, comment)
    }

    @Test
    fun `should start a shell comment only at the start of a word`() {
        // Arrange
        val lines = arrayOf("name=\${path#*/}", "echo \$# args", "echo \\# not either", "ls;# comment")

        // Act
        val kinds = classifyAll("run.zsh", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, code, codeAndComment)
    }

    @Test
    fun `should not open a string at an escaped shell quote`() {
        // Arrange
        val lines = arrayOf("echo \\\"quoted", "# comment")

        // Act
        val kinds = classifyAll("run.ksh", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, comment)
    }

    @Test
    fun `should count every row of a ruby heredoc as code`() {
        // Arrange
        val lines = arrayOf("text = <<~TEXT", "  # not a comment", "  TEXT", "list <<item # comment")

        // Act
        val kinds = classifyAll("door.rb", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, code, codeAndComment)
    }

    @Test
    fun `should count a hash or quote inside a ruby regex literal as code`() {
        // Arrange
        val lines = arrayOf("match = text.match(/^#(?<iid>\\d+)\\z/)", "STRING = /\"(?:\\\\.|[^\"\\\\])*\"/", "# comment")

        // Act
        val kinds = classifyAll("finder.rb", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, comment)
    }

    @Test
    fun `should count an extended ruby regex as code across its lines`() {
        // Arrange
        val lines = arrayOf("IDENTIFIER = /", "  [[:alpha:]_] # first letter", "  [[:word:]]*  # more letters", "/x", "# comment")

        // Act
        val kinds = classifyAll("tracker.rb", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, code, code, comment)
    }

    @Test
    fun `should count a ruby percent literal as code across its lines`() {
        // Arrange
        val lines = arrayOf("@pattern ||= %r{", "  #{Regexp.escape(prefix)}(?<id>\\d+)", "}x", "html = %(<a href=\"#{url}\">)", "# comment")

        // Act
        val kinds = classifyAll("alert.rb", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, code, code, comment)
    }

    @Test
    fun `should open no ruby regex at a slash symbol`() {
        // Arrange
        val lines = arrayOf("super(:/, left, right)", "", "# comment")

        // Act
        val kinds = classifyAll("division.rb", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, blank, comment)
    }

    @Test
    fun `should count a ruby percent literal as the argument of a call without parentheses`() {
        // Arrange
        val lines = arrayOf("assert_equal %(<title></title>\\nHello\\n),", "  render(template: \"hello\")", "# comment")

        // Act
        val kinds = classifyAll("render_test.rb", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, comment)
    }

    @Test
    fun `should keep a ruby percent sign between values a remainder`() {
        // Arrange
        val lines = arrayOf("left = total % count # remainder", "# comment")

        // Act
        val kinds = classifyAll("math.rb", *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment, comment)
    }

    @Test
    fun `should count every row of a php heredoc and nowdoc as code`() {
        // Arrange
        val lines = arrayOf("\$a = <<<EOT", "  // not a comment", "  EOT;", "\$b = <<<'NOW'", "# text", "NOW;", "// comment")

        // Act
        val kinds = classifyAll("vault.php", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, code, code, code, code, comment)
    }

    @Test
    fun `should count a php attribute as code`() {
        // Arrange
        val lines = arrayOf("#[Transactional]", "# comment")

        // Act
        val kinds = classifyAll("Facade.php", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, comment)
    }

    @Test
    fun `should count a regex literal as code in javascript and typescript`() {
        // Arrange
        val lines = arrayOf("return /basilisk[/*]+/.test(text) || /[*/]\$/.test(text)", "const quote = /^([\"'])/", "// comment")

        // Act
        val javaScriptKinds = classifyAll("lair.js", *lines)
        val typeScriptKinds = classifyAll("lair.tsx", *lines)

        // Assert
        assertThat(javaScriptKinds).containsExactly(code, code, comment)
        assertThat(typeScriptKinds).containsExactly(code, code, comment)
    }

    @Test
    fun `should keep a slash after a value a division`() {
        // Arrange
        val lines = arrayOf("const half = total / 2 // comment", "const rate = (a) / (b) /* note */")

        // Act
        val kinds = classifyAll("math.ts", *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment, codeAndComment)
    }

    @Test
    fun `should count a pascal compiler directive as code`() {
        // Arrange
        val lines = arrayOf("{\$IFDEF FPC}", "(*\$MODE DELPHI*)", "{ comment }", "(* comment *)")

        // Act
        val kinds = classifyAll("Lair.pas", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, comment, comment)
    }

    @Test
    fun `should end a pascal string at the quote after a backslash`() {
        // Arrange
        val lines = arrayOf("if FLine[Run] = '\\' then", "{ comment }", "'{': BraceOpenProc;")

        // Act
        val kinds = classifyAll("Lair.pas", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, comment, code)
    }

    @Test
    fun `should end a sql string at the quote after a backslash`() {
        // Arrange
        val lines = arrayOf("SELECT '\\' AS delimiter; -- backslash", "-- comment")

        // Act
        val kinds = classifyAll("query.sql", *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment, comment)
    }

    @Test
    fun `should count a mysql hash comment but keep the postgres json operator as code`() {
        // Arrange
        val lines = arrayOf("# MySQL comment", "SELECT data #> '{a,b}' FROM t", "SELECT 1 -- comment")

        // Act
        val kinds = classifyAll("query.sql", *lines)

        // Assert
        assertThat(kinds).containsExactly(comment, code, codeAndComment)
    }

    @Test
    fun `should continue a c line comment that ends in a backslash on the next lines`() {
        // Arrange
        val lines = arrayOf("int a; // note \\", "int b; \\", "int c;", "int d;")

        // Act
        val cKinds = classifyAll("main.c", *lines)
        val objectiveCKinds = classifyAll("Main.m", *lines)

        // Assert
        assertThat(cKinds).containsExactly(codeAndComment, comment, comment, code)
        assertThat(objectiveCKinds).containsExactly(codeAndComment, comment, comment, code)
    }

    @Test
    fun `should count a go raw string in backticks as code`() {
        // Arrange
        val lines = arrayOf("query := `the lair map", "// not a comment", "/* nor this */ \\`", "// comment")

        // Act
        val kinds = classifyAll("lair.go", *lines)

        // Assert
        assertThat(kinds).containsExactly(code, code, code, comment)
    }

    @Test
    fun `should count a python docstring with a string prefix as comment`() {
        // Arrange
        val lines = arrayOf("    r\"\"\"Summons with \\d dice.\"\"\"", "    Rb'''bytes", "    '''", "pattern = r\"\"\"\\d\"\"\"")

        // Act
        val kinds = classifyAll("summon.py", *lines)

        // Assert
        assertThat(kinds).containsExactly(comment, comment, comment, code)
    }

    @Test
    fun `should count every line from ruby's data section marker on as code`() {
        // Arrange
        val lines = arrayOf("x = 1 # note", "__END__", "def phantom", "", "# data, not a comment")

        // Act
        val kinds = classifyAll("door.rb", *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment, code, code, code, code)
    }

    @Test
    fun `should count only the lines inside the first script block of a vue file`() {
        // Arrange
        val lines = arrayOf(
            "<template>",
            "  <div>{{ a }}</div> <!-- note -->",
            "</template>",
            "<script setup lang=\"ts\">",
            "// comment",
            "const quote = /[\"']/",
            "</script>",
            "<script>",
            "const b = 2",
            "</script>"
        )

        // Act
        val kinds = classifyAll("Card.vue", *lines)

        // Assert
        assertThat(kinds).containsExactly(blank, blank, blank, blank, comment, code, blank, blank, blank, blank)
    }

    @Test
    fun `should count nothing of a vue file whose first script block sits on one line`() {
        // Arrange
        val lines = arrayOf("<script src=\"./card.js\"></script>", "<script>", "const b = 2", "</script>")

        // Act
        val kinds = classifyAll("Card.vue", *lines)

        // Assert
        assertThat(kinds).containsExactly(blank, blank, blank, blank)
    }

    @Test
    fun `should leave languages without a rule as tokei describes them`() {
        // Arrange
        val lines = arrayOf("x = a # b", "", "# comment")

        // Act
        val kinds = classifyAll("script.py", *lines)

        // Assert
        assertThat(kinds).containsExactly(codeAndComment, blank, comment)
    }
}
