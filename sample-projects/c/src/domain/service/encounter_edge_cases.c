#include <stdarg.h>
#include <stdlib.h>

#include "../../../include/de/sots/cellarsandcentaurs/domain/service/encounter_edge_cases.h"
#include "../../../include/de/sots/cellarsandcentaurs/domain/model/centaur.h"

static int edge_forward_declared(int roll);

int edge_do_while(int rolls)
{
    int total = 0;
    do {
        total += rolls;
        rolls--;
    } while (rolls > 0);
    return total;
}

int edge_goto(int depth)
{
retry:
    if (depth-- > 0) {
        goto retry;
    }
    return depth;
}

int edge_switch_fallthrough(int type)
{
    int danger = 0;
    switch (type) {
    case 0:
    case 1:
        danger += 1;
    case 2:
        danger += 2;
        break;
    case 3:
        danger += 3;
        break;
    default:
        break;
    }
    return danger;
}

int edge_ifdef_branches(int hit)
{
#ifdef USE_DICE
    if (hit > 10) {
        return 2;
    }
#else
    if (hit > 5 && hit < 9) {
        return 1;
    }
#endif
    return 0;
}

int edge_if_defined(void)
{
#if defined(USE_DICE) && !defined(NO_LAIR)
    return 2;
#elif defined(NO_LAIR) || defined(NO_STABLE)
    return 1;
#else
    return 0;
#endif
}

#if 0
int edge_disabled(int mimic)
{
    if (mimic > 0) {
        return 1;
    }
    return 0;
}
#endif

int edge_macro_user(int left, int right)
{
    int best = EDGE_MAX(left, right);
    EDGE_CLAMP_ROLL(best);
    return EDGE_MAX(best, 1);
}

EDGE_DEFINE_GETTER(depth)

int edge_function_pointer_parameter(int (*compare)(int, int), int left, int right)
{
    return compare(left, right);
}

static int edge_compare_rolls(const void *left, const void *right)
{
    return *(const int *)left - *(const int *)right;
}

void edge_callback(int *rolls, size_t count)
{
    qsort(rolls, count, sizeof(int), edge_compare_rolls);
}

int (*edge_returns_function_pointer(int kind))(const void *, const void *)
{
    return kind > 0 ? edge_compare_rolls : NULL;
}

int edge_void_parameter(void)
{
    return 20;
}

int edge_empty_parameter_list()
{
    return 20;
}

int edge_variadic(int count, ...)
{
    va_list rolls;
    int total = 0;
    va_start(rolls, count);
    for (int index = 0; index < count; index++) {
        total += va_arg(rolls, int);
    }
    va_end(rolls);
    return total;
}

int edge_knr_definition(lich, wyrm)
int lich;
int wyrm;
{
    return lich > wyrm ? lich : wyrm;
}

static int edge_forward_declared(int roll)
{
    return roll + 1;
}

int edge_array_parameters(int rolls[static 3], const char *names[], size_t count)
{
    return names[0] != NULL && count > 2 ? rolls[2] : 0;
}

__attribute__((unused)) static int edge_attribute(int roll)
{
    return roll;
}

int edge_commented_parameters(int roll, /* the bonus */ int bonus)
{
    return roll + bonus;
}

int edge_one_liner(int roll) { return roll ? 1 : 0; }

void edge_empty_body(void) {}

int edge_nested_ternary(int roll)
{
    return roll > 15 ? 2 : roll > 5 ? 1 : 0;
}

int edge_bitwise_operators(int flags)
{
    int *address = &flags;
    return (*address & 4) | (flags ^ 1);
}

int edge_short_circuit_assignment(int hit, int critical, int blessed)
{
    int success = hit && critical || blessed;
    return success;
}

int edge_infinite_loop(int rolls)
{
    for (;;) {
        if (rolls-- <= 0) {
            break;
        }
    }
    return rolls;
}

int edge_else_if_chain(int roll)
{
    if (roll > 18) {
        return 3;
    } else if (roll > 12) {
        return 2;
    } else if (roll > 6) {
        return 1;
    } else {
        return 0;
    }
}

int edge_duffs_device(int count)
{
    int steps = 0;
    int rounds = (count + 3) / 4;
    switch (count % 4) {
    case 0:
        do {
            steps++;
    case 3:
            steps++;
    case 2:
            steps++;
    case 1:
            steps++;
        } while (--rounds > 0);
    }
    return steps;
}

int edge_generic_selection(int roll)
{
    return _Generic(roll, int: 1, default: 0);
}

int edge_comment_markers_in_strings(void)
{
    const char *line = "// owlbear is not a comment";
    const char *block = "/* basilisk is not a comment either */";
    const char *link = "http://dungeon.example/lair";
    char slash = '/';
    return line[0] == slash && block[0] == link[5];
}

int edge_line_continuation(int roll)
{
    // the beholder comment runs on into the next line \
    roll = 99;
    const char *text = "gelatinous \
cube";
    return roll + \
        (int)text[0];
}

const char *edge_string_forms(int roll)
{
    const char *joined = "wandering " "minotaur";
    const char *escaped = "ooze\ntroll\tkobold";
    const char *format = "%s the %d wyvern";
    const wchar_t *wide = L"griffon";
    return roll > 0 ? joined : escaped;
}

/** javadoc style doc comment */
/*! qt style doc comment */
/// triple slash doc comment
//! bang doc comment
/* a block comment holding // a line marker */
// a line comment holding /* a block marker
int edge_comment_syntaxes(void)
{
    return 0; /* trailing block */ // and trailing line
}

int edge_tag_reference(struct Lair *lair, enum SpeedType type)
{
    return lair->depth + (int)type;
}

int edge_cast_and_sizeof(const Creature *creature)
{
    const Centaur *centaur = (const Centaur *)creature;
    return centaur->bow_range + (int)sizeof(union EdgePayload);
}

int edge_compound_literal(void)
{
    Speed speed = (Speed){ .feet_per_round = 30 };
    EdgeSpeedCallback callback = speed_get_feet_per_round;
    return callback(&speed);
}
