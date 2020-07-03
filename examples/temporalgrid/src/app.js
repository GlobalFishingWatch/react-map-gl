import 'babel-polyfill';
import React, {Fragment, useState, useMemo, useRef} from 'react';
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

  const [geomType, setGeomType] = useState('gridded');
  const [visible, setVisible] = useState(true);
  const layers = useMemo(
    () => [
      {id: 'background', type: Generators.Type.Background, color: '#00265c'},
      {
        id,
        type: Generators.Type.Heatmap,
        visible,
        tileset,
        geomType,
        serverSideFilter: undefined,
        // serverSideFilter: `vesselid IN ('ddef384a3-330b-0511-5c1d-6f8ed78de0ca')`,
        updateColorRampOnTimeChange: true,
        zoom: viewport.zoom,
        fetchStats: visible
      }
    ],
    [viewport, visible, geomType]
  );

  // TODO switch between debounced/not debounced time when using animated
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
          {/* hack to shut up timebar warning, will need to fix */}
          {NOOP}
        </TimebarComponent>
      </div>
      <div className="control-buttons">
        Using {geomType} visualization
        <button
          onClick={() => {
            setGeomType(geomType === 'gridded' ? 'blob' : 'gridded');
          }}
        >
          Toggle geomType
        </button>
        <button
          onClick={() => {
            setVisible(!visible);
          }}
        >
          Toggle visible
        </button>
      </div>
    </div>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
