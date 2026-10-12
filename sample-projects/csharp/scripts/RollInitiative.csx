#r "nuget: Microsoft.Extensions.Logging.Abstractions, 8.0.0"
#load "../src/De.Sots.CellarsAndCentaurs/Domain/Model/Dice.cs"
using De.Sots.CellarsAndCentaurs.Domain.Model;

// the scriptorium keeps the initiative ledger
int RollInitiative(int bonus)
{
    return Dice.RollD20() + bonus;
}

Console.WriteLine(RollInitiative(2));
