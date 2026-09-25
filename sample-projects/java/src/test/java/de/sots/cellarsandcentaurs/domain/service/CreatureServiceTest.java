package de.sots.cellarsandcentaurs.domain.service;

import de.sots.cellarsandcentaurs.domain.model.Creature;
import de.sots.cellarsandcentaurs.domain.model.CreatureId;
import de.sots.cellarsandcentaurs.domain.model.Speed;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CreatureServiceTest {
    @Mock
    private Creatures creatures;

    @Test
    void should_save_creature_to_the_stable() {
        // Arrange
        var walking_speed = new Speed(30);
        var creature = new Creature(CreatureId.random());
        var service = new CreatureService(creatures);

        // Act
        service.save(creature);

        // Assert
        verify(creatures).save(creature);
    }
}
