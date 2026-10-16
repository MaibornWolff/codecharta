/**
 * @file An island grammar for SQL of all common dialects (ANSI, T-SQL, PL/SQL, PL/pgSQL, MySQL).
 *
 * Exact for what CodeCharta counts: routines with their bodies and parameters, control flow, exception handlers,
 * logical operators, comments, the objects a statement reads or writes, and the objects a script creates. Every
 * other token is accepted as an opaque item, so an unknown statement parses without an ERROR node.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
    flatFallback: -1,
    structure: 1,
    preferredStructure: 2
}

function caseInsensitive(word) {
    const letters = word.split("").map(letter => (/[a-z]/i.test(letter) ? `[${letter.toLowerCase()}${letter.toUpperCase()}]` : letter))
    return new RegExp(letters.join(""))
}

function kw(word) {
    return alias(caseInsensitive(word), word.toUpperCase())
}

function commaSeparated1(rule) {
    return seq(rule, repeat(seq(",", rule)))
}

function escapeForRegExp(text) {
    return text.replace(/[\\^$.*+?()[\]{}|/-]/g, "\\$&")
}

// Oracle's q'[...]' literal: the quote closes only right after the closing delimiter.
function oracleQuotedString(open, close) {
    const start = escapeForRegExp(open)
    const end = escapeForRegExp(close)
    return new RegExp(`[nN]?[qQ]'${start}([^${end}]|${end}[^'])*${end}'`)
}

const ORACLE_QUOTE_DELIMITERS = [
    ["[", "]"],
    ["{", "}"],
    ["(", ")"],
    ["<", ">"],
    ...["!", "|", "/", "#", "~", "^", "@", "%", "+", "*", "=", ":", ";", ",", ".", '"', "$", "&", "-"].map(same => [same, same])
]

const ROUTINE_KINDS = ["procedure", "proc", "function", "trigger"]

// Keywords that close a FROM list, so that none of them is taken for the alias of a table.
const CLAUSE_KEYWORDS = ["where", "group", "order", "having", "union", "intersect", "limit", "values"]

const TRANSACTION_WORDS = ["transaction", "tran", "work", "distributed", "dialog", "conversation", "isolation"]

module.exports = grammar({
    name: "sql_island",

    word: $ => $.identifier,

    externals: $ => [
        $._dollar_body_start,
        $._dollar_body_end,
        $.dollar_string,
        $.delimiter_directive,
        $.custom_delimiter,
        $.batch_separator,
        $.slash_terminator,
        $.client_command,
        $.conditional_compilation,
        $.inquiry_directive,
        $._quoted_string,
        $._error_sentinel
    ],

    extras: $ => [/[\s\uFEFF\u00A0]+/, $.comment, $.template_tag, $.client_command, $.conditional_compilation, $.inquiry_directive],

    conflicts: $ => [
        [$.block, $._begin_semicolon_transaction],
        [$._from_list],
        [$._reference_clause, $._loop_join_hint],
        [$.for_statement, $._for_flat],
        [$._for_flat],
        [$.common_table_expression, $._with_flat],
        [$._with_flat]
    ],

    rules: {
        source_file: $ => repeat($._top_item),

        _top_item: $ =>
            choice(
                $._statement_item,
                $.batch_separator,
                $.custom_delimiter,
                $.delimiter_directive,
                $.slash_terminator,
                kw("end"),
                kw("else")
            ),

        // Items of a statement sequence: the body of a block, a branch, a loop or a dollar-quoted routine body.
        _statement_item: $ =>
            choice(
                $._soup_item,
                ";",
                $.block,
                $.routine_definition,
                $.routine_declaration,
                $.package_definition,
                $.view_definition,
                $._view_alteration,
                $.table_definition,
                $.synonym_definition,
                $._create_other
            ),

        // Everything a statement can hold except its terminator and a bare block.
        _soup_item: $ => choice($._control_item, $._flat_branch_keyword),

        _flat_branch_keyword: $ => choice($._when_flat, $._then_flat, $._do_flat, $._exception_flat),

        _control_item: $ => choice($._begin_item, $._control_item_not_beginning_with_begin),

        _begin_item: $ => choice($.try_block, $.catch_block, $._begin_transaction, $._begin_semicolon_transaction),

        // A declaration section can not hold them, so its BEGIN always opens the body.
        _control_item_not_beginning_with_begin: $ =>
            choice(
                $._expression_item,
                $.if_statement,
                $._ddl_if_exists,
                $.while_statement,
                $.loop_statement,
                $.for_statement,
                $.repeat_statement,
                $._loop_join_hint,
                $._privilege_statement,
                $.handler_declaration,
                $.variable_declaration,
                $.do_block,
                $._with_clause,
                $._routine_keyword
            ),

        // Items of a condition or an operand: no statement structure, no terminator.
        _expression_item: $ =>
            choice(
                $._group,
                $.case_expression,
                $.invocation,
                $.anchored_type,
                $.object_name,
                $._reference_clause,
                $.logical_operator,
                $._between,
                $._for_flat,
                $._with_flat,
                $._repeat_call,
                $._not_exists,
                $._literal,
                $._flat_keyword,
                $._punctuation
            ),

        // Items between the name of a routine and its body: parameters, return type, options, the table of a trigger.
        _header_item: $ =>
            choice(
                $._group,
                $.case_expression,
                $.invocation,
                $.anchored_type,
                $.object_name,
                $._header_reference_clause,
                $.referencing_clause,
                $._for_flat,
                kw("with"),
                $._literal,
                $._header_keyword,
                $._punctuation,
                $._routine_keyword,
                kw("and"),
                kw("or")
            ),

        _flat_keyword: $ =>
            choice(
                kw("as"),
                kw("is"),
                kw("in"),
                kw("not"),
                kw("exists"),
                kw("on"),
                kw("table"),
                kw("select"),
                kw("set"),
                prec(PREC.flatFallback, kw("alter")),
                kw("drop"),
                kw("comment"),
                prec(PREC.flatFallback, kw("declare")),
                kw("immediate"),
                ...CLAUSE_KEYWORDS.map(kw)
            ),

        // A DDL trigger fires AFTER CREATE OR ALTER OR DROP.
        _header_keyword: $ =>
            choice(
                kw("create"),
                kw("alter"),
                kw("drop"),
                kw("in"),
                kw("not"),
                kw("exists"),
                kw("table"),
                kw("select"),
                kw("set"),
                $._when_flat,
                $._then_flat
            ),

        _routine_kind: $ => choice(...ROUTINE_KINDS.map(kw)),

        _routine_keyword: $ => prec(PREC.flatFallback, choice(...ROUTINE_KINDS.map(kw))),

        _when_flat: $ => prec(PREC.flatFallback, kw("when")),
        _then_flat: $ => kw("then"),
        _do_flat: $ => prec(PREC.flatFallback, kw("do")),
        _exception_flat: $ => prec(PREC.flatFallback, kw("exception")),

        _punctuation: $ => choice(",", ".", "*", "{", "}", "[", "]", $.operator),

        _literal: $ => choice($.string, $.number, $.dollar_string, $.parameter_marker),

        // ------------------------------------------------------------------ definitions

        _create_prefix: $ =>
            prec.right(
                seq(
                    kw("create"),
                    repeat(
                        choice(
                            seq(kw("or"), choice(kw("replace"), kw("alter"))),
                            $.identifier,
                            $.quoted_identifier,
                            $.string,
                            "=",
                            "@",
                            "."
                        )
                    )
                )
            ),

        _create_other: $ => prec(PREC.flatFallback, seq($._create_prefix, optional(kw("type")))),

        // GRANT CREATE PROCEDURE TO someone creates nothing.
        _privilege_statement: $ =>
            prec.right(seq(choice(kw("grant"), kw("revoke")), repeat(choice($._expression_item, kw("create"), $._routine_keyword)))),

        _if_not_exists: $ => seq(kw("if"), optional(kw("not")), kw("exists")),

        _routine_head: $ =>
            seq(
                choice($._create_prefix, kw("alter")),
                field("kind", $._routine_kind),
                optional($._if_not_exists),
                field("name", $.object_name)
            ),

        _routine_signature: $ => prec.right(seq($._routine_head, optional($.parameter_list), repeat($._header_item))),

        routine_definition: $ => prec.right(seq($._routine_signature, field("body", $.routine_body))),

        routine_declaration: $ => prec.right(PREC.flatFallback, $._routine_signature),

        // A routine of a package body or a declaration section: no CREATE in front of it.
        _nested_routine_signature: $ =>
            prec.right(
                seq(
                    field("kind", choice(kw("procedure"), kw("function"))),
                    field("name", $.object_name),
                    optional($.parameter_list),
                    repeat($._header_item)
                )
            ),

        _nested_routine: $ =>
            choice(alias($._nested_routine_definition, $.routine_definition), alias($._nested_routine_declaration, $.routine_declaration)),

        _nested_routine_definition: $ => prec.right(seq($._nested_routine_signature, field("body", $.routine_body))),

        _nested_routine_declaration: $ => prec.right(PREC.flatFallback, seq($._nested_routine_signature, ";")),

        parameter_list: $ =>
            choice(
                prec(PREC.preferredStructure, seq("(", optional(commaSeparated1($.parameter)), ")")),
                prec.right(commaSeparated1(alias($._bare_parameter, $.parameter)))
            ),

        parameter: $ =>
            prec.right(
                PREC.preferredStructure,
                seq(
                    optional(field("mode", choice(kw("in"), kw("out"), kw("inout"), kw("variadic")))),
                    field("name", choice($.identifier, $.quoted_identifier, $.variable)),
                    optional($._parameter_type)
                )
            ),

        _bare_parameter: $ => prec.right(PREC.preferredStructure, seq(field("name", $.variable), optional($._parameter_type))),

        // Without a precedence of its own, so that a default value such as = 10 stays with the parameter
        _parameter_type: $ => prec.right(repeat1($._parameter_item)),

        _parameter_item: $ =>
            choice(
                $._group,
                $.object_name,
                $.invocation,
                $.anchored_type,
                $._literal,
                choice(".", "*", "=", $.operator),
                kw("in"),
                kw("out"),
                kw("not"),
                kw("table")
            ),

        // The routine body: AS or IS, then statements or declarations, ending after the first block at its own level.
        routine_body: $ =>
            prec.right(
                choice(
                    seq(choice(kw("as"), kw("is")), optional($._body_sequence)),
                    seq(kw("as"), $._dollar_quoted_body),
                    seq(kw("declare"), optional($._body_sequence)),
                    $._body_block
                )
            ),

        // PostgreSQL: the code between dollar quotes, then the rest of the header up to the end of the statement.
        _dollar_quoted_body: $ => prec.right(seq($._dollar_body, repeat($._header_item), optional(";"))),

        _body_sequence: $ =>
            prec.right(
                choice(
                    seq(repeat1($._body_item), repeat($._body_continuation), optional($._body_block)),
                    seq(repeat1($._body_continuation), optional($._body_block)),
                    $._body_block
                )
            ),

        // After a semicolon a PL/SQL declaration section goes on with a name, a nested routine or the block.
        _body_continuation: $ =>
            prec.right(seq(";", optional(seq(choice($.identifier, $._nested_routine, kw("declare")), repeat($._declaration_item))))),

        _body_item: $ => choice($._soup_item, $._nested_routine),

        _declaration_item: $ => choice($._control_item_not_beginning_with_begin, $._flat_branch_keyword, $._nested_routine),

        _body_block: $ => prec.right(seq($.block, optional(";"))),

        package_definition: $ =>
            prec.right(
                seq(
                    $._create_prefix,
                    choice(seq(kw("package"), optional(kw("body"))), seq(kw("type"), kw("body"))),
                    optional($._if_not_exists),
                    field("name", $.object_name),
                    repeat($._header_item),
                    choice(kw("as"), kw("is")),
                    repeat(choice($._nested_routine, $._expression_item, ";")),
                    choice(seq(kw("end"), optional($.identifier)), $.block),
                    optional(";")
                )
            ),

        _view_signature: $ =>
            prec.right(
                seq(
                    choice($._create_prefix, kw("alter")),
                    kw("view"),
                    optional($._if_not_exists),
                    field("name", $.object_name),
                    repeat($._header_item)
                )
            ),

        view_definition: $ => prec.right(seq($._view_signature, kw("as"), repeat($._soup_item))),

        _view_alteration: $ => prec(PREC.flatFallback, $._view_signature),

        table_definition: $ =>
            prec.right(
                seq(
                    $._create_prefix,
                    kw("table"),
                    optional($._if_not_exists),
                    field("name", $.object_name),
                    optional(choice($.column_definitions, $._table_copy)),
                    optional($._table_inheritance)
                )
            ),

        // PostgreSQL's PARTITION OF parent and MySQL's LIKE other make a table out of another one
        _table_copy: $ => choice(seq(kw("partition"), kw("of"), $.object_reference), seq(kw("like"), $.object_reference)),

        _table_inheritance: $ => seq(kw("inherits"), "(", commaSeparated1($.object_reference), ")"),

        synonym_definition: $ =>
            seq($._create_prefix, kw("synonym"), field("name", $.object_name), kw("for"), field("target", $.object_reference)),

        column_definitions: $ =>
            seq("(", optional(seq(commaSeparated1(choice($.column_definition, $.table_constraint)), optional(","))), ")"),

        column_definition: $ => prec.right(seq(field("name", choice($.identifier, $.quoted_identifier)), repeat($._column_item))),

        table_constraint: $ =>
            prec.right(
                seq(
                    choice(
                        kw("constraint"),
                        kw("primary"),
                        kw("foreign"),
                        kw("unique"),
                        kw("check"),
                        kw("key"),
                        kw("index"),
                        kw("exclude"),
                        kw("period"),
                        kw("like")
                    ),
                    repeat($._column_item)
                )
            ),

        _column_item: $ =>
            choice(
                $._group,
                $.case_expression,
                $.invocation,
                $.anchored_type,
                $.object_name,
                $._reference_clause,
                $.logical_operator,
                $._literal,
                $._flat_keyword,
                choice(".", "*", "{", "}", $.operator)
            ),

        // ------------------------------------------------------------------ blocks

        block: $ =>
            prec.dynamic(
                PREC.structure,
                prec.right(
                    seq(
                        choice(kw("begin"), $._begin_semicolon),
                        optional(seq(optional(kw("not")), kw("atomic"))),
                        repeat($._statement_item),
                        optional($.exception_section),
                        kw("end"),
                        optional(field("label", $.identifier))
                    )
                )
            ),

        // One token each, so that a BEGIN after a routine body opens a block only where no transaction starts.
        _begin_transaction: $ =>
            token(
                prec(
                    PREC.preferredStructure,
                    new RegExp(
                        `${caseInsensitive("begin").source}\\s+(${TRANSACTION_WORDS.map(word => caseInsensitive(word).source).join("|")})[\\s;]`
                    )
                )
            ),

        // BEGIN; starts a transaction in PostgreSQL and MySQL but opens a block in T-SQL: the parser tries both.
        _begin_semicolon: $ => token(prec(PREC.preferredStructure, new RegExp(`${caseInsensitive("begin").source}\\s*;`))),

        _begin_semicolon_transaction: $ => $._begin_semicolon,

        try_block: $ => seq(kw("begin"), kw("try"), repeat($._statement_item), kw("end"), kw("try")),

        catch_block: $ => seq(kw("begin"), kw("catch"), repeat($._statement_item), kw("end"), kw("catch")),

        exception_section: $ => prec(PREC.preferredStructure, seq(kw("exception"), repeat1($.exception_handler))),

        exception_handler: $ => prec.right(seq(kw("when"), field("condition", $.condition), kw("then"), repeat($._branch_item))),

        handler_declaration: $ =>
            prec(PREC.preferredStructure, seq(kw("declare"), choice(kw("continue"), kw("exit"), kw("undo")), kw("handler"), kw("for"))),

        variable_declaration: $ => prec(PREC.structure, seq(kw("declare"), field("name", choice($.variable, $.identifier)))),

        do_block: $ => prec(PREC.preferredStructure, seq(kw("do"), optional(seq(kw("language"), $.identifier)), $._dollar_body)),

        _dollar_body: $ => seq($._dollar_body_start, repeat($._statement_item), $._dollar_body_end),

        // ------------------------------------------------------------------ control flow

        if_statement: $ =>
            prec.right(
                seq(
                    kw("if"),
                    field("condition", $.condition),
                    optional(
                        choice(
                            seq(
                                kw("then"),
                                repeat($._statement_item),
                                repeat($.elsif_clause),
                                optional($.else_clause),
                                kw("end"),
                                kw("if")
                            ),
                            seq(choice($.block, $.try_block), optional(";"), optional($._tsql_else)),
                            seq(";", optional($._tsql_else)),
                            $._tsql_else
                        )
                    )
                )
            ),

        condition: $ => prec.right(repeat1($._expression_item)),

        elsif_clause: $ => seq(choice(kw("elsif"), kw("elseif")), field("condition", $.condition), kw("then"), repeat($._statement_item)),

        else_clause: $ => seq(kw("else"), repeat($._statement_item)),

        _tsql_else: $ => prec.right(seq(kw("else"), optional(choice($.block, $.try_block, $.if_statement, $.while_statement)))),

        _ddl_if_exists: $ => prec(PREC.preferredStructure, seq(kw("if"), choice($._not_exists, kw("exists")), $.object_name)),

        _not_exists: $ => prec(PREC.structure, seq(kw("not"), kw("exists"))),

        case_expression: $ =>
            prec.right(
                seq(
                    kw("case"),
                    repeat($._expression_item),
                    repeat1($.when_clause),
                    optional(alias($._case_else_clause, $.else_clause)),
                    kw("end"),
                    optional(kw("case"))
                )
            ),

        when_clause: $ => prec.right(seq(kw("when"), field("condition", $.condition), kw("then"), repeat($._branch_item))),

        _case_else_clause: $ => seq(kw("else"), repeat($._branch_item)),

        _branch_item: $ => choice($._control_item, $._then_flat, $._do_flat, $._exception_flat, ";", $.block),

        while_statement: $ =>
            prec.right(
                seq(
                    kw("while"),
                    field("condition", $.condition),
                    optional(
                        choice(
                            seq(kw("loop"), repeat($._statement_item), kw("end"), kw("loop"), optional($.identifier)),
                            seq(kw("do"), repeat($._statement_item), kw("end"), kw("while"), optional($.identifier)),
                            $.block,
                            $.try_block
                        )
                    )
                )
            ),

        loop_statement: $ => prec.right(seq(kw("loop"), repeat($._statement_item), kw("end"), kw("loop"), optional($.identifier))),

        for_statement: $ =>
            prec.right(
                seq(
                    choice(kw("for"), kw("foreach")),
                    field("variable", $.identifier),
                    kw("in"),
                    repeat1($._expression_item),
                    choice(
                        seq(kw("loop"), repeat($._statement_item), kw("end"), kw("loop"), optional($.identifier)),
                        seq(kw("do"), repeat($._statement_item), kw("end"), kw("for"), optional($.identifier))
                    )
                )
            ),

        _for_flat: $ => seq(kw("for"), optional($.identifier)),

        repeat_statement: $ =>
            prec.right(
                seq(
                    kw("repeat"),
                    repeat($._statement_item),
                    kw("until"),
                    field("condition", $.condition),
                    kw("end"),
                    kw("repeat"),
                    optional($.identifier)
                )
            ),

        _repeat_call: $ => prec(PREC.preferredStructure, seq(kw("repeat"), $._group)),

        logical_operator: $ => choice(kw("and"), kw("or")),

        // BETWEEN takes the next AND, which is no logical operator.
        _between: $ => seq(kw("between"), repeat1($._between_operand), kw("and")),

        _between_operand: $ => choice($._group, $.case_expression, $.invocation, $.object_name, $._literal, $._punctuation),

        // ------------------------------------------------------------------ references

        _reference_clause: $ =>
            choice(
                $._from_list,
                seq(
                    choice(
                        kw("join"),
                        kw("into"),
                        kw("update"),
                        kw("delete"),
                        kw("merge"),
                        kw("using"),
                        kw("call"),
                        kw("perform"),
                        kw("insert"),
                        kw("references"),
                        kw("apply"),
                        seq(kw("truncate"), optional(kw("table")))
                    ),
                    $.object_reference
                ),
                seq(choice(kw("exec"), kw("execute")), optional(seq($.variable, "=")), $.object_reference),
                $._reference_keyword,
                seq(kw("execute"), kw("immediate"))
            ),

        // The T-SQL join hint of INNER LOOP JOIN; whether LOOP opens a loop shows only at the JOIN.
        _loop_join_hint: $ => seq(kw("loop"), kw("join"), $.object_reference),

        // Whether a comma continues the list shows only in the token after it, so the parser tries both.
        _from_list: $ => seq(kw("from"), $._from_list_item, repeat(seq(",", choice($._from_list_item, seq($._group, optional($._alias)))))),

        _from_list_item: $ => prec.right(seq($.object_reference, optional($._alias))),

        _reference_keyword: $ =>
            prec(
                PREC.flatFallback,
                choice(
                    kw("from"),
                    kw("join"),
                    kw("into"),
                    kw("update"),
                    kw("delete"),
                    kw("merge"),
                    kw("using"),
                    kw("call"),
                    kw("perform"),
                    kw("insert"),
                    kw("references"),
                    kw("apply"),
                    kw("truncate"),
                    kw("exec"),
                    kw("execute")
                )
            ),

        // Inside a routine header ON names the table of a trigger; OR and AND list its events.
        _header_reference_clause: $ =>
            choice(seq(kw("on"), $.object_reference), seq(kw("references"), $.object_reference), $._reference_keyword),

        referencing_clause: $ => prec.right(seq(kw("referencing"), repeat1(choice($.identifier, kw("as"), kw("table"))))),

        _alias: $ => prec.right(seq(optional(kw("as")), choice($.identifier, $.quoted_identifier))),

        object_reference: $ => field("name", $.object_name),

        // PL/SQL's orders%ROWTYPE takes the type of a table, orders.total%TYPE the type of one of its columns
        anchored_type: $ => seq(field("name", $.object_name), field("anchor", $.type_anchor)),

        type_anchor: $ => token(choice(/%[rR][oO][wW][tT][yY][pP][eE]/, /%[tT][yY][pP][eE]/)),

        invocation: $ => prec(PREC.structure, seq(field("name", $.object_name), $._group)),

        _with_clause: $ =>
            prec.right(PREC.structure, seq(kw("with"), optional(kw("recursive")), commaSeparated1($.common_table_expression))),

        common_table_expression: $ =>
            seq(
                field("name", $.identifier),
                optional($._group),
                kw("as"),
                optional(seq(optional(kw("not")), kw("materialized"))),
                $._group
            ),

        _with_flat: $ => seq(kw("with"), optional($.identifier)),

        _group: $ => seq("(", repeat(choice($._expression_item, $.if_statement, $._with_clause)), ")"),

        // ------------------------------------------------------------------ names and tokens

        // The last part can be a star (t.*) or, in PostgreSQL's OPERATOR(pg_catalog.~), an operator.
        object_name: $ => prec.right(seq($._name_part, repeat(seq(".", choice($._name_part, "*", $.operator))))),

        _name_part: $ =>
            choice($.identifier, $.quoted_identifier, $.variable, $.bind_variable, $.template_expression, $.substitution_variable),

        // SQL*Plus replaces &name, or &name. before a dot, with a value before the statement runs: &schema..orders
        substitution_variable: $ => /&&?[A-Za-z_][A-Za-z0-9_$#]*\.?/,

        // A placeholder of a template engine (Jinja, dbt, Go templates) that fills in a name: {{ ref('orders') }}
        template_expression: $ => /\{\{([^}]|\}[^}])*\}\}/,

        // A statement of a template engine: {% if ... %}, {# comment #}
        template_tag: $ => /\{%([^%]|%[^}])*%\}|\{#([^#]|#[^}])*#\}/,

        identifier: $ => /[A-Za-z_\u00C0-\uFFFF#][A-Za-z0-9_#\u00C0-\uFFFF]*(\$+[A-Za-z0-9_#\u00C0-\uFFFF]+)*/,

        quoted_identifier: $ => choice(/"([^"]|"")*"/, /`([^`]|``)*`/, /\[[^\[\]\n]*\]/),

        variable: $ => /@@?[A-Za-z_\u00C0-\uFFFF#][A-Za-z0-9_#@$\u00C0-\uFFFF]*/,

        bind_variable: $ => /:[A-Za-z_\u00C0-\uFFFF][A-Za-z0-9_#$\u00C0-\uFFFF]*/,

        parameter_marker: $ => choice(/\$[0-9]+/, "?"),

        string: $ => choice($._quoted_string, ...ORACLE_QUOTE_DELIMITERS.map(([open, close]) => oracleQuotedString(open, close))),

        number: $ => /\d+(\.\d+)?([eE][+-]?\d+)?|\.\d+([eE][+-]?\d+)?|0[xX][0-9a-fA-F]+/,

        operator: $ => /[-+\/%<>=!~^&|?@\\:$]+|\.\./,

        comment: $ => token(choice(prec(1, /--[^\n]*/), prec(1, /\/\*[^*]*\*+([^/*][^*]*\*+)*\//), prec(1, /#([ \t!=*-][^\n]*)?/)))
    }
})
