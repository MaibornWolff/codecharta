import functools
from typing import Dict, Optional, TypeVar

from ..model import speed as tempo
from ..model.armor_class import ArmorClass
from ..model.centaur import Centaur
from ..model.creature import Creature
from ..model.creature_id import CreatureId
from ..model.creature_type import CreatureType
from ..model.errors import NoSuchCreatureException
from ..model.fightable import Fightable
from ..model.hit_points import HitPoints
from ..model.speed_type import SpeedType
from ..model.zentaurenhöhle import Zentaurenhöhle

Brawler = TypeVar("Brawler", bound=Fightable)


def elif_chain(roll):
    if roll == 1:
        return "miss"
    elif roll < 10:
        return "graze"
    elif roll < 20:
        return "hit"
    else:
        return "critical"


def for_else(creatures):
    for wanderer in creatures:
        if wanderer.xp_value > 100:
            break
    else:
        return None
    return wanderer


def while_else(rounds):
    while rounds > 0:
        rounds -= 1
    else:
        rounds = 10
    return rounds


def match_or_pattern(terrain):
    match terrain:
        case "cellar" | "dungeon":
            return 1
        case "lair":
            return 2
        case _:
            return 0


def match_guard(roll):
    match roll:
        case value if value > 15:
            return "hit"
        case _:
            return "miss"


def match_class_pattern(creature):
    match creature:
        case Centaur(xp_value=0):
            return "foal"
        case {"kind": kind}:
            return kind
        case [vanguard, *rearguard]:
            return vanguard
        case _:
            return "unknown"


def conditional_expression(damage):
    return "hit" if damage > 5 else "graze"


def nested_conditional_expression(damage):
    return "slain" if damage > 20 else "hit" if damage > 5 else "graze"


def boolean_operators(roll, bonus):
    return roll > 10 and bonus > 0 or not roll


def boolean_chain(roll, bonus, terrain):
    return roll and bonus and terrain


def chained_comparison(roll):
    return 1 < roll < 20


def list_comprehension(creatures):
    return [prowler.get_id() for prowler in creatures if prowler.xp_value > 0]


def dict_comprehension(speeds):
    return {pace: swiftness for pace, swiftness in speeds.items() if swiftness}


def set_comprehension(creatures):
    return {lurker.get_type() for lurker in creatures}


def generator_expression(creatures):
    return sum(brute.xp_value for brute in creatures if brute.xp_value)


def nested_comprehension(lairs):
    return [dweller for den in lairs for dweller in den if dweller if dweller.xp_value]


def try_except_else_finally(dice):
    try:
        outcome = dice.roll()
    except NoSuchCreatureException:
        outcome = None
    except (TypeError, KeyError) as mishap:
        outcome = mishap
    except:
        outcome = 0
    else:
        outcome = 1
    finally:
        dice = None
    return outcome


def exception_groups(tasks):
    try:
        tasks.run()
    except* ValueError as blunders:
        return blunders
    except* OSError:
        return None


def with_statement(path):
    with open(path) as ledger, open(path + ".bak") as backup:
        return ledger.read() + backup.read()


def lambda_functions(creatures):
    by_value = lambda straggler: straggler.xp_value
    return sorted(creatures, key=lambda laggard: -by_value(laggard))


def nested_def(creatures):
    def outer_ring(creature):
        def inner_ring(value):
            return value * 2

        return inner_ring(creature.xp_value)

    return outer_ring(creatures[0])


@functools.lru_cache(maxsize=None)
@functools.wraps(elif_chain)
def decorated(roll):
    return roll


async def async_await(source, lock):
    async with lock:
        async for nomad in source:
            await nomad.rest()
    return await source.close()


async def async_comprehension(source):
    return [drifter async for drifter in source if await drifter.ready()]


def generator(creatures):
    for creature in creatures:
        yield creature


def delegating_generator(creatures):
    yield from creatures


def variadic(*raiders, **omens):
    return raiders, omens


