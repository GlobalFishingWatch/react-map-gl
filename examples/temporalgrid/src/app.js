import 'babel-polyfill';
import React, {useState, useMemo, useRef} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
// import LayerComposer, {TYPES} from '@globalfishingwatch/layer-composer';
// import useLayerComposer from '@globalfishingwatch/map-components/components/layer-composer-hook';
import qs from 'qs';
import { Generators } from '@globalfishingwatch/layer-composer';
import { useLayerComposer, useDebounce } from '@globalfishingwatch/react-hooks';
import TimebarComponent from '@globalfishingwatch/timebar';

const id = 'heatmap';
const tileset = 'carriers_v8';

const NOOP = () => {}

function App() {
  const [viewport, setViewport] = useState({
    longitude: -17.3163661,
    latitude: 16.3762596,
    zoom: 4.6424032
  });

  const [time, setTime] = useState({
    start: '2019-01-01T00:00:00.000Z',
    end: '2020-01-01T00:00:00.000Z',
  })

  const debouncedTime = useDebounce(time, 1000)

  const [showBasemap, setShowBasemap] = useState(false);
  const layers = useMemo(
    () => {
      const generators = [
        {id: 'background', type: Generators.Type.Background, color: '#00265c'}
      ]

      if (showBasemap) {
        generators.push({id: 'basemap', type: Generators.Type.Basemap, basemap: 'landmass' })
      }

      generators.push({
        id,
        type: Generators.Type.Heatmap,
        tileset,
        visible: true,
        geomType: 'gridded',
        serverSideFilter: undefined,
        // serverSideFilter: `vesselid IN ('ddef384a3-330b-0511-5c1d-6f8ed78de0ca')`,
        updateColorRampOnTimeChange: true,
        zoom: viewport.zoom,
        fetchStats: true
      })

    return generators
  },
    [viewport, showBasemap]
  );

  // TODO switch between debounced/immediate/throttled time when using animated
  const { style } = useLayerComposer(layers, debouncedTime)

  const mapRef = useRef(null)
  if (mapRef && mapRef.current) {
    mapRef.current.getMap().showTileBoundaries = true
  }

  return (
    <div className="container">
      <div className="map">
        <MapGL
          {...viewport}
          ref={mapRef}
          width="100%"
          height="100%"
          mapStyle={style}
          onViewportChange={nextViewport => setViewport(nextViewport)}
        />
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
        >
          {/* TODO hack to shut up timebar warning, will need to fix in Timebar */}
          {NOOP}
        </TimebarComponent>
      </div>
      <div className="control-buttons">
        <input type="checkbox" id="showBasemap" checked={showBasemap} onChange={(e) => {
          setShowBasemap(e.target.checked)
        }} />
        <label htmlFor="showBasemap">basemap</label>
      </div>
    </div>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
