<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Tests\Domain\Service;

use De\Sots\CellarsAndCentaurs\Domain\Model\Creature;
use De\Sots\CellarsAndCentaurs\Domain\Model\CreatureId;
use De\Sots\CellarsAndCentaurs\Domain\Model\Speed;
use De\Sots\CellarsAndCentaurs\Domain\Model\SpeedType;
use De\Sots\CellarsAndCentaurs\Domain\Service\Creatures;
use De\Sots\CellarsAndCentaurs\Domain\Service\CreatureService;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;

final class CreatureServiceTest extends TestCase
{
    public function test_should_save_creature_to_the_stable(): void
    {
        $creatures = $this->createMock(Creatures::class);
        $creatures->expects($this->once())->method('save');
        $service = new CreatureService($creatures, new NullLogger());
        $creature = new Creature(new CreatureId('centaur-1'));
        $walking_speed = new Speed(40);
        $creature->setSpeed(SpeedType::WALKING, $walking_speed);

        $service->save($creature);
    }
}
