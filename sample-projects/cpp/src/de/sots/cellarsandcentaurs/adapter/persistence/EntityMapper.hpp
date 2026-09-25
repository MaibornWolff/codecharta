#pragma once

#include <string>

#include "CreatureEntity.hpp"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

typedef CreatureEntity Entity;

class EntityMapper {
public:
    static Entity fromId(const std::string& id) {
        Entity entity;
        entity.id = id;
        return entity;
    }
};

}
