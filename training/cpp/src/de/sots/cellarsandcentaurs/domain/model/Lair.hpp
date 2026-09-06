#pragma once

namespace de::sots::cellarsandcentaurs::domain::model {

class Creature;

class Lair {
public:
    explicit Lair(Creature* occupant) : occupant_{occupant} {}

    Creature* getOccupant() const noexcept { return occupant_; }
    bool isOccupied() const noexcept { return occupant_ != nullptr; }

private:
    Creature* occupant_;
};

}
