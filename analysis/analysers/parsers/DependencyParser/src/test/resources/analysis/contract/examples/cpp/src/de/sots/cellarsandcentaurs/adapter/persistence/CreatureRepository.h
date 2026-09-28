#pragma once
#include <optional>
#include "CreatureEntity.h"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

class CreatureRepository {
public:
    virtual ~CreatureRepository() = default;
    virtual void save(const CreatureEntity&) = 0;
    virtual std::optional<CreatureEntity> findById(const std::string& id) const = 0;
};

}
