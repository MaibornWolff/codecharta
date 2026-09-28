#pragma once
#include <string>

namespace de::sots::cellarsandcentaurs::adapter::persistence {

class CreatureEntity {
    std::string id_;
public:
    CreatureEntity() = default;
    explicit CreatureEntity(const std::string& id) : id_{id} {}
    const std::string& getId() const noexcept { return id_; }
};

}
