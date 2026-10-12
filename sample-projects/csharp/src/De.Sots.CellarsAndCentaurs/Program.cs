using De.Sots.CellarsAndCentaurs.Domain.Model;

Creature wanderer = new Centaur(CreatureId.NewId());
if (args.Length > 0 && args[0] == "roll")
{
    Console.WriteLine(Announce(wanderer));
}

static string Announce(Creature creature) => $"A {creature.Type} enters the cellar";
