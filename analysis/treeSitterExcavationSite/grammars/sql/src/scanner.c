/*
 * External scanner of the SQL island grammar. It recognises what a regular expression cannot:
 *
 * - dollar quotes ($$ or $tag$) of PostgreSQL, opening and closing a routine body that is parsed as code, or
 *   holding a string; a body closes only on the tag it opened with
 * - the MySQL client's DELIMITER directive and the custom statement delimiter it sets
 * - the T-SQL batch separator GO and the SQL*Plus terminator /, each alone on its line
 * - commands of the client that runs a script (SQL*Plus PROMPT and REM, SQLCMD :r, psql \connect), skipped like
 *   comments
 * - the conditional compilation of PL/SQL ($if ... $then, $else, $end) and its inquiry directives ($$plsql_unit),
 *   skipped like comments so that the code of every branch is parsed
 * - a MySQL label glued to its colon (hunt:LOOP), which would otherwise read as a name and a bind variable
 */

#include "tree_sitter/alloc.h"
#include "tree_sitter/parser.h"

#include <string.h>
#include <wctype.h>

enum TokenType {
    DOLLAR_BODY_START,
    DOLLAR_BODY_END,
    DOLLAR_STRING,
    DELIMITER_DIRECTIVE,
    CUSTOM_DELIMITER,
    BATCH_SEPARATOR,
    SLASH_TERMINATOR,
    CLIENT_COMMAND,
    CONDITIONAL_COMPILATION,
    INQUIRY_DIRECTIVE,
    QUOTED_STRING,
    LABEL,
    ERROR_SENTINEL,
};

#define MAX_TAG_LENGTH 32
#define INVALID_TAG (-1)
#define MAX_BODY_DEPTH 8
#define MAX_DELIMITER_LENGTH 16
#define BYTE_ORDER_MARK 0xFEFF

// The delimiter holds code points, so that DELIMITER € closes on the euro sign and not on one of its bytes
typedef struct {
    int32_t delimiter[MAX_DELIMITER_LENGTH];
    uint8_t delimiter_length;
    uint8_t depth;
    char tags[MAX_BODY_DEPTH][MAX_TAG_LENGTH + 1];
} Scanner;

typedef struct {
    bool crossed_newline;
    bool skipped_any;
} Gap;

static void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static bool is_horizontal_space(int32_t character) { return character == ' ' || character == '\t' || character == '\r'; }

static bool is_line_end(TSLexer *lexer) { return lexer->eof(lexer) || lexer->lookahead == '\n' || lexer->lookahead == '\r'; }

static bool is_tag_start(int32_t character) { return iswalpha(character) || character == '_'; }

static bool is_tag_part(int32_t character) { return iswalnum(character) || character == '_'; }

static Gap skip_whitespace(TSLexer *lexer) {
    Gap gap = {false, false};
    while (iswspace(lexer->lookahead) || lexer->lookahead == BYTE_ORDER_MARK) {
        if (lexer->lookahead == '\n') gap.crossed_newline = true;
        gap.skipped_any = true;
        lexer->advance(lexer, true);
    }
    return gap;
}

// Only a token right at the start of the file needs the column, which is costly on a long line.
static bool is_at_line_start(TSLexer *lexer, Gap gap) {
    if (gap.crossed_newline) return true;
    if (gap.skipped_any) return false;
    return lexer->get_column(lexer) == 0;
}

static void skip_horizontal_space(TSLexer *lexer) {
    while (is_horizontal_space(lexer->lookahead)) advance(lexer);
}

static void consume_rest_of_line(TSLexer *lexer) {
    while (!lexer->eof(lexer) && lexer->lookahead != '\n') advance(lexer);
}

static bool finish_batch_separator(TSLexer *lexer) {
    lexer->mark_end(lexer);
    skip_horizontal_space(lexer);
    if (iswdigit(lexer->lookahead)) {
        while (iswdigit(lexer->lookahead)) advance(lexer);
        lexer->mark_end(lexer);
        skip_horizontal_space(lexer);
    }
    if (lexer->lookahead == ';') {
        advance(lexer);
        lexer->mark_end(lexer);
        skip_horizontal_space(lexer);
    }
    bool starts_comment = lexer->lookahead == '-';
    if (!is_line_end(lexer) && !starts_comment) return false;
    lexer->result_symbol = BATCH_SEPARATOR;
    return true;
}

