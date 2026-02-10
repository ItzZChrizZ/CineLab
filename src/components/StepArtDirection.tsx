import type { WizardState, WizardAction } from '../types/wizard'
import type { Library } from '../types/library'
import { SelectCard } from './ui/SelectCard'
import { InfoBox } from './ui/InfoBox'

interface StepArtDirectionProps {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  lib: Library
}

export function StepArtDirection({ state, dispatch, lib }: StepArtDirectionProps) {
  const genres = Object.keys(lib.photographers).sort()
  const artists = state.genre
    ? Object.keys(lib.photographers[state.genre]).sort()
    : []
  const selectedArtistInfo = state.genre && state.artist
    ? lib.photographers[state.genre][state.artist]
    : null

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 shrink-0">
        <h2 className="font-warbler text-3xl text-bone mb-2">Art Direction</h2>
        <p className="text-ash/60 text-sm">
          Choose a photographic genre and artist reference. Their color science,
          grain, and visual DNA will be infused into the final prompt.
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-6">
        {/* Col 1: Genre */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10 shrink-0">
            Genre
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1.5">
            {genres.map((genre) => {
              const count = Object.keys(lib.photographers[genre]).length
              return (
                <SelectCard
                  key={genre}
                  label={genre}
                  description={`${count} artists`}
                  isSelected={state.genre === genre}
                  onClick={() => dispatch({ type: "SET_GENRE", genre })}
                />
              )
            })}
          </div>
        </div>

        {/* Col 2: Artist */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10 shrink-0">
            Artist
          </h3>

          {!state.genre ? (
            <div className="border border-dashed border-ash/10 rounded-default p-8 text-center">
              <p className="text-ash/30 text-sm">Select a genre first</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-1.5">
              {artists.map((artist) => (
                <SelectCard
                  key={artist}
                  label={artist}
                  description={lib.photographers[state.genre!][artist].style}
                  secondaryText={lib.photographers[state.genre!][artist].vibe}
                  isSelected={state.artist === artist}
                  onClick={() => dispatch({ type: "SET_ARTIST", artist })}
                />
              ))}
            </div>
          )}

          {selectedArtistInfo && (
            <div className="shrink-0 mt-2">
              <InfoBox>
                <strong>{state.artist}</strong>
                <br />
                Style: {selectedArtistInfo.style}
                <br />
                Light: {selectedArtistInfo.lighting}
                <br />
                Vibe: {selectedArtistInfo.vibe}
              </InfoBox>
            </div>
          )}
        </div>

        {/* Col 3: Director's Notes */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-ash/60 text-xs font-medium uppercase tracking-wider mb-3 pb-1 border-b border-ash/10 shrink-0">
            Director's Notes
            <span className="text-ash/30 normal-case tracking-normal ml-2">(optional)</span>
          </h3>
          <textarea
            value={state.notes}
            onChange={(e) => dispatch({ type: "SET_NOTES", notes: e.target.value })}
            placeholder="Mood, skin details, textures, special instructions..."
            className="
              flex-1 min-h-0 w-full bg-obsidian text-bone text-sm
              border border-ash/10 rounded-default
              px-4 py-3 resize-none
              placeholder:text-ash/20
              focus:outline-none focus:border-ash/30
              transition-colors duration-150
            "
          />
        </div>
      </div>
    </div>
  )
}
