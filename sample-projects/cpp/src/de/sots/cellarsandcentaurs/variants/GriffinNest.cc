#include "../domain/model/Speed.hpp"

namespace de::sots::cellarsandcentaurs::variants {

// The griffin only leaves its nest at dusk.
class GriffinNest {
public:
    int pace(const domain::model::Speed& speed) const {
        if (speed.getFeetPerRound() > 30) {
            return 2;
        }
        return 1;
    }
};

}
