#include "EncounterEdgeCases.hpp"

#include <concepts>
#include <coroutine>
#include <cstdarg>
#include <generator>
#include <map>
#include <memory>
#include <string>
#include <typeinfo>

#include "../model/ArmorClass.hpp"
#include "../model/Centaur.hpp"
#include "../model/Creature.hpp"
#include "../model/CreatureId.hpp"
#include "../model/CreatureType.hpp"
#include "../model/Dice.hpp"
#include "../model/Fightable.hpp"
#include "../model/HitPoints.hpp"
#include "../model/Lair.hpp"
#include "../model/NoSuchCreatureException.hpp"
#include "../model/Speed.hpp"
#include "../model/SpeedType.hpp"
#include "../model/Zentaurenhöhle.hpp"
#include "CentaurHerd.hpp"
#include "CreatureService.hpp"
#include "Creatures.hpp"
#include "EncounterResolver.hpp"

namespace de::sots::cellarsandcentaurs::domain::service {

// case: out-of-line member definition | functions 1, parameters 0, complexity 1
int EncounterTally::misses() const noexcept {
    return misses_;
}

// case: out-of-line static member definition | functions 1, parameters 0, complexity 1
EncounterTally EncounterTally::empty() {
    return EncounterTally(0, 0);
}

// case: range based for | functions 1, parameters 1, complexity 2
int rangeFor(const std::vector<int>& rolls) {
    int total = 0;
    for (int roll : rolls) {
        total += roll;
    }
    return total;
}

// case: do while | functions 1, parameters 1, complexity 2
int doWhile(int terrain) {
    int steps = 0;
    do {
        terrain -= 3;
        ++steps;
    } while (terrain > 0);
    return steps;
}

// case: classic for with && in its condition | functions 1, parameters 1, complexity 3
int classicFor(int rounds) {
    int total = 0;
    for (int round = 0; round < rounds && total < 100; ++round) {
        total += round;
    }
    return total;
}

// case: lambda with captures and one && | functions 1, parameters 2, complexity 3
bool lambdaWithCaptures(int threshold, int bonus) {
    auto beats = [&threshold, bonus](int roll) { return roll > threshold && bonus > 0; };
    return beats(10);
}

// case: lambda nested in a lambda, one ternary | functions 1, parameters 1, complexity 4
int nestedLambdas(int roll) {
    auto outer = [](int value) {
        auto inner = [](int candidate) { return candidate > 0 ? candidate : 0; };
        return inner(value);
    };
    return outer(roll);
}

// case: lambda at namespace scope | functions 0, parameters 1, complexity 1
const auto criticalHit = [](int roll) { return roll == 20; };

// case: if constexpr | functions 1, parameters 1, complexity 2
template <typename Amount>
int ifConstexpr(Amount amount) {
    if constexpr (std::is_integral_v<Amount>) {
        return amount;
    } else {
        return static_cast<int>(amount);
    }
}

// case: if with initializer | functions 1, parameters 2, complexity 2
int ifWithInitializer(const std::map<int, int>& damageByRoll, int roll) {
    if (auto found = damageByRoll.find(roll); found != damageByRoll.end()) {
        return found->second;
    }
    return 0;
}

// case: structured binding and a ternary | functions 1, parameters 1, complexity 2
int structuredBindings(const model::DiceRoll& diceRoll) {
    auto [sides, value] = diceRoll;
    return value > sides ? sides : value;
}

// case: function try block | functions 1, parameters 1, complexity 2
int functionTryBlock(const std::vector<int>& rolls) try {
    return rolls.at(0);
} catch (const std::out_of_range&) {
    return 0;
}

// case: try with three catch clauses | functions 1, parameters 1, complexity 4
int multipleCatch(const std::vector<int>& rolls) {
    try {
        return rolls.at(3);
    } catch (const std::out_of_range& error) {
        return 0;
    } catch (const std::exception& error) {
        return -1;
    } catch (...) {
        return -2;
    }
}

// case: function template with a ternary | functions 1, parameters 2, complexity 2
template <typename Strength>
Strength strongest(Strength left, Strength right) {
    return left < right ? right : left;
}

// case: explicit specialization of a function template | functions 1, parameters 2, complexity 2
template <>
int strongest<int>(int left, int right) {
    if (left < right) {
        return right;
    }
    return left;
}

// case: default arguments | functions 1, parameters 3, complexity 1
int defaultArguments(int roll, int bonus = 2, bool advantage = false) {
    return roll + bonus + static_cast<int>(advantage);
}

// case: variadic template with fold expression | functions 1, parameters 1, complexity 1
template <typename... Rolls>
int variadicTemplate(Rolls... rolls) {
    return (rolls + ... + 0);
}

// case: C style variadic function | functions 1, parameters 1, complexity 2
int variadicFunction(int count, ...) {
    va_list rolls;
    va_start(rolls, count);
    int total = 0;
    for (int index = 0; index < count; ++index) {
        total += va_arg(rolls, int);
    }
    va_end(rolls);
    return total;
}

// case: one if in each preprocessor branch | functions 1, parameters 1, complexity 4
int preprocessorBranches(int roll) {
#if defined(CELLARS_HARD_MODE)
    if (roll < 10) {
        return 0;
    }
#elif defined(CELLARS_EASY_MODE)
    if (roll < 2) {
        return 0;
    }
#else
    if (roll < 5) {
        return 0;
    }
#endif
    return roll;
}

// case: function disabled with #if 0 | functions 0, complexity 0
#if 0
int disabledRoll(int roll) {
    if (roll > 1) {
        return roll;
    }
    return 0;
}
#endif

// case: macro definitions holding a ternary and an if | functions 0, complexity 0
#define TROGLODYTE_BONUS(roll) ((roll) > 10 ? 2 : 0)
#define RETURN_ZERO_IF_FUMBLED(roll) \
    if ((roll) == 1) return 0

// case: function body made of macro calls | functions 1, parameters 1, complexity 1
int macroUser(int roll) {
    RETURN_ZERO_IF_FUMBLED(roll);
    return roll + TROGLODYTE_BONUS(roll);
}

// case: comment markers and operators inside string literals | functions 1, parameters 0, complexity 1
std::string commentMarkersInStrings() {
    std::string plain = "the wraith asks: is it a // comment? or && or || ?";
    std::string raw = R"(the wyvern says /* neither */ // nor this)";
    std::string escaped = "ghoul\nbanshee\tspectre";
    std::string joined = "hydra" "gorgon";
    return plain + raw + escaped + joined;
}

// case: multi line raw string holding code-like text | functions 1, parameters 0, complexity 1
const char* multiLineRawString() {
    return R"scroll(
        // the ogre is not a comment
        if (ogre && troll) { return 1; }
        /* still a string */
    )scroll";
}

