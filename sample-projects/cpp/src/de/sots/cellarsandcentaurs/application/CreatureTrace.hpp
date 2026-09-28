#pragma once

#ifdef CELLARS_TRACE_ROLLS
#include "../domain/model/Dice.hpp"
#endif

namespace de::sots::cellarsandcentaurs::application {

class CreatureTrace {
public:
#ifdef CELLARS_TRACE_ROLLS
    int traceRoll() const { return traceDice_.roll().value; }

private:
    domain::model::Dice traceDice_{20};
#endif
};

}
