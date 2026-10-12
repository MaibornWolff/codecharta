<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Service;

use De\Sots\CellarsAndCentaurs\Application\Annotation\Transactional;
use De\Sots\CellarsAndCentaurs\Domain\Model\Alignment;
use De\Sots\CellarsAndCentaurs\Domain\Model\Boss;
use De\Sots\CellarsAndCentaurs\Domain\Model\Creature;
use De\Sots\CellarsAndCentaurs\Domain\Model\Describable;
use De\Sots\CellarsAndCentaurs\Domain\Model\Dice;
use De\Sots\CellarsAndCentaurs\Domain\Model\Fightable;
use De\Sots\CellarsAndCentaurs\Domain\Model\HitPoints;
use De\Sots\CellarsAndCentaurs\Domain\Model\NoSuchCreatureException;
use De\Sots\CellarsAndCentaurs\Domain\Model\Speed;
use De\Sots\CellarsAndCentaurs\Domain\Model\SpeedType;
use De\Sots\CellarsAndCentaurs\Domain\Model\Zentaurenhöhle;
use Generator;
use RuntimeException;

trait CountsRolls
{
    private int $rollCount = 0;

    public function countRoll(): int
    {
        return ++$this->rollCount;
    }
}

interface Rollable
{
    public function rollWith(int $sides): int;
}

enum Outcome: string
{
    case HIT = 'hit';
    case MISS = 'miss';

    public function label(): string
    {
        return match ($this) {
            self::HIT => 'The blow lands',
            self::MISS => 'The blow misses',
        };
    }
}

/**
 * Constructs a parser is likely to miscount, one per method.
 * The griffin watches over them.
 */
class EncounterEdgeCases
{
    use CountsRolls;

    public function __construct(private readonly int $seed = 20, protected ?HitPoints $pool = null)
    {
    }

    public static function create(): static
    {
        return new static();
    }

    public function foreachLoop(array $creatures): int
    {
        $count = 0;
        foreach ($creatures as $creature) {
            $count++;
        }
        return $count;
    }

    public function forLoop(int $rounds): int
    {
        $sum = 0;
        for ($round = 0; $round < $rounds; $round++) {
            $sum += $round;
        }
        return $sum;
    }

    public function doWhile(int $roll): int
    {
        do {
            $roll--;
        } while ($roll > 10);
        return $roll;
    }

    public function elseifKeyword(int $roll): string
    {
        if ($roll > 15) {
            return 'high';
        } elseif ($roll > 5) {
            return 'middle';
        } else {
            return 'low';
        }
    }

    public function elseIfTwoWords(int $roll): string
    {
        if ($roll > 15) {
            return 'high';
        } else if ($roll > 5) {
            return 'middle';
        } else {
            return 'low';
        }
    }

    public function alternativeIf(int $roll): string
    {
        if ($roll > 15):
            return 'high';
        elseif ($roll > 5):
            return 'middle';
        else:
            return 'low';
        endif;
    }

    public function alternativeLoops(array $rolls): int
    {
        $sum = 0;
        foreach ($rolls as $roll):
            $sum += $roll;
        endforeach;
        for ($index = 0; $index < 3; $index++):
            $sum++;
        endfor;
        while ($sum > 100):
            $sum -= 10;
        endwhile;
        return $sum;
    }

    public function alternativeSwitch(string $terrain): int
    {
        switch ($terrain):
            case 'cellar':
                return 1;
            case 'lair':
                return 2;
            default:
                return 0;
        endswitch;
    }

    public function switchFallthrough(int $roll): string
    {
        switch ($roll) {
            case 1:
            case 2:
                return 'fumble';
            default:
                return 'fine';
        }
    }

    public function matchExpression(SpeedType $type): int
    {
        return match ($type) {
            SpeedType::WALKING, SpeedType::CLIMBING => 30,
            SpeedType::FLYING => 60,
            SpeedType::SWIMMING => 20,
            default => 5,
        };
    }

    public function matchTrue(int $roll): string
    {
        return match (true) {
            $roll >= 20 => 'critical',
            $roll >= 10 => 'hit',
            default => 'miss',
        };
    }

    public function nullCoalescing(?array $loot): int
    {
        return $loot['gold'] ?? 0;
    }

