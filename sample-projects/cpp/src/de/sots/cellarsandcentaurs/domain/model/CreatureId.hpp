#pragma once

#include <string>

namespace de::sots::cellarsandcentaurs::domain::model {

class CreatureId {
public:
    explicit CreatureId(std::string value) : value_{std::move(value)} {}

    const std::string& value() const noexcept { return value_; }

    bool operator==(const CreatureId& other) const noexcept { return value_ == other.value_; }

private:
    std::string value_;
};

}
