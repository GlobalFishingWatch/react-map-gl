/* eslint max-statements: 0 */
import 'babel-polyfill';
import React, {useState, useMemo, useRef, useCallback} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import { DateTime } from 'luxon'
import { Generators } from '@globalfishingwatch/layer-composer';
import { useLayerComposer, useDebounce, useMapInteraction } from '@globalfishingwatch/react-hooks';
import TimebarComponent from '@globalfishingwatch/timebar';
import Tilesets from './tilesets';

export const DEFAULT_TILESETS = [
  { 
    // tileset: 'carriers_v8',
    tileset: 'fishing_v4',
    // filter: ''
    filter: "flag='ESP'",
    active: true
  },
  { 
    tileset: 'fishing_v4',
    filter: "flag='FRA'",
    active: false
  },
  { 
    tileset: 'fishing_v4',
    filter: "flag='ITA'",
    active: false
  },
  { 
    tileset: 'fishing_v4',
    filter: "flag='GBR'",
    active: false
  },
  { 
    tileset: 'fishing_v4',
    filter: "flag='PRT'",
    active: false
  }
]

const TEST_GEO_JSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              -12.65625,
              41.244772343082076
            ],
            [
              -3.69140625,
              41.11246878918088
            ],
            [
              -5.2734375,
              44.715513732021336
            ],
            [
              -7.03125,
              46.92025531537451
            ],
            [
              -10.8984375,
              45.706179285330855
            ],
            [
              -12.65625,
              41.244772343082076
            ]
          ]
        ]
      }
    }
  ]
}



