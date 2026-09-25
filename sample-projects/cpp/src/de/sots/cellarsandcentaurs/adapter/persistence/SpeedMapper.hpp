#pragma once

#include "../../domain/model/Speed.hpp"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

namespace model = de::sots::cellarsandcentaurs::domain::model;

class SpeedMapper {
public:
    static model::Speed toSpeed(int feetPerRound) { return model::Speed(feetPerRound); }
    static int toFeetPerRound(const model::Speed& speed) { return speed.getFeetPerRound(); }
};

}
