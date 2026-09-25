# frozen_string_literal: true

require_relative '../../version'
require_relative 'repository'
require_relative 'creature_entity'

module De::Sots::CellarsAndCentaurs::Adapter::Persistence
  Entity = CreatureEntity

  class CreatureRepository < Repository
    def find_all
      to_a
    end

    def find_by_type(type)
      select { |entity| entity.type == type }
    end

    private

    def key_of(entity)
      raise ArgumentError, 'not an entity' unless entity.is_a?(Entity)

      entity.id
    end
  end
end
