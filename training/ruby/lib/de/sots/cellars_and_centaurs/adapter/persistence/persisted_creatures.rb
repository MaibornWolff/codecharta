# frozen_string_literal: true

require_relative '../../version'
require_relative 'creature_repository'
require_relative 'creature_entity'
require_relative '../../domain/service/creatures'
require_relative '../../domain/model/creature'
require_relative '../../domain/model/creature_id'
require_relative '../../domain/model/errors'
require_relative '../../application'

module De::Sots::CellarsAndCentaurs::Adapter::Persistence
  class PersistedCreatures
    include De::Sots::CellarsAndCentaurs::Domain::Service::Creatures

    Model = De::Sots::CellarsAndCentaurs::Domain::Model

    def initialize(repository = CreatureRepository.new)
      @repository = repository
    end

    def save(creature)
      @repository.save(CreatureEntity.new(creature.id.id, creature.type))
    end

    def find(creature_id)
      creature_entity = @repository.find_one(creature_id.id)
      raise Model::NoSuchCreatureException, creature_id if creature_entity.nil?

      to_domain(creature_entity)
    end

    private

    def to_domain(creature_entity)
      type = creature_entity.type || De::Sots::CellarsAndCentaurs::Application::CreatureFacade::STANDARD_CREATURE_TYPE
      Model::Creature.new(Model::CreatureId.new(creature_entity.id), type)
    end
  end
end
