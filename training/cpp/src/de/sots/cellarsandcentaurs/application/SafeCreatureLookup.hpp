#pragma once

#include <optional>

#include "../domain/model/Creature.hpp"
#include "../domain/model/CreatureId.hpp"
#include "../domain/model/NoSuchCreatureException.hpp"
#include "../domain/service/CreatureService.hpp"

namespace de::sots::cellarsandcentaurs::application {

class SafeCreatureLookup {
public:
    static std::optional<domain::model::Creature> find(
        domain::service::CreatureService& service,
        const domain::model::CreatureId& id) {
        try {
            return service.find(id);
        } catch (const domain::model::NoSuchCreatureException&) {
            return std::nullopt;
        }
    }
};

}
