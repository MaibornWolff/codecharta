using System;
using System.Collections.Generic;
using De.Sots.CellarsAndCentaurs.Domain.Model;
using De.Sots.CellarsAndCentaurs.Domain.Service;
using Dto = De.Sots.CellarsAndCentaurs.Application.Dto;

namespace De.Sots.CellarsAndCentaurs.Application;

[Lair("centaur-stable")]
public partial class CreatureFacade
{
    public static readonly CreatureType STANDARD_CREATURE_TYPE = CreatureType.Monstrosity;

    private const string DEFAULT_STABLE = "centaur-stable";

    private readonly CreatureService creatureService;

    public CreatureFacade(CreatureService creatureService)
    {
        this.creatureService = creatureService;
    }

    public Creature Create(
        CreatureType type,
        De.Sots.CellarsAndCentaurs.Domain.Model.Speed walkingSpeed,
        Speed flyingSpeed,
        Speed swimmingSpeed,
        Speed burrowingSpeed,
        Speed climbingSpeed,
        ArmorClass armorClass,
        int hitPointsValue)
    {
        // Rolls initiative for every creature in the dungeon before the encounter starts.
        var creature = new Creature(CreatureId.NewId(), type)
        {
            ArmorClass = armorClass,
            HitPoints = HitPoints.Init(hitPointsValue),
            Speeds = new Dictionary<SpeedType, Speed>
            {
                [SpeedType.Walking] = walkingSpeed,
                [SpeedType.Flying] = flyingSpeed,
                [SpeedType.Swimming] = swimmingSpeed,
                [SpeedType.Burrowing] = burrowingSpeed,
                [SpeedType.Climbing] = climbingSpeed
            }
        };
        creatureService.Save(creature);
        return creature;
    }

    public Dto.Creature Describe(CreatureId id)
    {
        var creature = creatureService.Find(id);
        return new Dto.Creature(
            creature.Id.Value.ToString(),
            creature.Type.ToString(),
            creature.HitPoints?.Current ?? 0,
            creature.ArmorClass?.Total ?? 0,
            creature.SpeedOf(SpeedType.Walking)?.FeetPerRound ?? 0);
    }

    public string StableName() => DEFAULT_STABLE;
}
