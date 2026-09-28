#pragma once

#include <string>
#include <vector>

#include "CreatureEntity.hpp"
#include "Repository.hpp"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

using Entity = CreatureEntity;

class CreatureRepository : public Repository<Entity> {
public:
    void save(const Entity& entity) { Repository<Entity>::save(entity.id, entity); }

    std::vector<Entity> findByType(const std::string& type) const {
        std::vector<Entity> matching;
        for (const Entity& entity : findAll()) {
            if (entity.type == type) {
                matching.push_back(entity);
            }
        }
        return matching;
    }
};

}