// case: prefixed string literals | functions 1, parameters 0, complexity 1
const wchar_t* prefixedStrings() {
    const char8_t* narrow = u8"minotaur";
    const wchar_t* wide = L"kobold";
    return wide;
}

// case: character literals and digit separators before a comment | functions 1, parameters 0, complexity 1
int characterLiterals() {
    char quote = '"'; // a real trailing comment after a quote character
    char apostrophe = '\'';
    int treasure = 1'000'000;
    return quote + apostrophe + treasure;
}

// case: line comment continued with a backslash | functions 1, parameters 0, complexity 1
int continuedLineComment() {
    // the next line still belongs to this comment \
    int ignored = 1;
    return 0;
}

// case: co_await and co_return | functions 1, parameters 1, complexity 1
struct RollAwaiter {
    bool await_ready() const noexcept;
    void await_suspend(std::coroutine_handle<>) const noexcept;
    int await_resume() const noexcept;
};
template <typename Value>
struct Task;
Task<int> awaitRoll(RollAwaiter awaiter) {
    int roll = co_await awaiter;
    co_return roll;
}

// case: co_yield in a loop | functions 1, parameters 1, complexity 2
std::generator<int> yieldRolls(int count) {
    for (int index = 0; index < count; ++index) {
        co_yield index;
    }
}

// case: goto with a label | functions 1, parameters 1, complexity 2
int gotoRetry(int roll) {
retry:
    ++roll;
    if (roll < 10) {
        goto retry;
    }
    return roll;
}

