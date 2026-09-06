using De.Sots.CellarsAndCentaurs.Domain.Model;
using De.Sots.CellarsAndCentaurs.Domain.Service;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using Xunit;

namespace De.Sots.CellarsAndCentaurs.Tests.Domain.Service;

public class CreatureServiceTests
{
    [Fact]
    public void should_save_creature_to_the_stable()
    {
        // Arrange
        var creatures = Substitute.For<Creatures>();
        var service = new CreatureService(creatures, NullLogger<CreatureService>.Instance);
        var walking_speed = Speed.Of(30);
        var xp_value = new XPValue(10);
        var creature = new Creature(CreatureId.NewId(), CreatureType.Beast)
        {
            Speeds = { [SpeedType.Walking] = walking_speed }
        };

        // Act
        service.Save(creature);

        // Assert
        creatures.Received().Save(creature);
        Assert.Equal(10, xp_value.Points);
    }
}
