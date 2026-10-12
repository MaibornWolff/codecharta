# frozen_string_literal: true

require_relative 'lib/cellars_and_centaurs'
require_relative 'lib/de/sots/cellars_and_centaurs/domain/service/encounter_resolver'

# Serves the roster of the wandering menagerie as plain text.
run lambda { |env|
  resolver = De::Sots::CellarsAndCentaurs::Domain::Service::EncounterResolver.new
  body = resolver.empty? ? 'The paddock is quiet' : 'The paddock is guarded'
  [200, { 'content-type' => 'text/plain' }, [body]]
}
