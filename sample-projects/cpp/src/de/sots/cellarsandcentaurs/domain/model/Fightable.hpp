#pragma once

namespace de::sots::cellarsandcentaurs::domain::model {

class Fightable {
public:
    virtual ~Fightable() = default;
    virtual int attack() const = 0;
    virtual bool isAlive() const = 0;
};

}
