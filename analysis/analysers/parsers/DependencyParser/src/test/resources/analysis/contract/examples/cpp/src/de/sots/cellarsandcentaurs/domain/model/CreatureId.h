#pragma once
#include <string>

namespace de::sots::cellarsandcentaurs::domain::model {

class CreatureId {
    std::string id_;
public:
    explicit CreatureId(std::string id) : id_{std::move(id)} {}
    const std::string& id() const noexcept { return id_; }
};

}
