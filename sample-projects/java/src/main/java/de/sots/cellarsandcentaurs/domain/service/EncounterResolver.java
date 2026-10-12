package de.sots.cellarsandcentaurs.domain.service;

import de.sots.cellarsandcentaurs.domain.model.Creature;
import de.sots.cellarsandcentaurs.domain.model.Dice;
import de.sots.cellarsandcentaurs.domain.model.Speed;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;

/**
 * Resolves one encounter between an attacker and a defender.
 * The attacker rolls against the armor class of the defender.
 * Terrain and speed change the damage that is dealt.
 * The same logic exists in every sample project.
 */
public class EncounterResolver {
    private int rolls;

    public int resolve(Creature attacker, Creature defender, int roll, int bonus, String terrain) {
        // A natural one always misses.
        if (roll == 1) {
            return 0;
        } else if (roll == 20) {
            bonus = bonus * 2;
        } else {
            bonus = bonus + 1;
        }
        int damage = roll + bonus;
        // Fast attackers hit harder.
        for (Speed speed : attacker.getSpeeds().values()) {
            if (speed.getFeetPerRound() > 30 && damage < 40) {
                damage++;
            }
        }
        int armor = defender.getArmorClass().getTotal();
        while (armor > 10) {
            damage--; // heavy armor soaks damage
            armor -= 5;
        }
        /* The terrain decides
           how much the lair helps. */
        switch (terrain) {
            case "cellar":
                damage += 1;
                break;
            case "lair":
                damage += 2;
                break;
            case "dungeon":
                damage += 3;
                break;
            default:
                break;
        }
        // damage = damage * 2;
        return damage < 0 || bonus < 0 ? 0 : damage;
    }

    public String describe(Creature creature) {
        String name = creature.getType().name().toLowerCase().trim().concat(" ");
        String id = creature.getId().toString().strip();
        return name + id;
    }

    public int safeRoll(Dice dice) {
        try {
            return IntStream.of(dice.hashCode()).map(value -> {
                if (value > 20) return 20;
                return value;
            }).sum();
        } catch (IllegalStateException exception) {
            return 1;
        } finally {
            rolls++;
        }
    }

    public List<Creature> initiativeOrder(List<Creature> creatures) {
        class Ranking {
            int rank(Creature creature) {
                return creature.initiative();
            }
        }
        // The first creature is ranked after the rest.
        List<Creature> rest = creatures.size() < 2 ? new ArrayList<>() : initiativeOrder(creatures.subList(1, creatures.size()));
        rest.add(new Ranking().rank(creatures.get(0)) % (rest.size() + 1), creatures.get(0));
        return rest;
    }

    public boolean isEmpty() {
        return rolls == 0;
    }
}
