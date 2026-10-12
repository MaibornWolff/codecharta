#define CELLAR_DEBUG
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using De.Sots.CellarsAndCentaurs.Domain.Model;

namespace De.Sots.CellarsAndCentaurs.Domain.Service;

/// <summary>
/// Constructs a parser is likely to miscount. See <see cref="NoSuchCreatureException"/> for the failure case.
/// </summary>
public class EncounterEdgeCases
{
    private readonly List<Creature> members = new();
    private int morale;

    public EncounterEdgeCases(int morale)
    {
        this.morale = morale;
    }

    ~EncounterEdgeCases()
    {
        members.Clear();
    }

    public int Morale
    {
        get { return morale < 0 ? 0 : morale; }
        set
        {
            if (value > 100)
            {
                value = 100;
            }
            morale = value;
        }
    }

    public bool IsRouted => morale == 0;

    public Creature this[int position]
    {
        get { return members[position]; }
    }

    public int ForeachLoop(List<Creature> creatures)
    {
        int count = 0;
        foreach (Creature minotaur in creatures)
        {
            count++;
        }
        return count;
    }

    public int DoWhileLoop(int rolls)
    {
        int thrown = 0;
        do
        {
            thrown++;
        } while (thrown < rolls);
        return thrown;
    }

    public int SwitchExpression(Creature creature, int roll)
    {
        return creature switch
        {
            Centaur when roll > 15 => 3,
            Centaur stallion => stallion.Initiative(),
            { Type: CreatureType.Dragon } => 1,
            _ => 0,
        };
    }

    public string SwitchStatement(int roll)
    {
        switch (roll)
        {
            case 1:
            case 2:
                return "fumble";
            case int omen when omen >= 19:
                return "critical";
            default:
                return "hit";
        }
    }

    public bool PatternCombinators(int roll)
    {
        return roll is > 1 and < 20 or 42;
    }

    public string NullCoalescing(string? terrain)
    {
        return terrain ?? "cellar";
    }

    public string NullCoalescingAssignment(string? terrain)
    {
        terrain ??= "dungeon";
        return terrain;
    }

    public int? NullConditional(Creature? creature)
    {
        return creature?.HitPoints?.Current;
    }

    public string NestedTernary(int roll)
    {
        return roll > 15 ? "high" : roll > 5 ? "middle" : "low";
    }

    public int ExceptionFilter(Func<int> roll, int bonus)
    {
        try
        {
            return roll() + bonus;
        }
        catch (InvalidOperationException mishap) when (bonus > 0)
        {
            return mishap.HResult;
        }
        catch (Exception)
        {
            return 0;
        }
    }

    public IEnumerable<CreatureId> LinqQuery(List<Creature> creatures)
    {
        return from goblin in creatures
               where goblin.Speeds.Count > 0 && goblin.Initiative() > 10
               orderby goblin.Initiative()
               select goblin.Id;
    }

    public List<int> LinqChain(List<Creature> creatures)
    {
        return creatures.Where(wyvern => wyvern.Speeds.Count > 0).Select(wyvern => wyvern.Initiative()).OrderBy(score => score).Distinct().Take(3).ToList();
    }

    public int LocalFunction(int roll)
    {
        // TODO: /* not a block comment */ still one line comment
        return Parry(roll) + 1;

        static int Parry(int blow) => blow * 2;
    }

    public int ExpressionBodied(int roll) => roll > 10 ? roll : 10;

    public bool AnonymousDelegate(int roll)
    {
        Func<int, bool> isHit = delegate (int strike) { return strike > 10; };
        return isHit(roll);
    }

    public async Task<int> AwaitRoll(Task<int> roll)
    {
        return await roll;
    }

    public async Task<int> AwaitForeach(IAsyncEnumerable<int> rolls)
    {
        int sum = 0;
        await foreach (int pip in rolls)
        {
            sum += pip;
        }
        return sum;
    }

    public IEnumerable<int> YieldRolls(int count)
    {
        for (int index = 0; index < count; index++)
        {
            if (index > 20)
            {
                yield break;
            }
            yield return index;
        }
    }

    public int ParamsParameter(params ArmorClass[] classes)
    {
        return classes.Length;
    }

    public int OptionalParameters(int roll, int bonus = 0, string terrain = "cellar")
    {
        return roll + bonus + terrain.Length;
    }

    public bool OutAndRef(string text, out int parsed, ref int bonus)
    {
        bonus++;
        bool numeric = int.TryParse(text, out var plunder);
        parsed = plunder;
        return numeric;
    }

    public TQuarry Pick<TQuarry>(List<TQuarry> options) where TQuarry : Fightable
    {
        return options[0];
    }

    public (Speed gallop, int feet) TupleReturn(Creature creature)
    {
        var (trot, canter) = (creature.Speeds.Count, 2);
        return (default!, trot * canter);
    }

    public int DefaultLiteral()
    {
        return default(XPValue).GetHashCode();
    }

    public bool NegatedTypePattern(Creature creature)
    {
        SpeedType? fastest = null;
        return creature is not Tameable && fastest == null;
    }

    [Lair("ambush")]
    public bool ExtensionCall(Creature creature)
    {
        return creature.IsBloodied();
    }

    public int UnicodeIdentifier(Zentaurenhöhle cave)
    {
        return cave.Describe().Length;
    }

    public int GotoAndLabel(int roll)
    {
    retry:
        if (roll < 10)
        {
            roll += 5;
            goto retry;
        }
        return roll;
    }

    public int PreprocessorBranch(int roll)
    {
#if CELLAR_DEBUG
        if (roll > 20) { return 20; }
#else
        int moat = 1;
        if (roll < moat) { return moat; }
#endif
        return roll;
    }

    #region Catacombs

    public string VerbatimString()
    {
        return @"C:\cellar\crypt // not a comment ""quoted"" /* nor this */";
    }

    public string RawString()
    {
        return """
            // Dice.RollD20() behind the portcullis is not a comment
            /* nor is this */
            if (roll > 1 && roll < 20) { }
            """;
    }

    public string InterpolatedString(Creature creature)
    {
        return $"{creature.Id} was {(creature.Speeds.Count > 0 ? "fast" : "slow")} // ambushed, not a comment";
    }

    #endregion

    /**
     * Javadoc-style documentation comment, legal in C#: the sarcophagus stays shut.
     */
    public bool DelimitedDocComment()
    {
        return true;
    }

    /// <summary>Single-line summary with a <c>code</c> tag.</summary>
    /// <param name="roll">the roll to keep</param>
    /// <returns>the same roll</returns>
    public int XmlDocComment(int roll)
    {
        return roll; /* trailing block */ // and trailing line
    }
}

public class EncounterLog(string chronicle, int capacity)
{
    public string Headline() => chronicle.Trim() + capacity;
}

public readonly record struct Ambush(int Skirmishers)
{
    public static Ambush operator +(Ambush left, Ambush right) => new(left.Skirmishers + right.Skirmishers);

    public static implicit operator int(Ambush ambush) => ambush.Skirmishers;
}
