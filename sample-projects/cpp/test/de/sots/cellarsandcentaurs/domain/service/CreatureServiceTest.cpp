#include <gtest/gtest.h>
#include <memory>
#include <vector>

#include "de/sots/cellarsandcentaurs/domain/model/Creature.hpp"
#include "de/sots/cellarsandcentaurs/domain/model/CreatureId.hpp"
#include "de/sots/cellarsandcentaurs/domain/model/NoSuchCreatureException.hpp"
#include "de/sots/cellarsandcentaurs/domain/model/Speed.hpp"
#include "de/sots/cellarsandcentaurs/domain/service/CreatureService.hpp"
#include "de/sots/cellarsandcentaurs/domain/service/Creatures.hpp"

namespace de::sots::cellarsandcentaurs::domain::service {

class InMemoryCreatures : public Creatures {
public:
    void save(const model::Creature& creature) override { saved.push_back(creature); }

    model::Creature find(const model::CreatureId& id) override {
        for (const model::Creature& creature : saved) {
            if (creature.getId() == id) {
                return creature;
            }
        }
        throw model::NoSuchCreatureException(id);
    }

    std::vector<model::Creature> saved;
};

TEST(CreatureServiceTest, should_save_creature_to_the_stable) {
    // Arrange
    auto creatures = std::make_shared<InMemoryCreatures>();
    CreatureService service(creatures);
    model::Speed walking_speed(30);
    model::Creature centaur(model::CreatureId("centaur-1"), model::CreatureType::MONSTROSITY);
    centaur.setSpeeds({{model::SpeedType::WALKING, walking_speed}});

    // Act
    service.save(centaur);

    // Assert
    ASSERT_EQ(1u, creatures->saved.size());
    EXPECT_EQ("centaur-1", service.find(model::CreatureId("centaur-1")).getId().value());
}

TEST(CreatureServiceTest, should_throw_when_creature_id_is_unknown) {
    // Arrange
    CreatureService service(std::make_shared<InMemoryCreatures>());

    // Act & Assert
    EXPECT_THROW(service.find(model::CreatureId("unknown")), model::NoSuchCreatureException);
}

}