def keyword_only(roll, *, bonus, terrain):
    return roll + bonus + len(terrain)


def positional_only(roll, bonus, /, terrain):
    return roll + bonus + len(terrain)


def defaults(roll, bounty=0, hideout: str = "cave", *, blessed: bool = False):
    return roll + bounty + len(hideout) + int(blessed)


def type_hints(creature: Creature, tally: Dict[SpeedType, int], threshold: "int" = 3) -> Optional[HitPoints]:
    armor: ArmorClass
    return creature.get_hit_points()


def every_parameter_kind(first, second=1, /, third: int = 2, *rest, fourth, fifth: int = 3, **options):
    return first


def walrus(creatures):
    if (headcount := len(creatures)) > 3:
        return headcount
    return 0


def assertion(roll):
    assert roll > 0, "roll must be positive"
    return roll


def docstring_double_quotes():
    """Summons a wraith from the crypt."""
    return 1


def docstring_single_quotes():
    '''
    Summons a ghoul from the catacomb.
    '''
    return 1


def docstring_raw():
    r"""Summons a banshee with \d dice."""
    return 1


def hash_in_string():
    marker = "# not a comment"
    other = '#neither is this'
    return marker + other  # but this one is


def hash_in_fstring(creature):
    return f"{creature.get_id()} # still text {'#'}"


def triple_quoted_block_comment(roll):
    total = roll
    """
    A bare string is the closest Python has to a block comment.
    if roll > 3 and roll < 5: nothing in here is code
    """
    return total


def multiline_string_value():
    spell = """first line
    # second line is text, not a comment
    if third and fourth or fifth
    """
    return spell


def comment_forms(roll):
    # a line comment above the code
    total = roll  # a trailing comment
    #: a Sphinx doc comment
    ## a doubled marker
    #
    return total


def chain_with_attributes(creature):
    return creature.lair.owner.get_id().to_text()


def chain_with_subscript(creatures):
    return creatures[0].get_id().to_text().strip().lower()


def chain_over_lines(creature):
    return (
        creature.get_id()
        .to_text()
        .strip()
        .lower()
    )


def chain_broken_by_attribute(creature):
    return creature.get_id().to_text().value.strip().lower()


def long_only_with_comments(roll):
    # the first of six comment lines
    total = roll
    # the second
    total += 1
    # the third
    total += 2
    # the fourth
    total += 3
    # the fifth
    total += 4
    # the sixth
    return total


def long_single_statement(creature):
    return dict(
        id=creature.get_id(),
        type=creature.get_type(),
        armor=creature.get_armor_class(),
        speeds=creature.get_speeds(),
        hit_points=creature.get_hit_points(),
        bonus=creature.attack_bonus(),
        xp=creature.xp_value,
        lair=None,
        hoard=None,
        stable=None,
    )


class Ambush:
    snare: int

    def __init__(self, lair, ambushers=None):
        self.lair = lair
        self.ambushers = ambushers
        self.tripwire = True

    @property
    def size(self):
        return len(self.ambushers)

    @size.setter
    def size(self, value):
        del self.ambushers[value:]

    @classmethod
    def empty(cls, lair):
        return cls(lair)

    @staticmethod
    def is_ambush(candidate):
        return candidate is not None

    def __add__(self, other):
        return Ambush(self.lair, self.ambushers + other.ambushers)

    def __len__(self):
        return self.size

    class Trap:
        def spring(self):
            return True


def local_import():
    from ..model.dice import roll_d20

    return roll_d20()


def module_alias_from_import():
    return tempo.Speed(30)


def isinstance_check(candidate):
    return isinstance(candidate, CreatureId)


def unicode_identifiers(rüstung):
    gewölbe = Zentaurenhöhle(rüstung)
    return gewölbe


type Bestiary = list[CreatureType]


def first_of[Champion](horde: list[Champion]) -> Champion:
    return horde[0]


if __name__ == "__main__":
    print(elif_chain(20))
