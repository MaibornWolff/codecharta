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
    ERROR_SENTINEL,
};

#define MAX_TAG_LENGTH 32
#define MAX_BODY_DEPTH 8
#define MAX_DELIMITER_LENGTH 16
#define BYTE_ORDER_MARK 0xFEFF

typedef struct {
    char delimiter[MAX_DELIMITER_LENGTH + 1];
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

static bool consume_word(TSLexer *lexer, const char *word) {
    for (const char *letter = word; *letter; letter++) {
        if (towlower(lexer->lookahead) != *letter) return false;
        advance(lexer);
    }
    return true;
}

static void skip_horizontal_space(TSLexer *lexer) {
    while (is_horizontal_space(lexer->lookahead)) advance(lexer);
}

static void consume_rest_of_line(TSLexer *lexer) {
    while (!lexer->eof(lexer) && lexer->lookahead != '\n') advance(lexer);
}

static bool scan_batch_separator(TSLexer *lexer) {
    if (!consume_word(lexer, "go")) return false;
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

static bool scan_delimiter_directive(Scanner *scanner, TSLexer *lexer) {
    if (!consume_word(lexer, "delimiter")) return false;
    if (!is_horizontal_space(lexer->lookahead)) return false;
    skip_horizontal_space(lexer);
    char delimiter[MAX_DELIMITER_LENGTH + 1];
    size_t length = 0;
    while (!lexer->eof(lexer) && !iswspace(lexer->lookahead)) {
        if (length == MAX_DELIMITER_LENGTH) return false;
        delimiter[length++] = (char)lexer->lookahead;
        advance(lexer);
    }
    if (length == 0) return false;
    delimiter[length] = '\0';
    lexer->mark_end(lexer);
    bool is_default = length == 1 && delimiter[0] == ';';
    strcpy(scanner->delimiter, is_default ? "" : delimiter);
    lexer->result_symbol = DELIMITER_DIRECTIVE;
    return true;
}

static bool scan_custom_delimiter(Scanner *scanner, TSLexer *lexer) {
    for (const char *character = scanner->delimiter; *character; character++) {
        if (lexer->lookahead != *character) return false;
        advance(lexer);
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = CUSTOM_DELIMITER;
    return true;
}

static size_t read_word(TSLexer *lexer, char *word) {
    size_t length = 0;
    word[0] = '\0';
    if (!is_tag_start(lexer->lookahead)) return 0;
    while (is_tag_part(lexer->lookahead)) {
        if (length < MAX_TAG_LENGTH) word[length++] = (char)towlower(lexer->lookahead);
        advance(lexer);
    }
    word[length] = '\0';
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
    size_t delimiter_length = strlen(scanner->delimiter);
    if (delimiter_length != tag_length + 2) return false;
    return scanner->delimiter[0] == '$' && scanner->delimiter[delimiter_length - 1] == '$' &&
           strncmp(scanner->delimiter + 1, tag, tag_length) == 0;
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

static bool scan_dollar_quote(Scanner *scanner, TSLexer *lexer, const bool *valid_symbols, bool in_error_recovery) {
    advance(lexer);
    char tag[MAX_TAG_LENGTH + 1];
    size_t tag_length = read_word(lexer, tag);
    if (lexer->lookahead != '$') {
        bool is_directive = tag_length > 0 && tag_length < MAX_TAG_LENGTH && is_one_of(tag, COMPILATION_DIRECTIVES);
        return is_directive && scan_conditional_compilation(lexer, tag);
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

static bool closes_after_backslash(TSLexer *lexer, bool backslash_escapes) {
    advance(lexer);
    if (lexer->lookahead != '\'') {
        if (lexer->lookahead == '\\' || backslash_escapes) advance(lexer);
        return false;
    }
    advance(lexer);
    // \'' is a backslash before a doubled quote in T-SQL, the more common reading than MySQL's quote string '\''
    if (lexer->lookahead == '\'') {
        advance(lexer);
        return false;
    }
    return !backslash_escapes && may_follow_closing_quote(lexer);
}

// A string in single quotes, where '' is a quote. A backslash escapes only in MySQL and in PostgreSQL's E'...',
// while a T-SQL or Oracle string may end on it ('C:\'), so a backslash before a quote is told apart by what follows.
static bool scan_quoted_string(TSLexer *lexer) {
    int32_t prefix = towlower(lexer->lookahead);
    bool has_prefix = prefix == 'n' || prefix == 'e' || prefix == 'b' || prefix == 'x';
    if (has_prefix) advance(lexer);
    if (lexer->lookahead != '\'') return false;
    bool backslash_escapes = has_prefix && prefix == 'e';
    advance(lexer);
    while (!lexer->eof(lexer)) {
        if (lexer->lookahead == '\\') {
            if (closes_after_backslash(lexer, backslash_escapes)) break;
            continue;
        }
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

static bool may_start_quoted_string(int32_t character) {
    int32_t lower = towlower(character);
    return character == '\'' || lower == 'n' || lower == 'e' || lower == 'b' || lower == 'x';
}

static const char *const SQLPLUS_COMMANDS[] = {"prompt", "rem", "remark", NULL};
static const char *const SQLCMD_COMMANDS[] = {"r",    "setvar", "on",   "connect", "out",        "error",     "exit", "quit",
                                              "list", "reset",  "ed",   "help",    "serverlist", "perftrace", "xml",  "listvar",
                                              NULL};

// A command of the client running the script, alone on its line: SQL*Plus PROMPT and REM, SQLCMD :r, psql \connect.
static bool scan_client_command(TSLexer *lexer) {
    int32_t first = lexer->lookahead;
    bool is_psql_command = first == '\\';
    bool is_sqlcmd_command = first == ':';
    if (is_psql_command || is_sqlcmd_command) advance(lexer);
    char word[MAX_TAG_LENGTH + 1];
    size_t length = read_word(lexer, word);
    bool is_known = is_psql_command     ? length > 0 || lexer->lookahead == '.'
                    : is_sqlcmd_command ? is_one_of(word, SQLCMD_COMMANDS)
                                        : is_one_of(word, SQLPLUS_COMMANDS);
    if (!is_known) return false;
    if (!is_psql_command && !is_horizontal_space(lexer->lookahead) && !is_line_end(lexer)) return false;
    consume_rest_of_line(lexer);
    lexer->mark_end(lexer);
    lexer->result_symbol = CLIENT_COMMAND;
    return true;
}

static bool scan_line_start_token(Scanner *scanner, TSLexer *lexer, const bool *valid_symbols) {
    int32_t first = towlower(lexer->lookahead);
    if (first == 'g' && valid_symbols[BATCH_SEPARATOR]) return scan_batch_separator(lexer);
    if (first == '/' && valid_symbols[SLASH_TERMINATOR]) return scan_slash_terminator(lexer);
    if (first == 'd' && valid_symbols[DELIMITER_DIRECTIVE]) return scan_delimiter_directive(scanner, lexer);
    if (valid_symbols[CLIENT_COMMAND]) return scan_client_command(lexer);
    return false;
}

static bool may_start_line_token(int32_t character) {
    int32_t lower = towlower(character);
    return lower == 'g' || lower == '/' || lower == 'd' || lower == 'p' || lower == 'r' || lower == ':' || lower == '\\';
}

static bool scan(Scanner *scanner, TSLexer *lexer, const bool *valid_symbols) {
    bool in_error_recovery = valid_symbols[ERROR_SENTINEL];
    Gap gap = skip_whitespace(lexer);
    if (lexer->eof(lexer)) return false;
    int32_t first = lexer->lookahead;

    bool delimiter_starts_here = scanner->delimiter[0] != '\0' && scanner->delimiter[0] != '$' && first == scanner->delimiter[0];
    if (delimiter_starts_here && valid_symbols[CUSTOM_DELIMITER]) return scan_custom_delimiter(scanner, lexer);

    if (first == '$') return scan_dollar_quote(scanner, lexer, valid_symbols, in_error_recovery);
    if (may_start_quoted_string(first) && valid_symbols[QUOTED_STRING]) return scan_quoted_string(lexer);

    if (may_start_line_token(first) && is_at_line_start(lexer, gap)) return scan_line_start_token(scanner, lexer, valid_symbols);
    return false;
}

void *tree_sitter_sql_island_external_scanner_create(void) {
    Scanner *scanner = ts_calloc(1, sizeof(Scanner));
    return scanner;
}

void tree_sitter_sql_island_external_scanner_destroy(void *payload) { ts_free(payload); }

unsigned tree_sitter_sql_island_external_scanner_serialize(void *payload, char *buffer) {
    Scanner *scanner = (Scanner *)payload;
    unsigned size = 0;
    size_t delimiter_length = strlen(scanner->delimiter);
    buffer[size++] = (char)delimiter_length;
    memcpy(buffer + size, scanner->delimiter, delimiter_length);
    size += delimiter_length;
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
    size_t delimiter_length = (uint8_t)buffer[position++];
    memcpy(scanner->delimiter, buffer + position, delimiter_length);
    position += delimiter_length;
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