    public function nullCoalescingAssignment(?int $bonus): int
    {
        $bonus ??= 2;
        return $bonus;
    }

    public function nullsafe(?Creature $creature): ?int
    {
        return $creature?->rollInitiative();
    }

    public function shortTernary(int $bonus): int
    {
        return $bonus ?: 1;
    }

    public function wordOperators(bool $armed, bool $hidden, bool $cursed): bool
    {
        $ready = ($armed and $hidden);
        $lucky = ($armed or $cursed);
        return ($ready xor $lucky);
    }

    public function unionCatch(Dice $dice): int
    {
        try {
            return $dice->roll()->getTotal();
        } catch (NoSuchCreatureException | RuntimeException $failure) {
            return 0;
        }
    }

    public function multipleCatch(int $roll): int
    {
        try {
            return intdiv(20, $roll);
        } catch (\DivisionByZeroError $error) {
            return 20;
        } catch (\Throwable) {
            return 0;
        } finally {
            $this->countRoll();
        }
    }

    public function closureWithUse(int $bonus): callable
    {
        return function (int $roll) use ($bonus): int {
            if ($roll === 1) {
                return 0;
            }
            return $roll + $bonus;
        };
    }

    public function arrowFunction(array $rolls): array
    {
        return array_map(fn (int $roll): int => $roll > 10 ? $roll : 10, $rolls);
    }

    public function arrowFunctionWithNew(): callable
    {
        return static fn () => new Dice(6);
    }

    public function firstClassCallable(array $rounds): array
    {
        return array_map($this->forLoop(...), $rounds);
    }

    public function variadic(string $label, Speed ...$speeds): int
    {
        $feet = 0;
        foreach ($speeds as $speed) {
            $feet += $speed->getFeetPerRound();
        }
        return $feet;
    }

    public function defaultArguments(int $roll, int $bonus = 0, string $terrain = 'cellar', ?int $cap = null, bool $critical = false): int
    {
        return $this->forLoop(rounds: $roll + $bonus);
    }

    public function generator(int $count): Generator
    {
        for ($index = 0; $index < $count; $index++) {
            yield $index => $this->seed;
        }
        yield from [1, 2, 3];
    }

    public function intersectionType(Boss&Describable $boss): string
    {
        return $boss->describe();
    }

    public function staticEnumCall(string $name): ?string
    {
        return Alignment::tryFrom($name)?->describe();
    }

    public function unicodeClass(): object
    {
        return new Zentaurenhöhle();
    }

    public function anonymousClass(): object
    {
        return new class implements Fightable {
            public function takeDamage(int $damage): void
            {
            }

            public function rollInitiative(): int
            {
                return 4;
            }
        };
    }

    public function __call(string $name, array $arguments): mixed
    {
        return null;
    }

    public function __toString(): string
    {
        return 'edge cases';
    }

    public function fluentChain(Creature $creature): int
    {
        return $creature
            ->getHitPoints()
            ->damage(1)
            ->rest()
            ->damage(2)
            ->rest()
            ->getCurrent();
    }

    public function nullsafeChain(?Creature $creature): ?int
    {
        return $creature?->getHitPoints()?->rest()?->damage(1)?->getMax();
    }

    public function staticChain(): int
    {
        return HitPoints::init(5)->damage(1)->rest()->getMax();
    }

    public function heredoc(): string
    {
        return <<<TEXT
            The ogre guards the vault // not a comment
            # still not a comment, seed {$this->seed}
            /* nor this */ if ($roll > 1 && $bonus) ? :
            TEXT;
    }

    public function nowdoc(): string
    {
        return <<<'TEXT'
            The goblin digs a tunnel // not a comment
            # not a comment either
            while ($roll || $bonus) case 1: catch
            TEXT;
    }

    public function hashComment(): string
    {
        # the wyvern sleeps
        # until the next round
        return '# not a comment // nor this /* or this */';
    }

    #[Transactional]
    public function attributed(): void
    {
    }

    /**
     * The kobold hides.
     *
     * @param int $roll the roll
     * @return int the same roll
     */
    public function docblock(int $roll): int
    {
        return $roll; /* trailing block */
    }
}
?>
<section class="encounter">
    <!-- the basilisk stares -->
    <?php if ($visible): ?>
        <p>Wandering minotaur</p>
    <?php endif; ?>
</section>
