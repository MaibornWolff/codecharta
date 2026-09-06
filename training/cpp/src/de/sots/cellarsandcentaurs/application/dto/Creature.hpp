#pragma once

#include <string>

namespace de::sots::cellarsandcentaurs::application::dto {

struct Creature {
    std::string id;
    std::string type;
    int hitPoints = 0;
    int armorClass = 0;
};

}
