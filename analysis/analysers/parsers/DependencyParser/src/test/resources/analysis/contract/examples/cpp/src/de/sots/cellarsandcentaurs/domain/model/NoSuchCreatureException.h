#pragma once
#include <stdexcept>
#include "CreatureId.h"

namespace de::sots::cellarsandcentaurs::domain::model {

class NoSuchCreatureException : public std::runtime_error {
public:
    explicit NoSuchCreatureException(const CreatureId& id)
        : std::runtime_error(id.id()) {}
};

}
