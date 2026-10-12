<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

// Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
final class Zentaurenhöhle
{
    private ?ArmorClass $rüstungsklasse = null;

    public function describe(): string
    {
        return 'Größe der Höhle';
    }
}
