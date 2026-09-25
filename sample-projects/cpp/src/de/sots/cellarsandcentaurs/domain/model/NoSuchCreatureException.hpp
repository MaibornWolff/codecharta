#pragma once

#include <stdexcept>
#include <string>

#include "CreatureId.hpp"

namespace de::sots::cellarsandcentaurs::domain::model {

class NoSuchCreatureException : public std::runtime_error {
public:
    explicit NoSuchCreatureException(const CreatureId& id)
        : std::runtime_error(std::string("No such creature in the dungeon: ") + id.value()) {}
};

}
