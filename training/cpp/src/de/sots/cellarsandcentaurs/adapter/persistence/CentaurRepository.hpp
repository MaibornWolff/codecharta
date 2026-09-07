#pragma once

#include <string>
#include <vector>

#include "../../domain/model/Centaur.hpp"
#include "Repository.hpp"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

template <>
class Repository<domain::model::Centaur> {
public:
    void save(const std::string& id) { ids_.push_back(id); }
    std::vector<std::string> findAll() const { return ids_; }

private:
    std::vector<std::string> ids_;
};

}
