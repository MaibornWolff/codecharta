package de.maibornwolff.treesitter.excavationsite.languages.bash

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterExtraction
import de.maibornwolff.treesitter.excavationsite.shared.domain.ExtractionContext
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class BashExtractionTest {
    // === Function Definition Identifier Tests ===

    @Test
    fun `should extract function definition identifier - POSIX style`() {
        // Arrange
        val code = """
            process_order() {
                echo "Processing"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("process_order")
    }

    @Test
    fun `should extract function definition identifier - bash style`() {
        // Arrange
        val code = """
            function process_order {
                echo "Processing"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("process_order")
    }

    @Test
    fun `should extract function definition identifier - mixed style`() {
        // Arrange
        val code = """
            function process_order() {
                echo "Processing"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("process_order")
    }

    @Test
    fun `should extract multiple function definitions`() {
        // Arrange
        val code = """
            process_order() {
                echo "Processing"
            }

            validate_input() {
                echo "Validating"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("process_order", "validate_input")
    }

    // === Variable Assignment Identifier Tests ===

    @Test
    fun `should extract simple variable assignment`() {
        // Arrange
        val code = "order_count=10"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("order_count")
    }

    @Test
    fun `should extract exported variable assignment`() {
        // Arrange
        val code = "export API_KEY=\"secret\""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("API_KEY")
    }

    @Test
    fun `should extract readonly variable assignment`() {
        // Arrange
        val code = "readonly MAX_RETRIES=3"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("MAX_RETRIES")
    }

    @Test
    fun `should extract local variable assignment`() {
        // Arrange
        val code = """
            function foo() {
                local customer_name="John"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("foo", "customer_name")
    }

    @Test
    fun `should extract declare variable assignment`() {
        // Arrange
        val code = """
            function bar() {
                declare -i count=0
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("bar", "count")
    }

    @Test
    fun `should extract array variable assignment`() {
        // Arrange
        val code = "orders=(order1 order2 order3)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("orders")
    }

    @Test
    fun `should extract variable from command substitution`() {
        // Arrange
        val code = "current_date=\$(date +%Y-%m-%d)"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("current_date")
    }

    @Test
    fun `should extract multiple variable assignments`() {
        // Arrange
        val code = """
            DATABASE_URL="postgres://localhost"
            LOG_LEVEL="debug"
            MAX_CONNECTIONS=100
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("DATABASE_URL", "LOG_LEVEL", "MAX_CONNECTIONS")
    }

    @Test
    fun `should extract identifiers from complex script`() {
        // Arrange
        val code = """
            #!/bin/bash

            # Configuration
            APP_NAME="myapp"
            MAX_RETRIES=3

            process_order() {
                local order_id="$1"
                echo "Processing order"
            }

            function validate_input {
                local input="$1"
                return 0
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "APP_NAME",
            "MAX_RETRIES",
            "process_order",
            "order_id",
            "validate_input",
            "input"
        )
    }

    @Test
    fun `should handle empty source code`() {
        // Arrange
        val code = ""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).isEmpty()
        assertThat(result.comments).isEmpty()
        assertThat(result.strings).isEmpty()
    }

    // === Comment Extraction Tests ===

    @Test
    fun `should extract single line comment`() {
        // Arrange
        val code = """
            # This is a comment
            order_count=10
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.comments).containsExactly("This is a comment")
    }

    @Test
    fun `should extract multiple comments`() {
        // Arrange
        val code = """
            # First comment
            order_count=10
            # Second comment
            max_retries=3
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.comments).containsExactly("First comment", "Second comment")
    }

    @Test
    fun `should extract shebang as comment`() {
        // Arrange
        val code = """
            #!/bin/bash
            echo "Hello"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.comments).containsExactly("!/bin/bash")
    }

    @Test
    fun `should extract inline comment`() {
        // Arrange
        val code = "order_count=10 # inline comment"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.comments).containsExactly("inline comment")
    }

    // === String Extraction Tests ===

    @Test
    fun `should extract double quoted string`() {
        // Arrange
        val code = "message=\"Hello World\""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract single quoted string`() {
        // Arrange
        val code = "message='Hello World'"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.strings).containsExactly("Hello World")
    }

    @Test
    fun `should extract heredoc string`() {
        // Arrange
        val code = """
            cat <<EOF
            This is a heredoc
            with multiple lines
            EOF
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.strings).containsExactly("This is a heredoc\nwith multiple lines")
    }

    @Test
    fun `should extract multiple strings`() {
        // Arrange
        val code = """
            first="Hello"
            second='World'
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.strings).containsExactly("Hello", "World")
    }

    @Test
    fun `should extract string from echo command`() {
        // Arrange
        val code = "echo \"Processing order\""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.strings).containsExactly("Processing order")
    }

    // === ExtractionResult Tests ===

    @Test
    fun `should correctly categorize extracted items by context`() {
        // Arrange
        val code = """
            # Configuration script
            APP_NAME="myapp"

            process() {
                echo "processing"
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("APP_NAME", "process")
        assertThat(result.comments).containsExactly("Configuration script")
        assertThat(result.strings).containsExactly("myapp", "processing")
    }

    @Test
    fun `should provide access via extractedTexts list`() {
        // Arrange
        val code = """
            # Comment
            name="value"
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.extractedTexts.map { it.context }).containsExactly(
            ExtractionContext.COMMENT,
            ExtractionContext.IDENTIFIER,
            ExtractionContext.STRING
        )
    }

    // === API Tests ===

    @Test
    fun `should report extraction is supported for Bash`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.BASH)).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".sh")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".bash")).isTrue()
    }

    @Test
    fun `should return Bash in supported languages`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(Language.BASH)).isTrue()
    }

    @Test
    fun `should return sh and bash in supported extensions`() {
        // Act & Assert
        assertThat(TreeSitterExtraction.isExtractionSupported(".sh")).isTrue()
        assertThat(TreeSitterExtraction.isExtractionSupported(".bash")).isTrue()
    }

    // === For Loop Variable Tests ===

    @Test
    fun `should extract for loop variable`() {
        // Arrange
        val code = """
            for item in "${"$"}{items[@]}"; do
                echo "${"$"}item"
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("item")
    }

    @Test
    fun `should extract for loop variable with list`() {
        // Arrange
        val code = """
            for i in 1 2 3 4 5; do
                echo ${"$"}i
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("i")
    }

    @Test
    fun `should extract multiple for loop variables`() {
        // Arrange
        val code = """
            for file in *.txt; do
                echo ${"$"}file
            done

            for dir in */; do
                echo ${"$"}dir
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("file", "dir")
    }

    @Test
    fun `should extract for loop variable with function`() {
        // Arrange
        val code = """
            process_items() {
                for item in "${"$"}@"; do
                    process "${"$"}item"
                done
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("process_items", "item")
    }

    // === Select Loop Variable Tests ===

    @Test
    fun `should extract select loop variable`() {
        // Arrange
        val code = """
            select option in "Option 1" "Option 2" "Quit"; do
                case ${"$"}option in
                    "Quit") break;;
                esac
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("option")
    }

    @Test
    fun `should extract select loop variable with function`() {
        // Arrange
        val code = """
            show_menu() {
                select choice in "Start" "Stop" "Exit"; do
                    handle_choice "${"$"}choice"
                done
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("show_menu", "choice")
    }

    // === C-Style For Loop Variable Tests ===

    @Test
    fun `should extract c-style for loop variable`() {
        // Arrange
        val code = """
            for ((i=0; i<10; i++)); do
                echo ${"$"}i
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("i")
    }

    @Test
    fun `should extract c-style for loop with function`() {
        // Arrange
        val code = """
            count_down() {
                for ((n=10; n>0; n--)); do
                    echo ${"$"}n
                done
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("count_down", "n")
    }

    // === Alias Definition Tests ===

    @Test
    fun `should extract alias name`() {
        // Arrange
        val code = "alias ll='ls -la'"

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("ll")
    }

    @Test
    fun `should extract multiple aliases`() {
        // Arrange
        val code = """
            alias ll='ls -la'
            alias grep='grep --color=auto'
            alias cls='clear'
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("ll", "grep", "cls")
    }

    @Test
    fun `should extract alias with double quotes`() {
        // Arrange
        val code = """alias mygrep="grep --color=always""""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("mygrep")
    }

    // === Complex Script Tests ===

    @Test
    fun `should extract identifiers from script with loops and aliases`() {
        // Arrange
        val code = """
            #!/bin/bash

            # Configuration
            MAX_ITEMS=100

            alias ll='ls -la'

            process_files() {
                for file in *.txt; do
                    local content=""
                    cat "${"$"}file"
                done
            }

            for ((i=0; i<MAX_ITEMS; i++)); do
                process_files
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "MAX_ITEMS",
            "ll",
            "process_files",
            "file",
            "content",
            "i"
        )
    }

    // === Edge Case Tests ===

    @Test
    fun `should extract nested for loop variables`() {
        // Arrange
        val code = """
            for outer in 1 2 3; do
                for inner in a b c; do
                    echo "${"$"}outer ${"$"}inner"
                done
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("outer", "inner")
    }

    @Test
    fun `should extract for loop variable with command substitution list`() {
        // Arrange
        val code = """
            for file in ${"$"}(ls *.txt); do
                process "${"$"}file"
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("file")
    }

    @Test
    fun `should extract for loop variable with brace expansion`() {
        // Arrange
        val code = """
            for num in {1..10}; do
                echo ${"$"}num
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("num")
    }

    @Test
    fun `should handle for loop with empty body`() {
        // Arrange
        val code = """
            for item in a b c; do
                :
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("item")
    }

    @Test
    fun `should extract select inside function with local variable`() {
        // Arrange
        val code = """
            menu() {
                local prompt="Choose: "
                select opt in "Yes" "No"; do
                    echo "${"$"}opt"
                    break
                done
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("menu", "prompt", "opt")
    }

    @Test
    fun `should extract c-style for loop with multiple variables`() {
        // Arrange - only first variable in initialization is captured
        val code = """
            for ((i=0, j=10; i<j; i++, j--)); do
                echo "${"$"}i ${"$"}j"
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("i", "j")
    }

    @Test
    fun `should not extract from non-alias commands`() {
        // Arrange
        val code = """
            echo "hello"
            ls -la
            grep pattern file.txt
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).isEmpty()
    }

    @Test
    fun `should not extract from unalias command`() {
        // Arrange
        val code = """
            alias ll='ls -la'
            unalias ll
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("ll")
    }

    @Test
    fun `should extract alias with complex value`() {
        // Arrange
        val code = """alias gitlog='git log --oneline --graph --decorate'"""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("gitlog")
    }

    @Test
    fun `should extract alias with equals in value`() {
        // Arrange
        val code = """alias mygrep='grep --color=always'"""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("mygrep")
    }

    @Test
    fun `should handle mixed loop types in same function`() {
        // Arrange
        val code = """
            process_all() {
                for file in *.txt; do
                    echo "${"$"}file"
                done

                select action in "process" "skip"; do
                    echo "${"$"}action"
                    break
                done

                for ((count=0; count<5; count++)); do
                    echo "${"$"}count"
                done
            }
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("process_all", "file", "action", "count")
    }

    @Test
    fun `should extract loop variable with underscore prefix`() {
        // Arrange
        val code = """
            for _item in list; do
                echo "${"$"}_item"
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("_item")
    }

    @Test
    fun `should extract loop variable with numbers`() {
        // Arrange
        val code = """
            for item1 in a b c; do
                echo "${"$"}item1"
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("item1")
    }

    @Test
    fun `should handle deeply nested loops`() {
        // Arrange
        val code = """
            for a in 1 2; do
                for b in 3 4; do
                    for c in 5 6; do
                        echo "${"$"}a ${"$"}b ${"$"}c"
                    done
                done
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("a", "b", "c")
    }

    @Test
    fun `should extract from while loop with variable assignment inside`() {
        // Arrange
        val code = """
            while read line; do
                local processed="done"
                echo "${"$"}line"
            done < file.txt
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("processed")
    }

    @Test
    fun `should handle script with all extraction types`() {
        // Arrange
        val code = """
            #!/bin/bash
            # Script configuration

            CONFIG_FILE="config.txt"
            readonly VERSION=1

            alias la='ls -la'
            alias ll='ls -l'

            setup() {
                local temp_dir="/tmp"
                export PATH="${"$"}PATH:/usr/local/bin"
            }

            process() {
                for item in "${"$"}@"; do
                    echo "Processing ${"$"}item"
                done
            }

            menu() {
                select choice in "Start" "Stop"; do
                    case ${"$"}choice in
                        "Start") process;;
                        "Stop") break;;
                    esac
                done
            }

            for ((i=0; i<10; i++)); do
                process "${"$"}i"
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly(
            "CONFIG_FILE",
            "VERSION",
            "la",
            "ll",
            "setup",
            "temp_dir",
            "PATH",
            "process",
            "item",
            "menu",
            "choice",
            "i"
        )
        assertThat(result.comments).containsExactly("!/bin/bash", "Script configuration")
        assertThat(result.strings).containsExactly(
            "config.txt",
            "ls -la",
            "ls -l",
            "/tmp",
            "\$PATH:/usr/local/bin",
            "\$@",
            "Processing \$item",
            "Start",
            "Stop",
            "Start",
            "Stop",
            "\$i"
        )
    }

    @Test
    fun `should not extract variable from arithmetic expansion`() {
        // Arrange - variable references in $(( )) are not declarations
        val code = """
            count=5
            result=${"$"}((count + 1))
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("count", "result")
    }

    @Test
    fun `should handle single line for loop`() {
        // Arrange
        val code = """for x in 1 2 3; do echo ${"$"}x; done"""

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("x")
    }

    @Test
    fun `should handle for loop with quoted items`() {
        // Arrange
        val code = """
            for name in "John Doe" "Jane Smith"; do
                echo "${"$"}name"
            done
        """.trimIndent()

        // Act
        val result = TreeSitterExtraction.extract(code, Language.BASH)

        // Assert
        assertThat(result.identifiers).containsExactly("name")
        assertThat(result.strings).containsExactly("John Doe", "Jane Smith", "\$name")
    }
}
