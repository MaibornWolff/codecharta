# frozen_string_literal: true

require 'spec_helper'

require_relative '../../../../../../lib/de/sots/cellars_and_centaurs/domain/service/creature_service'
require_relative '../../../../../../lib/de/sots/cellars_and_centaurs/domain/model/creature'
require_relative '../../../../../../lib/de/sots/cellars_and_centaurs/domain/model/creature_id'
require_relative '../../../../../../lib/de/sots/cellars_and_centaurs/domain/model/speed'

RSpec.describe De::Sots::CellarsAndCentaurs::Domain::Service::CreatureService do
  let(:creatures) { instance_double(De::Sots::CellarsAndCentaurs::Domain::Service::Creatures, save: nil) }
  let(:creature_service) { described_class.new(creatures, Logger.new(nil)) }

  it 'should_save_creature_to_the_stable' do
    # Arrange
    walkingSpeed = De::Sots::CellarsAndCentaurs::Domain::Model::Speed.new(40)
    creature = De::Sots::CellarsAndCentaurs::Domain::Model::Creature.new(
      De::Sots::CellarsAndCentaurs::Domain::Model::CreatureId.new('centaur-1')
    )
    creature.speeds = { walking: walkingSpeed }

    # Act
    creature_service.save(creature)

    # Assert
    expect(creatures).to have_received(:save).with(creature)
  end
end