static bool scan_slash_terminator(TSLexer *lexer) {
    advance(lexer);
    lexer->mark_end(lexer);
    skip_horizontal_space(lexer);
    if (!is_line_end(lexer)) return false;
    lexer->result_symbol = SLASH_TERMINATOR;
    return true;
}

static bool finish_delimiter_directive(Scanner *scanner, TSLexer *lexer) {
    if (!is_horizontal_space(lexer->lookahead)) return false;
    skip_horizontal_space(lexer);
    int32_t delimiter[MAX_DELIMITER_LENGTH];
    uint8_t length = 0;
    while (!lexer->eof(lexer) && !iswspace(lexer->lookahead)) {
        if (length == MAX_DELIMITER_LENGTH) return false;
        delimiter[length++] = lexer->lookahead;
        advance(lexer);
    }
    if (length == 0) return false;
    lexer->mark_end(lexer);
    bool is_default = length == 1 && delimiter[0] == ';';
    scanner->delimiter_length = is_default ? 0 : length;
    memcpy(scanner->delimiter, delimiter, sizeof(int32_t) * scanner->delimiter_length);
    lexer->result_symbol = DELIMITER_DIRECTIVE;
    return true;
}

static bool scan_custom_delimiter(Scanner *scanner, TSLexer *lexer) {
    for (uint8_t index = 0; index < scanner->delimiter_length; index++) {
        if (lexer->lookahead != scanner->delimiter[index]) return false;
        advance(lexer);
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = CUSTOM_DELIMITER;
    return true;
}

// A letter beyond ASCII never belongs to a word the scanner looks for; it is kept as a mark no keyword holds,
// so that gů does not read as go
#define NON_ASCII_MARK '\x01'

// Reads a word in lower case, keeping its first MAX_TAG_LENGTH letters, and returns how many letters it has
static size_t read_word(TSLexer *lexer, char *word) {
    size_t length = 0;
    size_t kept = 0;
    word[0] = '\0';
    if (!is_tag_start(lexer->lookahead)) return 0;
    while (is_tag_part(lexer->lookahead)) {
        int32_t letter = lexer->lookahead;
        if (kept < MAX_TAG_LENGTH) word[kept++] = letter < 0x80 ? (char)towlower(letter) : NON_ASCII_MARK;
        length++;
        advance(lexer);
    }
    word[kept] = '\0';
    return length;
}

static bool scan_dollar_string_content(TSLexer *lexer, const char *tag) {
    while (!lexer->eof(lexer)) {
        if (lexer->lookahead != '$') {
            advance(lexer);
            continue;
        }
        advance(lexer);
        const char *expected = tag;
        while (*expected && lexer->lookahead == *expected) {
            advance(lexer);
            expected++;
        }
        if (*expected == '\0' && lexer->lookahead == '$') {
            advance(lexer);
            break;
        }
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = DOLLAR_STRING;
    return true;
}

static bool is_custom_delimiter(Scanner *scanner, const char *tag) {
    size_t tag_length = strlen(tag);
    if (scanner->delimiter_length != tag_length + 2) return false;
    if (scanner->delimiter[0] != '$' || scanner->delimiter[tag_length + 1] != '$') return false;
    for (size_t index = 0; index < tag_length; index++) {
        if (scanner->delimiter[index + 1] != (unsigned char)tag[index]) return false;
    }
    return true;
}

static bool is_one_of(const char *word, const char *const *candidates) {
    for (const char *const *candidate = candidates; *candidate; candidate++) {
        if (strcmp(word, *candidate) == 0) return true;
    }
    return false;
}

static bool starts_with_one_of(const char *word, const char *const *candidates) {
    for (const char *const *candidate = candidates; *candidate; candidate++) {
        if (strncmp(word, *candidate, strlen(*candidate)) == 0) return true;
    }
    return false;
}

static const char *const COMPILATION_DIRECTIVES[] = {"if", "elsif", "else", "end", "then", "error", NULL};
static const char *const DIRECTIVES_WITH_CONDITION[] = {"if", "elsif", NULL};
static const char *const INQUIRY_DIRECTIVE_PREFIXES[] = {"plsql_", "plscope_", "nls_", "permit_", NULL};

// Skips $if or $elsif up to its $then, $error up to its $end, and a lone $else, $then or $end.
static bool scan_conditional_compilation(TSLexer *lexer, const char *directive) {
    const char *closing = is_one_of(directive, DIRECTIVES_WITH_CONDITION) ? "then" : strcmp(directive, "error") == 0 ? "end" : NULL;
    while (closing && !lexer->eof(lexer)) {
        if (lexer->lookahead != '$') {
            advance(lexer);
            continue;
        }
        advance(lexer);
        char word[MAX_TAG_LENGTH + 1];
        if (read_word(lexer, word) > 0 && strcmp(word, closing) == 0) break;
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = CONDITIONAL_COMPILATION;
    return true;
}

// $$plsql_unit and its kin are inquiry directives of PL/SQL; any other $$ before a name opens a PostgreSQL quote.
static bool scan_inquiry_directive(TSLexer *lexer) {
    char name[MAX_TAG_LENGTH + 1];
    read_word(lexer, name);
    if (!starts_with_one_of(name, INQUIRY_DIRECTIVE_PREFIXES)) return false;
    lexer->mark_end(lexer);
    lexer->result_symbol = INQUIRY_DIRECTIVE;
    return true;
}

static bool is_ascii_letter(int32_t character) { return (character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z'); }

static bool is_ascii_tag_part(int32_t character) { return is_ascii_letter(character) || iswdigit(character) || character == '_'; }

// The tag of a dollar quote as written, as PostgreSQL compares it exactly: $Q$ is closed by $Q$ only. A tag that is
// longer than the scanner keeps or holds a letter beyond ASCII opens no quote rather than a wrong one.
static int read_dollar_tag(TSLexer *lexer, char *tag) {
    int length = 0;
    tag[0] = '\0';
    if (!is_ascii_letter(lexer->lookahead) && lexer->lookahead != '_') return iswalpha(lexer->lookahead) ? INVALID_TAG : 0;
    while (is_ascii_tag_part(lexer->lookahead)) {
        if (length == MAX_TAG_LENGTH) return INVALID_TAG;
        tag[length++] = (char)lexer->lookahead;
        advance(lexer);
    }
    tag[length] = '\0';
    return iswalnum(lexer->lookahead) ? INVALID_TAG : length;
}

static void copy_lowercase(const char *text, char *lowercase) {
    size_t index = 0;
    for (; text[index]; index++) lowercase[index] = (char)towlower(text[index]);
    lowercase[index] = '\0';
}

static bool scan_dollar_quote(Scanner *scanner, TSLexer *lexer, const bool *valid_symbols, bool in_error_recovery) {
    advance(lexer);
    char tag[MAX_TAG_LENGTH + 1];
    int tag_length = read_dollar_tag(lexer, tag);
    if (tag_length == INVALID_TAG) return false;
    if (lexer->lookahead != '$') {
        char directive[MAX_TAG_LENGTH + 1];
        copy_lowercase(tag, directive);
        bool is_directive = tag_length > 0 && is_one_of(directive, COMPILATION_DIRECTIVES);
        return is_directive && scan_conditional_compilation(lexer, directive);
    }
    advance(lexer);
    lexer->mark_end(lexer);
    if (is_custom_delimiter(scanner, tag)) {
        lexer->result_symbol = CUSTOM_DELIMITER;
        return valid_symbols[CUSTOM_DELIMITER];
    }
    if (tag_length == 0 && is_tag_start(lexer->lookahead) && scan_inquiry_directive(lexer)) return true;
    bool closes_body = scanner->depth > 0 && strcmp(scanner->tags[scanner->depth - 1], tag) == 0;
    if (closes_body) {
        if (!valid_symbols[DOLLAR_BODY_END]) return false;
        scanner->depth--;
        lexer->result_symbol = DOLLAR_BODY_END;
        return true;
    }
    if (valid_symbols[DOLLAR_BODY_START] && !in_error_recovery && scanner->depth < MAX_BODY_DEPTH) {
        strcpy(scanner->tags[scanner->depth++], tag);
        lexer->result_symbol = DOLLAR_BODY_START;
        return true;
    }
    if (!valid_symbols[DOLLAR_STRING]) return false;
    return scan_dollar_string_content(lexer, tag);
}

// After a closing quote T-SQL goes on with a separator or an operator; MySQL escapes a quote inside a word: it\'s
static bool may_follow_closing_quote(TSLexer *lexer) {
    int32_t next = lexer->lookahead;
    return lexer->eof(lexer) || iswspace(next) || next == ',' || next == ')' || next == ';' || next == '+' || next == '|' ||
           next == '=' || next == '<' || next == '>';
}

static bool closes_after_backslash(TSLexer *lexer, bool backslash_escapes, bool starts_content) {
    advance(lexer);
    if (lexer->lookahead != '\'') {
        if (lexer->lookahead == '\\' || backslash_escapes) advance(lexer);
        return false;
    }
    advance(lexer);
    if (backslash_escapes) return false;
    if (lexer->lookahead != '\'') return may_follow_closing_quote(lexer);
    // MySQL's quote '\'' closes; inside a T-SQL string \'' is a backslash and a quote: CHARINDEX(''\'', ...)
    advance(lexer);
    return starts_content && may_follow_closing_quote(lexer);
}

// A string in single quotes, where '' is a quote. A backslash escapes only in MySQL and in PostgreSQL's E'...',
// while a T-SQL or Oracle string may end on it ('C:\'), so a backslash before a quote is told apart by what follows.
static bool scan_quoted_string(TSLexer *lexer, bool backslash_escapes) {
    advance(lexer);
    bool starts_content = true;
    while (!lexer->eof(lexer)) {
        if (lexer->lookahead == '\\') {
            if (closes_after_backslash(lexer, backslash_escapes, starts_content)) break;
            starts_content = false;
            continue;
        }
        starts_content = false;
        bool is_quote = lexer->lookahead == '\'';
        advance(lexer);
        if (!is_quote) continue;
        if (lexer->lookahead != '\'') break;
        advance(lexer);
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = QUOTED_STRING;
    return true;
}

static bool is_string_prefix(const char *word) {
    return strcmp(word, "n") == 0 || strcmp(word, "e") == 0 || strcmp(word, "b") == 0 || strcmp(word, "x") == 0;
}

static const char *const SQLPLUS_COMMANDS[] = {"prompt", "rem",     "remark", "spool",  "column", "define", "undefine",
                                               "whenever", "accept", "pause", "host", "ttitle", "btitle", "clear",
                                               "show",     "connect", "disconnect", NULL};
// SET is a statement of SQL too; only SQL*Plus sets these options
static const char *const SQLPLUS_SET_OPTIONS[] = {"serveroutput", "serverout", "linesize", "lines", "pagesize", "pages",
                                                  "verify",       "feedback",  "feed",     "echo",  "heading",  "termout",
                                                  "trimspool",    "trimout",   "timing",   "long",  "define",   "sqlblanklines",
                                                  "arraysize",    "colsep",    "newpage",  "wrap",  "numwidth", NULL};
static const char *const SQLCMD_COMMANDS[] = {"r",    "setvar", "on",   "connect", "out",        "error",     "exit", "quit",
                                              "list", "reset",  "ed",   "help",    "serverlist", "perftrace", "xml",  "listvar",
                                              NULL};

static bool finish_client_command(TSLexer *lexer) {
    consume_rest_of_line(lexer);
    lexer->mark_end(lexer);
    lexer->result_symbol = CLIENT_COMMAND;
    return true;
}

static void skip_single_quoted(TSLexer *lexer) {
    advance(lexer);
    while (!lexer->eof(lexer) && lexer->lookahead != '\'') advance(lexer);
    if (!lexer->eof(lexer)) advance(lexer);
}

// psql's \copy (SELECT ...) TO ... goes on over the lines its parentheses span
static bool finish_psql_copy(TSLexer *lexer) {
    int depth = 0;
    while (!lexer->eof(lexer) && (lexer->lookahead != '\n' || depth > 0)) {
        int32_t character = lexer->lookahead;
        if (character == '\'') {
            skip_single_quoted(lexer);
            continue;
        }
        if (character == '(') depth++;
        if (character == ')') depth--;
        advance(lexer);
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = CLIENT_COMMAND;
    return true;
}

// A command of SQLCMD (:r) or psql (\connect), alone on its line
static bool scan_prefixed_client_command(TSLexer *lexer) {
    bool is_psql_command = lexer->lookahead == '\\';
    advance(lexer);
    char word[MAX_TAG_LENGTH + 1];
    size_t length = read_word(lexer, word);
    if (is_psql_command && strcmp(word, "copy") == 0) return finish_psql_copy(lexer);
    bool is_known = is_psql_command ? length > 0 || lexer->lookahead == '.' : is_one_of(word, SQLCMD_COMMANDS);
    if (!is_known) return false;
    if (!is_psql_command && !is_horizontal_space(lexer->lookahead) && !is_line_end(lexer)) return false;
    return finish_client_command(lexer);
}

// SQL*Plus runs another script with @file or @@file
static bool scan_script_call(TSLexer *lexer) {
    advance(lexer);
    if (lexer->lookahead == '@') advance(lexer);
    if (iswspace(lexer->lookahead) || lexer->eof(lexer)) return false;
    return finish_client_command(lexer);
}

static bool scan_line_start_symbol(TSLexer *lexer, const bool *valid_symbols) {
    if (lexer->lookahead == '/') return valid_symbols[SLASH_TERMINATOR] && scan_slash_terminator(lexer);
    if (!valid_symbols[CLIENT_COMMAND]) return false;
    return lexer->lookahead == '@' ? scan_script_call(lexer) : scan_prefixed_client_command(lexer);
}

static const char *const LABELLED_STATEMENTS[] = {"begin", "loop", "repeat", "while", NULL};

// hunt:LOOP; a colon before another colon or an equals sign is a cast (x::int) or an assignment (x:=1)
static bool finish_label(TSLexer *lexer) {
    advance(lexer);
    if (lexer->lookahead == ':' || lexer->lookahead == '=') return false;
    lexer->mark_end(lexer);
    while (iswspace(lexer->lookahead)) advance(lexer);
    char statement[MAX_TAG_LENGTH + 1];
    read_word(lexer, statement);
    if (!is_one_of(statement, LABELLED_STATEMENTS)) return false;
    lexer->result_symbol = LABEL;
    return true;
}

static bool ends_word(TSLexer *lexer) { return is_horizontal_space(lexer->lookahead) || is_line_end(lexer); }

// SET SERVEROUTPUT ON is SQL*Plus's, SET NOCOUNT ON a statement
static bool finish_sqlplus_set(TSLexer *lexer) {
    if (!is_horizontal_space(lexer->lookahead)) return false;
    skip_horizontal_space(lexer);
    char option[MAX_TAG_LENGTH + 1];
    read_word(lexer, option);
    return is_one_of(option, SQLPLUS_SET_OPTIONS) && finish_client_command(lexer);
}

static bool scan_client_word(TSLexer *lexer, const char *word) {
    if (strcmp(word, "set") == 0) return finish_sqlplus_set(lexer);
    return is_one_of(word, SQLPLUS_COMMANDS) && ends_word(lexer) && finish_client_command(lexer);
}

// Only a word that may be a command needs to know whether it starts its line, which is costly to find out on a long line
static bool starts_line(TSLexer *lexer, Gap gap, size_t word_length) {
    if (gap.crossed_newline) return true;
    if (gap.skipped_any) return false;
    return lexer->get_column(lexer) == word_length;
}

// Tokens that start with a word: N'...', and at the start of a line GO, DELIMITER and SQL*Plus commands; labels
static bool scan_word_led_token(Scanner *scanner, TSLexer *lexer, const bool *valid_symbols, Gap gap) {
    char word[MAX_TAG_LENGTH + 1];
    size_t length = read_word(lexer, word);
    if (lexer->lookahead == '\'' && is_string_prefix(word)) {
        return valid_symbols[QUOTED_STRING] && scan_quoted_string(lexer, strcmp(word, "e") == 0);
    }
    bool is_go = strcmp(word, "go") == 0 && valid_symbols[BATCH_SEPARATOR];
    bool is_delimiter = strcmp(word, "delimiter") == 0 && valid_symbols[DELIMITER_DIRECTIVE];
    bool may_be_command = is_go || is_delimiter || valid_symbols[CLIENT_COMMAND];
    if (may_be_command && starts_line(lexer, gap, length)) {
        if (is_go) return finish_batch_separator(lexer);
        if (is_delimiter) return finish_delimiter_directive(scanner, lexer);
        if (scan_client_word(lexer, word)) return true;
    }
    return lexer->lookahead == ':' && valid_symbols[LABEL] && finish_label(lexer);
}

// Only these may start a token that must stand at the start of its line and does not start with a word
static bool may_start_line_symbol(int32_t character) {
    return character == '/' || character == ':' || character == '\\' || character == '@';
}

static bool scan(Scanner *scanner, TSLexer *lexer, const bool *valid_symbols) {
    bool in_error_recovery = valid_symbols[ERROR_SENTINEL];
    Gap gap = skip_whitespace(lexer);
    if (lexer->eof(lexer)) return false;
    int32_t first = lexer->lookahead;

    bool delimiter_starts_here = scanner->delimiter_length > 0 && scanner->delimiter[0] != '$' && first == scanner->delimiter[0];
    if (delimiter_starts_here && valid_symbols[CUSTOM_DELIMITER]) return scan_custom_delimiter(scanner, lexer);

    if (first == '$') return scan_dollar_quote(scanner, lexer, valid_symbols, in_error_recovery);
    if (first == '\'') return valid_symbols[QUOTED_STRING] && scan_quoted_string(lexer, false);

    if (is_tag_start(first)) return scan_word_led_token(scanner, lexer, valid_symbols, gap);
    bool may_be_symbol = valid_symbols[CLIENT_COMMAND] || valid_symbols[SLASH_TERMINATOR];
    return may_start_line_symbol(first) && may_be_symbol && is_at_line_start(lexer, gap) && scan_line_start_symbol(lexer, valid_symbols);
}

void *tree_sitter_sql_island_external_scanner_create(void) {
    Scanner *scanner = ts_calloc(1, sizeof(Scanner));
    return scanner;
}

void tree_sitter_sql_island_external_scanner_destroy(void *payload) { ts_free(payload); }

unsigned tree_sitter_sql_island_external_scanner_serialize(void *payload, char *buffer) {
    Scanner *scanner = (Scanner *)payload;
    unsigned size = 0;
    size_t delimiter_size = sizeof(int32_t) * scanner->delimiter_length;
    buffer[size++] = (char)scanner->delimiter_length;
    memcpy(buffer + size, scanner->delimiter, delimiter_size);
    size += delimiter_size;
    buffer[size++] = (char)scanner->depth;
    for (uint8_t level = 0; level < scanner->depth; level++) {
        size_t tag_length = strlen(scanner->tags[level]);
        buffer[size++] = (char)tag_length;
        memcpy(buffer + size, scanner->tags[level], tag_length);
        size += tag_length;
    }
    return size;
}

void tree_sitter_sql_island_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
    Scanner *scanner = (Scanner *)payload;
    memset(scanner, 0, sizeof(Scanner));
    if (length == 0) return;
    unsigned position = 0;
    scanner->delimiter_length = (uint8_t)buffer[position++];
    size_t delimiter_size = sizeof(int32_t) * scanner->delimiter_length;
    memcpy(scanner->delimiter, buffer + position, delimiter_size);
    position += delimiter_size;
    scanner->depth = (uint8_t)buffer[position++];
    for (uint8_t level = 0; level < scanner->depth; level++) {
        size_t tag_length = (uint8_t)buffer[position++];
        memcpy(scanner->tags[level], buffer + position, tag_length);
        position += tag_length;
    }
}

bool tree_sitter_sql_island_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    return scan((Scanner *)payload, lexer, valid_symbols);
}
