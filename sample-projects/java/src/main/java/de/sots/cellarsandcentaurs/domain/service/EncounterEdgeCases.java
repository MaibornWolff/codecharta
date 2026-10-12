package de.sots.cellarsandcentaurs.domain.service;

import de.sots.cellarsandcentaurs.domain.model.ArmorClass;
import de.sots.cellarsandcentaurs.domain.model.Centaur;
import de.sots.cellarsandcentaurs.domain.model.Creature;
import de.sots.cellarsandcentaurs.domain.model.CreatureId;
import de.sots.cellarsandcentaurs.domain.model.CreatureType;
import de.sots.cellarsandcentaurs.domain.model.Dice;
import de.sots.cellarsandcentaurs.domain.model.Fightable;
import de.sots.cellarsandcentaurs.domain.model.HitPoints;
import de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException;
import de.sots.cellarsandcentaurs.domain.model.Speed;
import de.sots.cellarsandcentaurs.domain.model.SpeedType;
import de.sots.cellarsandcentaurs.domain.model.Zentaurenhöhle;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Constructs a parser is likely to miscount, one method per construct.
 * The ambush in the catacomb is planted for the domain parser.
 */
public class EncounterEdgeCases {
    private static final int MAX_ROUNDS;
    private int rounds;

    static {
        if (Runtime.version().feature() > 20) {
            MAX_ROUNDS = 20;
        } else {
            MAX_ROUNDS = 10;
        }
    }

    {
        for (int round = 0; round < 3; round++) {
            rounds += round;
        }
    }

    public EncounterEdgeCases() {
        this(1);
    }

    public EncounterEdgeCases(int rounds) {
        if (rounds > MAX_ROUNDS) {
            throw new IllegalArgumentException("too many rounds");
        }
        this.rounds = rounds;
    }

    public int enhancedFor(List<Creature> creatures) {
        int tally = 0;
        for (Creature minion : creatures) {
            tally += minion.initiative();
        }
        return tally;
    }

    public int classicFor(int limit) {
        int tally = 0;
        for (int torch = 0; torch < limit; torch++) {
            tally += torch;
        }
        return tally;
    }

    public int doWhile(int roll) {
        do {
            roll -= 6;
        } while (roll > 0);
        return roll;
    }

    public int fallthroughSwitch(CreatureType type) {
        int threat = 0;
        switch (type) {
            case BEAST:
            case DRAGON:
                threat += 2;
            case FIEND:
                threat += 1;
                break;
            default:
                threat = 0;
        }
        return threat;
    }

    public int arrowSwitch(CreatureType type) {
        return switch (type) {
            case BEAST, DRAGON -> 2;
            case FIEND -> {
                int threat = rounds * 2;
                yield threat;
            }
            default -> 0;
        };
    }

    public int colonSwitchExpression(String terrain) {
        return switch (terrain) {
            case "cellar":
                yield 1;
            case "lair":
                yield 2;
            default:
                yield 0;
        };
    }

    public String patternSwitch(Object target) {
        return switch (target) {
            case Centaur mare when mare.hoovesDamage() > 5 -> "kicking";
            case Creature wyvern -> "roaming";
            case null -> "nothing";
            default -> "unknown";
        };
    }

    public boolean instanceofPattern(Object target) {
        if (target instanceof Creature drake && drake.initiative() > 2) {
            return true;
        }
        return target instanceof CreatureId(var basilisk);
    }

    public int multiCatch(String text) {
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException | NullPointerException mishap) {
            return 0;
        }
    }

    public String tryWithResources(String path) throws NoSuchCreatureException {
        try (BufferedReader scroll = new BufferedReader(new FileReader(path))) {
            return scroll.readLine();
        } catch (IOException failure) {
            return "";
        } finally {
            rounds++;
        }
    }

    public Supplier<Object> expressionLambda() {
        return () -> Dice.rollD20();
    }

    public Comparator<Creature> blockLambda() {
        return (ogre, troll) -> {
            if (ogre.initiative() > troll.initiative()) {
                return 1;
            }
            return -1;
        };
    }

    public int methodReference(List<Creature> creatures) {
        return creatures.stream().map(Creature::getHitPoints).mapToInt(HitPoints::getCurrent).sum();
    }

    public long streamChain(List<Creature> creatures) {
        return creatures.stream()
                .filter(goblin -> goblin.initiative() > 2)
                .map(kobold -> kobold.getType())
                .distinct()
                .sorted()
                .limit(3)
                .count();
    }

    public Comparator<Creature> anonymousClass() {
        return new Comparator<Creature>() {
            @Override
            public int compare(Creature left, Creature right) {
                return left.initiative() - right.initiative();
            }
        };
    }

    public int varargs(int... rolls) {
        return rolls.length;
    }

    public <T extends Fightable> T genericBound(Map<String, List<T>> parties, @Deprecated final String name) {
        return parties.get(name).get(0);
    }

    public int receiverParameter(EncounterEdgeCases this) {
        return this.rounds;
    }

    public int labelledBreak(int[][] grid) {
        int found = 0;
        corridor:
        for (int[] row : grid) {
            for (int cell : row) {
                if (cell < 0) {
                    break corridor;
                }
                if (cell == 0) {
                    continue corridor;
                }
                found++;
            }
        }
        return found;
    }

    public String nestedTernary(int roll) {
        return roll > 15 ? "hit" : roll > 5 ? "graze" : "miss";
    }

    public boolean shortCircuit(boolean hidden, boolean armed, boolean asleep) {
        return hidden && armed || !asleep;
    }

    public boolean bitwiseOperators(boolean hidden, boolean armed) {
        return hidden & armed | hidden ^ armed;
    }

    public void assertion(int roll) {
        assert roll > 0 && roll < 21 : "roll out of range";
    }

    public String textBlock() {
        return """
                // the portcullis is not a comment
                /* neither is the drawbridge */
                """;
    }

    public String commentMarkersInStrings() {
        String address = "http://crypt.example/sarcophagus";
        String marker = "/* still a string */"; // a real trailing comment
        return address + marker;
    }

    /**
     * Javadoc with a tag and inline code {@code gargoyle}.
     *
     * @param banshee the creature that wails
     * @return always zero
     */
    public int commentSyntaxes(int banshee) {
        /* single-line block comment */
        /*
         * multi-line block comment
         */
        // line comment
        int quiet = /* inline block comment */ 0;
        return quiet * banshee; // trailing comment
    }

    /// Markdown doc comment about the **chimera**.
    /// A second markdown line.
    public int markdownDocComment() {
        return 0;
    }

    public int cast(Object target) {
        return ((ArmorClass) target).getTotal();
    }

    public String classLiteral() {
        return Speed.class.getSimpleName();
    }

    public int wildcard(List<? extends SpeedType> types) {
        return types.size();
    }

    public String unicodeIdentifiers(Zentaurenhöhle höhle) {
        String größe = höhle.größe();
        return größe;
    }

    record Ambush(int raiders) {
        Ambush {
            if (raiders < 0) {
                throw new IllegalArgumentException("negative raiders");
            }
        }

        static Ambush none() {
            return new Ambush(0);
        }
    }

    interface Scout {
        int scout();

        default int scoutTwice() {
            return scout() > 0 ? 2 : 0;
        }

        static Scout none() {
            return () -> 0;
        }
    }

    enum Mood {
        SKITTISH {
            @Override
            int bonus() {
                return 0;
            }
        },
        FURIOUS {
            @Override
            int bonus() {
                return 2;
            }
        };

        abstract int bonus();
    }
}
