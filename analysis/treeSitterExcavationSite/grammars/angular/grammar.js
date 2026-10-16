/**
 * @file Angular Grammar for tree-sitter
 * @author Dennis van den Berg <dennis@vdberg.dev>
 * @license MIT
 */

/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />

const HTML = require("./html/grammar")

const PREC = {
    ARROW: 0,
    CALL: 1,
    ALIAS: 2
}

module.exports = grammar(HTML, {
    name: "angular",

    // CodeCharta: whether a non-null assertion is called, itemAction()!(row), shows only after the "!"
    conflicts: $ => [
        [$.arrow_function_parameters, $._primitive],
        [$._primitive, $._non_null_call],
        [$.member_expression, $._non_null_call]
    ],

    externals: ($, original) =>
        original.concat([$._interpolation_start, $._interpolation_end, $._control_flow_start, $._empty_quoted_string]),

    rules: {
        // ---------- Root ---------
        _node: ($, original) => choice(prec(1, $.icu_expression), prec(1, $.interpolation), prec(1, $._any_statement), original),

        // ---------- Overrides ----------
        // CodeCharta: a dot inside a plain attribute name, attr.viewBox="0 0 {{ size }}"
        attribute_name: _ => /[^<>\*.\[\]\(\)"'=\s][^<>\*\[\]\(\)"'=\s]*/,
        text: _ => /[^<>@{}&\s]([^<>@{}&]*[^<>@{}&\s])?/,

        // ----------- Statement block --------
        statement_block: $ => prec.right(seq("{", repeat($._node), "}")),

        // ---------- Statements ----------
        _any_statement: $ =>
            choice($.if_statement, $.for_statement, $.defer_statement, $.switch_statement, $.let_statement, $._alternative_statement),

        _alternative_statement: $ =>
            choice(
                field("alternative", $.else_statement),
                field("alternative_condition", $.else_if_statement),
                field("empty", $.empty_statement),
                field("placeholder", $.placeholder_statement),
                field("loading", $.loading_statement),
                field("error", $.error_statement)
            ),

        // ---------- Let Statement ----------

        let_statement: $ =>
            prec.right(seq(alias($._control_flow_start, "@"), alias("let", $.control_keyword), $.assignment_expression, ";")),

        // ---------- Switch Statement ----------
        //
        switch_statement: $ => prec.right(seq($._switch_start_expression, $._switch_body_expression)),

        _switch_start_expression: $ => seq(alias($._control_flow_start, "@"), alias("switch", $.control_keyword)),

        _switch_body_expression: $ => prec.left(seq("(", field("value", $.expression), ")", field("body", $.switch_body))),

        switch_body: $ => seq("{", repeat1(choice($.case_statement, $.default_statement)), "}"),

        case_statement: $ =>
            seq(
                alias($._control_flow_start, "@"),
                alias("case", $.control_keyword),
                "(",
                field("value", $._any_expression),
                ")",
                optional(field("body", $.statement_block))
            ),

        default_statement: $ =>
            seq(alias($._control_flow_start, "@"), alias("default", $.control_keyword), field("body", $.statement_block)),

        // ---------- Defer Statement ----------

        defer_statement: $ =>
            prec.right(
                seq(
                    alias($._control_flow_start, "@"),
                    alias("defer", $.control_keyword),
                    optional($.defer_trigger),
                    field("body", $.statement_block)
                )
            ),

        placeholder_statement: $ =>
            prec.right(
                seq(
                    alias($._control_flow_start, "@"),
                    alias("placeholder", $.control_keyword),
                    optional($.placeholder_minimum),
                    field("body", $.statement_block)
                )
            ),

        loading_statement: $ =>
            prec.right(
                seq(
                    alias($._control_flow_start, "@"),
                    alias("loading", $.control_keyword),
                    optional($.loading_condition),
                    field("body", $.statement_block)
                )
            ),

        error_statement: $ => seq(alias($._control_flow_start, "@"), alias("error", $.control_keyword), field("body", $.statement_block)),

        defer_trigger: $ =>
            seq(
                "(",
                field("condition", $.defer_trigger_condition),
                optional(repeat(seq(";", field("condition", $.defer_trigger_condition)))),
                ")"
            ),

        placeholder_minimum: $ => seq("(", field("minimum", $.timed_expression), ")"),

        loading_condition: $ =>
            seq("(", field("condition", $.timed_expression), optional(seq(";", field("condition", $.timed_expression))), ")"),

        defer_trigger_condition: $ =>
            seq(
                optional(alias("prefetch", $.prefetch_keyword)),
                choice(
                    seq(alias("when", $.special_keyword), field("trigger", $._any_expression)),
                    seq(alias("on", $.special_keyword), field("trigger", $._primitive))
                )
            ),

        timed_expression: $ => seq(alias(choice("after", "minimum"), $.special_keyword), field("value", $.number), $.unit),

        // ---------- For Statement ----------
        for_statement: $ => prec.right(seq($._for_start_expression, $._for_body_expression)),

        _for_start_expression: $ => seq(alias($._control_flow_start, "@"), alias("for", $.control_keyword)),

        _for_body_expression: $ =>
            prec.left(
                seq(
                    "(",
                    field("declaration", $.for_declaration),
                    optional(field("reference", $.for_reference)),
                    ")",
                    field("body", $.statement_block)
                )
            ),

        empty_statement: $ => seq(alias($._control_flow_start, "@"), alias("empty", $.control_keyword), field("body", $.statement_block)),

        for_declaration: $ =>
            seq(
                field("name", $.identifier),
                alias("of", $.special_keyword),
                // CodeCharta: any expression to iterate and lets before the track, @for (a of b ?? []; let i = $index; track i)
                field("value", $._any_expression),
                repeat($._for_let),
                ";",
                alias("track", $.special_keyword),
                field("track", $.expression)
            ),

        _for_let: $ =>
            seq(
                ";",
                alias("let", $.special_keyword),
                field("alias", $.assignment_expression),
                repeat(seq(",", field("alias", $.assignment_expression)))
            ),

        for_reference: $ =>
            seq(
                ";",
                alias("let", $.special_keyword),
                field("alias", $.assignment_expression),
                // CodeCharta: a let before each alias, ; let i = $index; let first = $first
                repeat(seq(choice(";", ","), optional(alias("let", $.special_keyword)), field("alias", $.assignment_expression)))
            ),

        // ---------- If Statement ----------
        if_statement: $ => prec.right(seq($._if_start_expression, $._if_body_expression)),

        else_if_statement: $ => prec.right(seq($._else_if_start_expression, $._if_body_expression)),

        else_statement: $ => prec.right(seq(alias($._control_flow_start, "@"), alias("else", $.control_keyword), $.statement_block)),

        _if_start_expression: $ => seq(alias($._control_flow_start, "@"), alias("if", $.control_keyword)),

        _else_if_start_expression: $ =>
            seq(alias($._control_flow_start, "@"), alias("else", $.control_keyword), alias("if", $.control_keyword)),

        _if_body_expression: $ =>
            prec.left(
                seq(
                    "(",
                    field("condition", $.if_condition),
                    optional(field("reference", $.if_reference)),
                    ")",
                    field("consequence", $.statement_block)
                )
            ),

        if_condition: $ => prec.right(PREC.CALL, $._any_expression),
        if_reference: $ => seq(";", alias("as", $.special_keyword), $.identifier),

        // ---------- Expressions -----------
        _any_expression: $ =>
            choice(
                $.arrow_function,
                $.binary_expression,
                $.unary_expression,
                $.expression,
                $.ternary_expression,
                $.nullish_coalescing_expression,
                $.regular_expression,
                prec(3, $.conditional_expression)
            ),

        arrow_function: $ =>
            prec.right(
                PREC.ARROW,
                seq(field("parameters", choice($.identifier, $.arrow_function_parameters)), "=>", field("body", $._any_expression))
            ),

        arrow_function_parameters: $ => seq("(", optional(seq($.identifier, repeat(seq(",", $.identifier)))), ")"),

        regular_expression: $ =>
            seq(
                "/",
                field("pattern", $.regular_expression_pattern),
                token.immediate(prec(1, "/")),
                optional(field("flags", $.regular_expression_flags)),
                optional(seq(".", $.call_expression))
            ),

        regular_expression_pattern: _ =>
            token.immediate(
                prec(
                    -1,
                    repeat1(
                        choice(
                            seq(
                                "[",
                                repeat(
                                    choice(
                                        /\\./, // escaped character
                                        /[^\]\n\\]/ // any character besides ']', '\' or '\n'
                                    )
                                ),
                                "]"
                            ),
                            /\\./, // escaped character
                            /[^/\\\[\n]/ // any character besides '[', '\', '/', '\n'
                        )
                    )
                )
            ),

        regular_expression_flags: () => token.immediate(/[dgimsuvy]+/),

        assignment_expression: $ => seq(field("name", choice($.member_expression, $.identifier)), "=", field("value", $._any_expression)),

        // -------- ICU expressions ---------
        icu_expression: $ =>
            seq("{", choice($._any_expression, $.concatenation_expression), ",", $.icu_clause, ",", repeat1($.icu_case), "}"),

        icu_clause: () => choice("plural", "select"),

        icu_case: $ => seq($.icu_category, "{", repeat1($._node), "}"),

        icu_category: () => /[^{}]+/i,

        // ---------- Interpolation ---------
        interpolation: $ =>
            seq(
                alias($._interpolation_start, "{{"),
                choice($._any_expression, $.concatenation_expression),
                alias($._interpolation_end, "}}")
            ),

        concatenation_expression: $ => prec(2, seq($._primitive, "+", $.expression, optional(repeat(seq("+", $._primitive))))),

        // ---------- Property Binding ---------
        attribute: $ =>
            choice(
                prec(1, $.property_binding),
                prec(1, $.two_way_binding),
                prec(1, $.animation_binding),
                prec(1, $.event_binding),
                prec(1, $.structural_directive),
                $._normal_attribute // <-- This needs to be hidden from syntax tree
            ),

        // ---------- Structural Directives ---------
        structural_directive: $ =>
            seq(
                "*",
                alias($.attribute_name, $.identifier),
                optional(
                    seq(
                        "=",
                        choice($._double_quote, $._single_quote),
                        choice($.structural_expression, $.structural_declaration),
                        choice($._double_quote, $._single_quote)
                    )
                )
            ),

        // CodeCharta: lets after the expression, *bitCellDef="table.columns.name; let row"
        structural_expression: $ =>
            seq(
                $._any_expression,
                optional($._alias),
                optional($._else_template_expression),
                optional($._context_expression),
                repeat(seq(";", alias("let", $.special_keyword), $.structural_assignment))
            ),

        structural_declaration: $ =>
            seq(alias("let", $.special_keyword), seq($.structural_assignment, repeat(seq(choice(";", ","), $.structural_assignment)))),

        structural_assignment: $ =>
            choice(
                // CodeCharta: an expression as a keyed value, trackBy: trackBy(); templateCacheSize: 0
                seq(
                    field("name", $.identifier),
                    ":",
                    field("value", choice($.identifier, $.call_expression, $.member_expression, $.number, $.string))
                ),
                prec.left(
                    PREC.ALIAS,
                    seq(
                        optional(alias("let", $.special_keyword)),
                        field("name", $.identifier),
                        field("operator", choice($.identifier, "=")),
                        field("value", $.expression),
                        optional($._alias)
                    )
                ),
                seq(field("name", $.identifier), optional($._alias))
            ),

        _alias: $ => seq(alias("as", $.special_keyword), field("alias", $.identifier)),
        _else_template_expression: $ => seq(";", alias("else", $.special_keyword), $.identifier),
        _context_expression: $ =>
            seq(";", choice(alias("context", $.special_keyword), field("named", $.identifier)), ":", $._any_expression),

        // ---------- Bindings ----------
        // CodeCharta: a property binding without a value, [popupBackAction]
        property_binding: $ => seq("[", choice($.binding_name, $.class_binding), "]", optional($._binding_assignment)),
        // CodeCharta: an event of a global target, (window:resize) or (document:keydown.escape)
        event_binding: $ => seq("(", alias($._event_binding_name, $.binding_name), ")", $._binding_assignment),
        _event_binding_name: $ => seq(optional(seq(field("target", alias($.binding_identifier, $.identifier)), ":")), $._binding_primitive),
        two_way_binding: $ => seq("[(", $.binding_name, ")]", $._binding_assignment),
        animation_binding: $ => seq("[@", $.binding_name, "]", optional(field("trigger", $._binding_assignment))),

        _binding_assignment: $ =>
            choice(
                seq("=", alias($._empty_quoted_string, '""')),
                seq(
                    "=",
                    $._double_quote,
                    optional(choice($._any_expression, $.assignment_expression)),
                    repeat(seq(";", optional(choice($._any_expression, $.assignment_expression)))),
                    $._double_quote
                )
            ),

        binding_identifier: () => /[-\p{L}_\$][-\p{L}\p{N}_\$]*/,
        binding_name: $ => $._binding_primitive,
        _binding_primitive: $ => choice(alias($.binding_identifier, $.identifier), alias($.binding_member_expression, $.member_expression)),
        binding_member_expression: $ =>
            seq(
                field("object", $._binding_primitive),
                ".",
                choice(field("property", alias($.binding_identifier, $.identifier)), field("unit", $.style_unit))
            ),

        class_binding: $ => seq(alias("class", $.identifier), optional(seq(".", $.class_name))),

        class_name: () =>
            token(
                repeat1(
                    choice(
                        /[\!a-zA-Z0-9_\-\/:'"()]+/, // regular characters (no brackets)
                        /\[[^\]]+\]/ // bracket pairs for arbitrary variants like [size='large']
                    )
                )
            ),

        _normal_attribute: $ => seq($.attribute_name, optional(seq("=", choice($.attribute_value, $.quoted_attribute_value)))),

        // CodeCharta: an interpolation inside a plain attribute value is an expression, class="w-4 {{ a ? 'x' : 'y' }}"
        quoted_attribute_value: $ =>
            choice(
                seq("'", repeat(choice(alias($._single_quoted_attribute_text, $.attribute_value), $.interpolation)), "'"),
                seq('"', repeat(choice(alias($._double_quoted_attribute_text, $.attribute_value), $.interpolation)), '"')
            ),
        _single_quoted_attribute_text: () => token(/(?:[^'{]|\{[^'{])+|\{/),
        _double_quoted_attribute_text: () => token(/(?:[^"{]|\{[^"{])+|\{/),

        // ---------- Expressions ---------
        // untagged template literal
        template_string: $ => seq($._backtick, repeat(choice($.template_chars, $.template_substitution)), $._backtick),

        template_chars: _ => token.immediate(prec(1, /(?:[^$`\\]+|\\.)+/)),

        template_substitution: $ => seq("${", $._any_expression, "}"),

        // Expression
        expression: $ => prec.right(seq($._primitive, optional(field("pipes", $.pipe_sequence)))),
        _piped_expression: $ => prec(-1, seq($._primitive, field("pipes", $.pipe_sequence))),

        // Unary expression
        // CodeCharta: unary minus, plus and typeof, -1, -count and typeof heading
        unary_expression: $ =>
            seq(
                field("operator", alias(choice("!", "-", "+", "typeof"), $.unary_operator)),
                field("value", choice($.expression, $.unary_expression))
            ),

        // Binary expression
        binary_expression: $ =>
            prec.left(
                PREC.CALL,
                // CodeCharta: a unary expression as the left operand, typeof heading === "string"
                seq(
                    field("left", choice($.expression, $.unary_expression)),
                    field("operator", $._binary_op),
                    field("right", choice($.binary_expression, $.expression))
                )
            ),

        // Ternary expression
        ternary_expression: $ =>
            prec.right(
                PREC.CALL,
                seq(
                    field("condition", $._any_expression),
                    alias("?", $.ternary_operator),
                    // CodeCharta: any expression but an arrow function as the true branch, a ? b / 12 : c
                    field(
                        "consequence",
                        choice(
                            $.group,
                            $._primitive,
                            $._short_concat_expression,
                            $.binary_expression,
                            $.unary_expression,
                            $.ternary_expression,
                            $.conditional_expression,
                            $.nullish_coalescing_expression
                        )
                    ),
                    alias(":", $.ternary_operator),
                    field("alternative", choice($.group, $._any_expression))
                )
            ),

        _short_concat_expression: $ => prec(PREC.ALIAS, seq($._primitive, "+", $._primitive)),

        // Nullish coalescing expression
        nullish_coalescing_expression: $ =>
            seq(
                field("condition", $._any_expression),
                alias("??", $.coalescing_operator),
                // CodeCharta: a pipe after the default applies to the whole, a ?? b | currency
                field("default", choice($._primitive, alias($._piped_expression, $.expression)))
            ),

        // Conditional expression
        conditional_expression: $ =>
            prec.right(
                PREC.CALL,
                seq(
                    field("left", choice($._primitive, $.unary_expression, $.binary_expression)),
                    alias(choice("||", "&&"), $.conditional_operator),
                    // CodeCharta: a pipe after the last operand applies to the whole, a && b$ | async
                    field(
                        "right",
                        choice(
                            $._primitive,
                            $.unary_expression,
                            $.binary_expression,
                            $.conditional_expression,
                            alias($._piped_expression, $.expression)
                        )
                    )
                )
            ),

        // ---------- Pipes ---------
        pipe_sequence: $ => prec.right(repeat1(seq(alias("|", $.pipe_operator), $.pipe_call))),

        pipe_call: $ => prec.right(seq(field("name", $.identifier), optional(field("arguments", $.pipe_arguments)))),

        pipe_arguments: $ => prec.right(repeat1($._pipe_argument)),
        // CodeCharta: operators in a pipe argument bind tighter than the next argument, | i18n: a ?? 0 : b || "0"
        _pipe_argument: $ => prec.right(PREC.ALIAS, seq(":", $._pipe_argument_value)),
        _pipe_argument_value: $ =>
            choice(
                $._primitive,
                $.unary_expression,
                alias($._pipe_binary_expression, $.binary_expression),
                alias($._pipe_nullish_coalescing_expression, $.nullish_coalescing_expression)
            ),
        _pipe_binary_expression: $ =>
            prec.left(
                PREC.ALIAS,
                seq(field("left", $._pipe_argument_value), field("operator", $._binary_op), field("right", $._primitive))
            ),
        _pipe_nullish_coalescing_expression: $ =>
            prec.left(
                PREC.ALIAS,
                seq(field("condition", $._pipe_argument_value), alias("??", $.coalescing_operator), field("default", $._primitive))
            ),

        // ---------- Primitives ----------
        _primitive: $ =>
            choice(
                $.object,
                $.array,
                $.identifier,
                $.string,
                $.template_string,
                $.number,
                $.group,
                $.call_expression,
                $.member_expression,
                $.bracket_expression,
                $.non_null_expression
            ),

        // CodeCharta: the non-null assertion of TypeScript, cipher()!
        non_null_expression: $ => prec(PREC.CALL, seq(field("value", $._primitive), "!")),

        // Object
        object: $ => seq("{", repeat(choice($.pair, $._shorthand, seq($.spread, optional(",")))), "}"),

        pair: $ => seq(field("key", choice($.identifier, $.string)), ":", field("value", $._any_expression), optional(",")),

        _shorthand: $ => seq($.identifier, optional(",")),
        spread: $ => seq("...", $._primitive),

        // Array
        array: $ =>
            seq(
                "[",
                // CodeCharta: any expression as an element and a trailing comma, [a ? 'x' : 'y',]
                optional(seq($._array_element, repeat(seq(",", $._array_element)), optional(","))),
                "]"
            ),

        _array_element: $ =>
            choice(
                $.expression,
                $.unary_expression,
                $.spread,
                $.binary_expression,
                $.ternary_expression,
                $.conditional_expression,
                $.nullish_coalescing_expression
            ),

        // Identifier
        // CodeCharta: letters of every script, not only ASCII (höhle.rüstungsklasse)
        identifier: () => /[\p{L}_\$][\p{L}\p{N}_\$]*/,

        // String
        string: $ =>
            choice(
                seq($._double_quote, repeat(choice(token.immediate(/[^"]/), $._escape_sequence)), $._double_quote),
                seq($._single_quote, repeat(choice(token.immediate(/[^']/), $._escape_sequence)), $._single_quote)
            ),

        _escape_sequence: _ =>
            token.immediate(
                seq(
                    "\\",
                    choice(/[^xu0-7]/, /[0-7]{1,3}/, /x[0-9a-fA-F]{2}/, /u[0-9a-fA-F]{4}/, /u\{[0-9a-fA-F]+\}/, /[\r?][\n\u2028\u2029]/)
                )
            ),

        // Number
        number: () => /[0-9]+\.?[0-9]*/,

        // Group
        group: $ => seq("(", $._any_expression, ")"),

        // Call expression
        // CodeCharta: the call of a call result and an optional call, action()(), itemAction()!(row) and isFocused?.()
        call_expression: $ =>
            prec.left(
                PREC.CALL,
                seq(
                    field("function", choice($.identifier, $.call_expression, alias($._non_null_call, $.non_null_expression))),
                    choice("(", "?.("),
                    optional(field("arguments", $.arguments)),
                    ")"
                )
            ),
        _non_null_call: $ => seq(field("value", $.call_expression), "!"),
        // CodeCharta: any expression as an argument, fn(a ? b : c), $any(rows$ | async)
        arguments: $ => seq(choice($._argument, $._timed_argument), repeat(seq(",", $._argument)), optional(",")),
        _argument: $ =>
            choice(
                $._primitive,
                $.binary_expression,
                $.unary_expression,
                $.ternary_expression,
                $.conditional_expression,
                $.nullish_coalescing_expression,
                alias($._piped_expression, $.expression),
                $.spread,
                $.arrow_function
            ),

        _timed_argument: $ => seq($.number, $.unit),

        // Member expression
        member_expression: $ =>
            seq(
                field("object", $._primitive),
                choice(seq(choice(".", "?.", "!."), choice(field("property", $.identifier), field("call", $.call_expression))))
            ),

        style_unit: () => choice("px", "%"),

        // Bracket expression
        // CodeCharta: an optional element access, errors?.['maxLength']
        bracket_expression: $ =>
            prec.left(PREC.CALL, seq(field("object", $._primitive), choice("[", "?.["), field("property", $._any_expression), "]")),

        // ---------- Base ----------
        unit: () => choice("ms", "s"),

        _closing_bracket: _ => token(prec(-1, "}")),
        _backtick: () => "`",
        // eslint-disable-next-line quotes
        _single_quote: () => "'",
        _double_quote: () => '"',
        _binary_op: () =>
            choice(
                "+",
                "-",
                "/",
                "*",
                "**",
                "%",
                "==",
                "===",
                "!=",
                "!==",
                "&&",
                "||",
                "<",
                "<=",
                ">",
                "in",
                ">=",
                "+=",
                "-=",
                "*=",
                "/=",
                "%=",
                "**=",
                "<<=",
                ">>=",
                ">>>=",
                "&=",
                "^=",
                "|=",
                "&&=",
                "||=",
                "??="
            )
    }
})
