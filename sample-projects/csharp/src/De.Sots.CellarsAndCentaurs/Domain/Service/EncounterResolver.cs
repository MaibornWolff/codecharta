using System;
using System.Collections.Generic;
using System.Linq;
using De.Sots.CellarsAndCentaurs.Domain.Model;

namespace De.Sots.CellarsAndCentaurs.Domain.Service;

/// <summary>
/// Resolves one encounter between two creatures.
/// The attacker rolls against the armor class of the defender.
/// Terrain and speed decide how much of the damage lands.
/// A natural twenty always hits, a natural one never does.
/// </summary>
public class EncounterResolver
{
    private readonly List<Creature> pending = new();

    public int Resolve(Creature attacker, Creature defender, int roll, int bonus, string terrain)
    {
        // a natural one always misses
        if (roll == 1)
        {
            return 0;
        }
        else if (roll == 20)
        {
            bonus += 10;
        }
        else
        {
            bonus -= 1;
        }

        int reach = 0;
        // the fastest usable speed decides the reach
        for (int index = 0; index < attacker.Speeds.Count; index++)
        {
            Speed speed = attacker.Speeds.Values.ElementAt(index);
            if (speed.FeetPerRound > reach && speed.FeetPerRound < 120)
            {
                reach = speed.FeetPerRound;
            }
        }

        int damage = roll + bonus;
        while (damage > HitPoints.MAX_HIT_POINTS)
        {
            damage -= 10;
        }

        /* difficult terrain halves the damage,
           open ground adds the reach bonus */
        switch (terrain)
        {
            case "swamp":
                damage /= 2;
                break;
            case "cellar":
                damage -= 1;
                break;
            case "plain":
                damage += reach / 10;
                break;
            default:
                break;
        }

        int total = damage > 0 ? damage : 0; // never heal the defender
        if (defender.HitPoints == null || total == 0)
        {
            return 0;
        }
        // defender.TakeDamage(total * 2);
        defender.TakeDamage(total);
        return total;
    }

    public string Describe(Creature creature)
    {
        string kind = creature.Type.ToString().Trim().ToLowerInvariant().Replace('_', ' ').PadRight(12);
        string tag = creature.Id.ToString().Substring(0, 8).ToUpperInvariant();
        return kind + tag;
    }

    public int SafeRoll(Func<int, DiceRoll> dice)
    {
        Action<int> check = value =>
        {
            if (value > 20) { throw new InvalidOperationException("loaded dice"); }
        };
        try { check(dice(20).Value); return dice(20).Value; }
        catch (InvalidOperationException) { return 1; }
        finally { pending.Clear(); }
    }

    public List<Creature> InitiativeOrder(List<Creature> creatures)
    {
        int Compare(Creature left, Creature right) => right.Initiative() - left.Initiative();

        // a single creature is already in order
        if (creatures.Count <= 1) { return creatures; }
        List<Creature> rest = InitiativeOrder(creatures.GetRange(1, creatures.Count - 1));
        rest.Add(creatures[0]);
        rest.Sort(Compare);
        return rest;
    }

    public bool IsEmpty()
    {
        return pending.Count == 0;
    }
}
