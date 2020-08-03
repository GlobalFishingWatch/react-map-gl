## Example: Temporal grid

This app reproduces GlobalFishingWatch custom [temporalgrid source type](https://github.com/GlobalFishingWatch/mapbox-gl-js/tree/temporalgrid)

### Develop

Here's what you need to do to get fourwings temporal grid running in dev in GFW Mapbox GL JS fork:

- clone https://github.com/GlobalFishingWatch/mapbox-gl-js/tree/temporalgrid) and `yarn link`
- in the mapbox-gl-js folder, run `yarn watch-dev` to run Rollup in watch mode
- cd to this repo's example folder ie `cd examples/temporalgrid` then link MGL JS source with `yarn link "@globalfishingwatch/mapbox-gl"`
- run `yarn start-local` to run webpack dev server

