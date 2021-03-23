/* eslint max-statements: 0, complexity: 0 */
import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import MapGL from '@globalfishingwatch/react-map-gl';
import GFWAPI from '@globalfishingwatch/api-client';
import {render} from 'react-dom';
import {DateTime} from 'luxon';
import {Generators} from '@globalfishingwatch/layer-composer';
import {
  useLayerComposer,
  useDebounce,
  useMapClick
  // useMapHover
} from '@globalfishingwatch/react-hooks';
import TimebarComponent from '@globalfishingwatch/timebar';
import Tilesets from './tilesets';
import Login from './login';

export const DEFAULT_SUBLAYERS = [
  {
    id: 0,
    tilesAPI: 
      'https://dev-api-fourwings-tiler-jzzp2ui3wq-uc.a.run.app/v1',
    datasets: 'fd-water-temperature-palau',
    interval: 'month',
    filter: "",
    active: true,
    visible: true,
    breaks: [28, 28.2, 28.4, 28.6, 28.8, 29, 29.2, 29.4],
    breaksMultiplier: 1
  },
  // {
  //   id: 0,
  //   datasets: 'fishing_v5',
  //   filter: "flag='FRA'",
  //   active: true,
  //   visible: true
  // },
  {
    id: 1,
    datasets: 'indonesia-fishing:v20200320',
    filter: '',
    active: false,
    visible: true
  },
  {
    id: 2,
    datasets: 'fishing_v5',
    filter: "flag='ESP'",
    active: false,
    visible: true
  },
  {
    id: 3,
    datasets: 'fishing_v5',
    filter: "flag='GBR'",
    active: false,
    visible: true
  },
  {
    id: 4,
    datasets: 'fishing_v5',
    filter: "flag='PRT'",
    active: false,
    visible: true
  }
];

const DATAVIEWS = [
  {id: 'background', type: Generators.Type.Background, color: '#00265c'},
  {id: 'basemap', type: Generators.Type.Basemap},
  {
    id: 'eez',
    type: Generators.Type.CartoPolygons,
    color: 'red'
  },
  {
    id: 0,
    type: Generators.Type.HeatmapAnimated,
    colorRamp: 'teal',
    color: '#00FFBC',
    unit: 'fishing hours'
  },
  {
    id: 1,
    title: 'that second thing',
    type: Generators.Type.HeatmapAnimated,
    colorRamp: 'magenta',
    color: '#FF64CE',
    unit: 'fishing hours'
  },
  {
    id: 2,
    type: Generators.Type.HeatmapAnimated,
    colorRamp: 'yellow',
    color: '#FFEA00',
    unit: 'fishing hours'
  },
  {
    id: 3,
    type: Generators.Type.HeatmapAnimated,
    colorRamp: 'salmon',
    color: '#FFAE9B',
    unit: 'fishing hours'
  },
  {
    id: 4,
    type: Generators.Type.HeatmapAnimated,
    colorRamp: 'green',
    color: '#A6FF59',
    unit: 'fishing hours'
  }
];

const DEFAULT_TIME = {
  start: '2018-01-01T00:00:00.000Z',
  end: '2019-12-31T00:00:00.000Z'
};

const STATIC_TIME = {
  start: '2018-01-01T00:00:00.000Z',
  end: '2020-12-31T00:00:00.000Z'
};

const DEFAULT_VIEWPORT = {
  latitude: 6,
  longitude: 118,
  zoom: 5
}

const transformRequest = (url, resourceType) => {
  const response = {url};
  if (resourceType === 'Tile' && url.includes('globalfishingwatch')) {
    response.headers = {
      Authorization: `Bearer ${GFWAPI.getToken()}`
    };
  }
  return response;
};


