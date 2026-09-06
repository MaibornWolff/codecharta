# frozen_string_literal: true

module De::Sots::CellarsAndCentaurs::Application
  module Summoner
    def self.summon_centaur(id)
      De::Sots::CellarsAndCentaurs::Domain::Model.const_get('Centaur').new(id)
    end
  end
end
