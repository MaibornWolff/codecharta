#include "../domain/model/Speed.hpp"

namespace de::sots::cellarsandcentaurs::variants {

// The chimera only leaves its nest at dusk.
class ChimeraNest {
public:
    int pace(const domain::model::Speed& speed) const {
        if (speed.getFeetPerRound() > 30) {
            return 2;
        }
        return 1;
    }
};

}
