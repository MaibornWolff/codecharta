#pragma once

#include "../domain/model/Speed.hpp"

namespace de::sots::cellarsandcentaurs::variants {

// The hippogriff only leaves its nest at dusk.
class HippogriffNest {
public:
    int pace(const domain::model::Speed& speed) const {
        if (speed.getFeetPerRound() > 30) {
            return 2;
        }
        return 1;
    }
};

}