export default function App() {
  const [time, setTime] = useState(DEFAULT_TIME);
  const [staticTime, setStaticTime] = useState(STATIC_TIME);
  const debouncedTime = useDebounce(time, 1000);

  const [sublayers, setSublayers] = useState(DEFAULT_SUBLAYERS);
  const [mode, setMode] = useState('compare');
  const [aggregationOperation, setAggregationOperation] = useState('avg');

  const [showBasemap, setShowBasemap] = useState(false);
  const [animated, setAnimated] = useState(true);
  const [debug, setDebug] = useState(false);
  const [debugLabels, setDebugLabels] = useState(false);
  const [mergeAsSublayers, setMergeAsSublayers] = useState(false);

  const [showInfo, setShowInfo] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);

  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null)
  const [isLoading, setLoading] = useState(false);

  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);

  const layers = useMemo(
    () => {
      let generators = [
        {...DATAVIEWS.find(dv => dv.id === 'background')}
        // {...DATAVIEWS.find(dv => dv.id === 'eez')}
      ];

      if (showBasemap) {
        generators.push({...DATAVIEWS.find(dv => dv.id === 'basemap')});
      }

      if (animated) {
        const heatmapSublayers = sublayers.filter(t => t.active).map(sublayer => {
          const heatmapSublayer = {...DATAVIEWS.find(dv => dv.id === sublayer.id)};
          let colorRamp = heatmapSublayer.colorRamp;
          if (sublayers.filter(t => t.active).length === 1) {
            colorRamp = 'teal';
          } else if (mode === 'bivariate') {
            colorRamp = 'bivariate';
          }
          const finalSublayer = {
            ...sublayer,
            colorRamp,
            // TODO API should support an array of tilesets for each sublayer
            datasets: sublayer.datasets.split(','),
          };
          return finalSublayer
        });

        let finalMode = mode;
        if (mode === 'blobOnPlay') {
          finalMode = isPlaying ? 'blob' : 'compare';
        }

        if (mergeAsSublayers) {
          generators.push({
            id: 'heatmap-animated',
            type: Generators.Type.HeatmapAnimated,
            sublayers: heatmapSublayers,
            mode: finalMode,
            aggregationOperation,
            debug,
            debugLabels,
            interactive: true,
          });
        } else {
          generators = [
            ...generators,
            ...heatmapSublayers.map((sub, i) => ({
              id: `heatmap-animated-${i}`,
              type: Generators.Type.HeatmapAnimated,
              sublayers: [heatmapSublayers[i]],
              mode: 'single',
              aggregationOperation,
              debug,
              debugLabels,
              interactive: true,
              interval: heatmapSublayers[i].interval,
              tilesAPI: heatmapSublayers[i].tilesAPI,
              breaksMultiplier: heatmapSublayers[i].breaksMultiplier,
            }))
          ]
        }
      } else {
        generators.push({
          id: 'heatmap',
          type: Generators.Type.Heatmap,
          tileset: sublayers.datasets[0][0],
          visible: true,
          geomType: 'gridded',
          serverSideFilter: undefined,
          // serverSideFilter: `vesselid IN ('ddef384a3-330b-0511-5c1d-6f8ed78de0ca')`,
          // zoom: viewport.zoom,
          fetchStats: true
        });
      }
      return generators;
    },
    [animated, showBasemap, debug, debugLabels, mergeAsSublayers, sublayers, mode, aggregationOperation, isPlaying, staticTime]
  );

  const globalConfig = useMemo(
    () => {
      const finalTime = animated ? time : debouncedTime;
      return {...finalTime, zoom: viewport.zoom};
    },
    [animated, time, debouncedTime, viewport.zoom]
  );

  const {style} = useLayerComposer(layers, globalConfig);

  const clickCallback = useCallback(event => {
    console.log('clicked', event);
  }, []);
  // const hoverCallback = useCallback(event => {
  //   console.log(event);
  // }, []);

  // TODO useMapInteraction has been removed
  // const { onMapClick, onMapHover } = useMapInteraction(clickCallback, hoverCallback, mapRef)

  const onMapClick = useMapClick(clickCallback, style && style.metadata);
  // const onMapHover = useMapHover(null, hoverCallback, mapRef, null, style && style.metadata);

  useEffect(
    () => {
      if (mapRef.current) {
        setMapInstance(mapRef.current.getMap());
      }
    },
    [mapRef.current]
  );

  if (mapInstance) {
    mapInstance.showTileBoundaries = debug;
    mapInstance.on('idle', () => {
      setLoading(false);
    });
    mapInstance.on('dataloading', () => {
      setLoading(true);
    });
  }

  return (
    <div className="container">
      {isLoading && <div className="loading">loading</div>}
      <div className="map">
        {style && (
          <MapGL
            {...viewport}
            ref={mapRef}
            width="100%"
            height="100%"
            mapStyle={style}
            onViewportChange={setViewport}
            onClick={e => { console.log(e.features) }}
            // onHover={onMapHover}
            interactiveLayerIds={style.metadata.interactiveLayerIds}
            transformRequest={transformRequest}
          />
        )}
      </div>
      <div className="timebar">
        <TimebarComponent
          start={time.start}
          end={time.end}
          absoluteStart={staticTime.start}
          absoluteEnd={staticTime.end}
          onChange={event => {
            if (event.source !== 'ZOOM_OUT_MOVE') {
              setStaticTime({start: event.start, end: event.end});
            }
            setTime({start: event.start, end: event.end});
          }}
          enablePlayback
          onTogglePlay={setIsPlaying}
        />
      </div>
      <div className="control-buttons">
        <Tilesets
          onChange={newTilesets => {
            setSublayers(newTilesets);
          }}
          allowIntervalChange={!mergeAsSublayers}
        />
        <hr />
        <fieldset>
          <input
            type="checkbox"
            id="showBasemap"
            checked={showBasemap}
            onChange={e => {
              setShowBasemap(e.target.checked);
            }}
          />
          <label htmlFor="showBasemap">basemap</label>
        </fieldset>
        <fieldset>
          <input
            type="checkbox"
            id="animated"
            checked={animated}
            onChange={e => {
              setAnimated(e.target.checked);
            }}
          />
          <label htmlFor="animated">animated</label>
        </fieldset>
        <fieldset>
          <input
            type="checkbox"
            id="debug"
            checked={debug}
            onChange={e => {
              setDebug(e.target.checked);
            }}
          />
          <label htmlFor="debug">debug</label>
        </fieldset>
        <fieldset>
          <input
            type="checkbox"
            id="debugLabels"
            checked={debugLabels}
            onChange={e => {
              setDebugLabels(e.target.checked);
            }}
          />
          <label htmlFor="debugLabels">debugLabels</label>
        </fieldset>
        <fieldset>
          <input
            type="checkbox"
            id="mergeAsSublayers"
            checked={mergeAsSublayers}
            onChange={e => {
              setMergeAsSublayers(e.target.checked);
            }}
          />
          <label htmlFor="mergeAsSublayers">merge as sublayers</label>
        </fieldset>

        <fieldset>
          <label htmlFor="mode">mode</label>
          <select
            id="mode"
            onChange={event => {
              setMode(event.target.value);
            }}
          >
            <option value="compare">compare</option>
            <option value="bivariate">bivariate</option>
            <option value="blob">blob</option>
            <option value="blobOnPlay">blob on play</option>
            <option value="extruded">extruded</option>
          </select>
        </fieldset>
        <fieldset>
          <label htmlFor="aggregationOperation">agg</label>
          <select
            id="aggregationOperation"
            onChange={event => {
              setAggregationOperation(event.target.value);
            }}
          >
            <option value="avg">avg</option>
            <option value="sum">sum</option>
          </select>
        </fieldset>
        <hr />

        <div className="info">
          <div>
            {DateTime.fromISO(time.start)
              .toUTC()
              .toLocaleString(DateTime.DATETIME_MED)}{' '}
            ↦{' '}
            {DateTime.fromISO(time.end)
              .toUTC()
              .toLocaleString(DateTime.DATETIME_MED)}
          </div>
          <button onClick={() => setShowInfo(!showInfo)}>more info ▾</button>
        </div>
        {showInfo && (
          <div>
            <div>
              <b>Active time chunks:</b>
            </div>
            {style &&
              style.metadata &&
              style.metadata.layers['heatmap-animated'] && (
                <pre>
                  {JSON.stringify(style.metadata.layers['heatmap-animated'].timeChunks, null, 2)}
                </pre>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export function renderToDom(container) {
  render(<Login />, container);
}
