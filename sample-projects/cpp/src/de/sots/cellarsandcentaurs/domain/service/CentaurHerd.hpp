#pragma once

#include <cstddef>
#include <vector>

#include "../model/Centaur.hpp"

namespace de::sots::cellarsandcentaurs::domain::service {

class CentaurHerd {
public:
    std::size_t size() const noexcept { return members_.size(); }

private:
    std::vector<model::Centaur> members_;
};

}
