#pragma once

#include <string>

namespace de::sots::cellarsandcentaurs::adapter::persistence {

struct CreatureEntity {
    std::string id;
    std::string type;
    int hitPoints = 0;
};

}