export default function App() {
  const [viewport, setViewport] = useState({
    longitude: -6,
    latitude: 47,
    zoom: 4.6424032
  });

  const [time, setTime] = useState({
    start: '2012-10-01T00:00:00.000Z',
    end: '2012-11-01T00:00:00.000Z',
  })
  const debouncedTime = useDebounce(time, 1000)

  const [tilesets, setTilesets] = useState(DEFAULT_TILESETS)
  const [combinationMode, setCombinationMode] = useState('add')

  const [showBasemap, setShowBasemap] = useState(true)
  const [animated, setAnimated] = useState(true)
  const [debug, setDebug] = useState(false)
  const [debugLabels, setDebugLabels] = useState(false)
  const [geomTypeMode, setGeomTypeMode] = useState('gridded')
  
  const [showInfo, setShowInfo] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)

  const [isLoading, setLoading] = useState(false)
  
  const layers = useMemo(
    () => {
      const generators = [
        {id: 'background', type: Generators.Type.Background, color: '#00265c'}
      ]

      if (showBasemap) {
        generators.push({id: 'basemap', type: Generators.Type.Basemap, basemap: 'landmass' })
      }

      if (animated) {

        let geomType = geomTypeMode
        if (geomType === 'blobOnPlay') {
          geomType = (isPlaying) ? 'blob' : 'gridded'
        }
        const activeTilesets = tilesets.filter(t => t.active)
        const colorRamps = (activeTilesets.length === 1 || combinationMode === 'add')
          ? ['presence']
          : ['sky', 'magenta', 'yellow', 'salmon', 'green'].slice(0, activeTilesets.length) 
        generators.push({
          id: 'heatmap-animated',
          type: Generators.Type.HeatmapAnimated,
          tilesets: activeTilesets.map(t => t.tileset),
          filters: activeTilesets.map(t => t.filter),
          debug,
          debugLabels,
          geomType,
          // tilesAPI: 'https://fourwings.api.dev.globalfishingwatch.org/v1'
          tilesAPI: ' https://fourwings-tile-server-jzzp2ui3wq-uc.a.run.app/v1/datasets',
          combinationMode,
          colorRamps,
        })
      } else {
        generators.push({
          id: 'heatmap',
          type: Generators.Type.Heatmap,
          tileset: tilesets.tileset[0],
          visible: true,
          geomType: 'gridded',
          serverSideFilter: undefined,
          // serverSideFilter: `vesselid IN ('ddef384a3-330b-0511-5c1d-6f8ed78de0ca')`,
          updateColorRampOnTimeChange: true,
          zoom: viewport.zoom,
          fetchStats: true
        })
      }

    return generators
  },
    [animated, viewport, showBasemap, debug, debugLabels, tilesets, geomTypeMode, isPlaying, combinationMode]
  );

  const mapRef = useRef(null)


  // const [highlightedFeature, setHighlightedFeature] = useState(null)
  const clickCallback = useCallback((feature) => {
    // probably dispatch a redux action here or whatever
    console.log(feature)
  })
  const hoverCallback = useCallback((feature) => {
    // console.log(feature)
    // // setHighlightedFeature(feature)
    // if (feature) {
    //   console.log({
    //     source: feature.source,
    //     id: feature.featureStateId,
    //   })
    // }
  })

  const { onMapClick, onMapHover } = useMapInteraction(clickCallback, hoverCallback, (mapRef && mapRef.current) ? mapRef.current.getMap() : null)

  const globalConfig = useMemo(() => {
    const finalTime = (animated) ? time: debouncedTime
    return { ...finalTime }
  }, [animated, time, debouncedTime])

  const { style } = useLayerComposer(layers, globalConfig)
  const customStyle = useMemo(() => {
    if (!style) return null
    return {
      ...style,
      sources: {
        ...style.sources,
        'test': {
          type: 'geojson',
          data: TEST_GEO_JSON,
          generateId: true,
        }
      },
      layers: [
        ...style.layers,
        {
          id: 'test',
          source: 'test',
          type: 'fill',
          paint: {
            'fill-color': 'rgba(0,0,0,0)',
            'fill-outline-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#ffffff',
              '#000000',
            ]
          }
        }
      ]
    }
  }, [style])

  if (mapRef && mapRef.current) {
    mapRef.current.getMap().showTileBoundaries = debug
    mapRef.current.getMap().on('idle', () =>  {
      setLoading(false)
    })
    mapRef.current.getMap().on('dataloading', () =>  {
      setLoading(true)
    })
  }

  return (
    <div className="container">
      {isLoading && <div className="loading">loading</div>}
      <div className="map">
        {customStyle && <MapGL
          {...viewport}
          ref={mapRef}
          width="100%"
          height="100%"
          mapStyle={customStyle}
          onViewportChange={nextViewport => setViewport(nextViewport)}
          onClick={onMapClick}
          onHover={onMapHover}
          interactiveLayerIds={[...customStyle.metadata.interactiveLayerIds, 'test']}
        />}
        
      </div>
      <div className="timebar">
        <TimebarComponent
          start={time.start}
          end={time.end}
          absoluteStart={'2012-01-01T00:00:00.000Z'}
          absoluteEnd={'2020-01-01T00:00:00.000Z'}
          onChange={(start, end) => {
            setTime({start,end})
          }}
          enablePlayback
          onTogglePlay={setIsPlaying}
        >
          {/* TODO hack to shut up timebar warning, will need to fix in Timebar */}

        </TimebarComponent>
      </div>
      <div className="control-buttons">
        <Tilesets onChange={(newTilesets, newCombinationMode) => { setTilesets(newTilesets); setCombinationMode(newCombinationMode) }} />
        <hr />
        <fieldset>
          <input type="checkbox" id="showBasemap" checked={showBasemap} onChange={(e) => {
            setShowBasemap(e.target.checked)
          }} />
          <label htmlFor="showBasemap">basemap</label>
        </fieldset>
        <fieldset>
          <input type="checkbox" id="animated" checked={animated} onChange={(e) => {
            setAnimated(e.target.checked)
          }} />
          <label htmlFor="animated">animated</label>
        </fieldset>
        <fieldset>
          <input type="checkbox" id="debug" checked={debug} onChange={(e) => {
            setDebug(e.target.checked)
          }} />
          <label htmlFor="debug">debug</label>
        </fieldset>
        <fieldset>
          <input type="checkbox" id="debugLabels" checked={debugLabels} onChange={(e) => {
            setDebugLabels(e.target.checked)
          }} />
          <label htmlFor="debugLabels">debugLabels</label>
        </fieldset>

        <fieldset>
          <select id="geom" onChange={(event) => { setGeomTypeMode(event.target.value)}}>
            <option value="gridded">geom:gridded</option>
            <option value="blob">geom:blob</option>
            <option value="blobOnPlay">geom:blob on play</option>
          </select>
        </fieldset>
        <hr />

        <div className="info">
          <div>{DateTime.fromISO(time.start).toUTC().toLocaleString(DateTime.DATETIME_MED)} ↦ {DateTime.fromISO(time.end).toUTC().toLocaleString(DateTime.DATETIME_MED)}</div>
          <button onClick={() => setShowInfo(!showInfo)}>more info ▾</button>
        </div>
        {showInfo && <div>
          <div><b>Active time chunks:</b></div>
          {style && style.metadata && style.metadata.layers['heatmap-animated'] && <pre>{JSON.stringify(style.metadata.layers['heatmap-animated'].timeChunks, null, 2)}</pre>}
        </div>}
      </div>
    </div>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