// case: switch with grouped cases and fallthrough | functions 1, parameters 1, complexity 5
int switchFallthrough(int terrain) {
    int penalty = 0;
    switch (terrain) {
        case 1:
        case 2:
            penalty += 1;
            [[fallthrough]];
        case 3:
            penalty += 2;
            break;
        case 4: {
            penalty += 5;
            break;
        }
        default:
            break;
    }
    return penalty;
}

// case: nested ternary | functions 1, parameters 1, complexity 3
int nestedTernary(int roll) {
    return roll > 15 ? 2 : roll > 5 ? 1 : 0;
}

// case: alternative operator tokens and, or, not | functions 1, parameters 3, complexity 3
bool alternativeTokens(bool hit, bool critical, bool blocked) {
    return hit and not blocked or critical;
}

// case: local class with a method | functions 2, parameters 0, complexity 2
int localClass() {
    struct Counter {
        int next() { return ++count; }
        int count = 0;
    };
    Counter counter;
    return counter.next();
}

// case: trailing return type | functions 1, parameters 1, complexity 1
auto trailingReturn(int roll) -> int {
    return roll;
}

// case: function pointer parameter | functions 1, parameters 2, complexity 1
int functionPointerParameter(int (*combine)(int, int), int roll) {
    return combine(roll, roll);
}

// case: void parameter list | functions 1, parameters 0, complexity 1
int voidParameterList(void) {
    return 20;
}

// case: user defined literal | functions 1, parameters 1, complexity 1
constexpr int operator""_fathoms(unsigned long long depth) {
    return static_cast<int>(depth) * 6;
}

// case: rvalue reference parameter | functions 1, parameters 1, complexity 1
int rvalueReference(std::vector<int>&& rolls) {
    return static_cast<int>(rolls.size());
}

// case: requires clause joined with && | functions 1, parameters 1, complexity 1
template <typename Amount>
    requires std::integral<Amount> && std::signed_integral<Amount>
Amount requiresClause(Amount amount) {
    return amount / 2;
}

// case: attributes and noexcept | functions 1, parameters 1, complexity 1
[[nodiscard]] [[deprecated("ask the phoenix instead")]] int attributes([[maybe_unused]] int roll) noexcept {
    return 0;
}

// case: enum class | functions 0, complexity 0
enum class Outcome { CRITICAL_HIT, GLANCING_BLOW, FUMBLE };

/**
 * @brief Summons a sphinx to judge the encounter.
 * @param roll the roll of the attacker
 * @return the outcome
 */
// case: doc comment with tags | functions 1, parameters 1, complexity 3
Outcome docCommentTags(int roll) {
    if (roll == 20) {
        return Outcome::CRITICAL_HIT;
    } else if (roll == 1) {
        return Outcome::FUMBLE;
    }
    return Outcome::GLANCING_BLOW;
}

// case: namespace scope variable and free function with project types | functions 1, parameters 1, complexity 1
static const model::Creature* lastAttacker = nullptr;
int freeFunctionUse(const model::NoSuchCreatureException& error) {
    return lastAttacker == nullptr;
}

// case: class whose methods each reference one project type | functions 14, complexity 15
class EncounterWitness {
public:
    void summon() { auto steed = std::make_unique<model::Centaur>(); }
    int weigh() const { return static_cast<int>(sizeof(model::HitPoints)); }
    const char* name() const { return typeid(model::Fightable).name(); }
    int stride() const { model::Speed pace(30); return pace.getFeetPerRound(); }
    bool isDragon(int kind) const { return kind == static_cast<int>(model::CreatureType::DRAGON); }
    int walking() const { using enum model::SpeedType; return static_cast<int>(WALKING); }
    int armored() const { auto total = [](const model::ArmorClass& armor) { return armor.getTotal(); }; return 0; }
    int cast() const { return model::Dice{6}.roll().value; }
    auto lastRoll() const -> model::DiceRoll { return {20, 1}; }
    void dig() { delete new model::Lair(nullptr); }
    int depth() const { int model::Zentaurenhöhle::* member = &model::Zentaurenhöhle::rüstungsklasse; return 0; }
    std::size_t herd() const { return alignof(CentaurHerd); }
    void store(int (CreatureService::*counter)() const) {}
    template <std::derived_from<Creatures> Port> void attach(Port& port) {}
    void tag(std::string label = model::CreatureId("none").value());
    friend int audit(const EncounterResolver& resolver);
};

}
