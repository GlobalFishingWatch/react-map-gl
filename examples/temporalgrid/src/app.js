import 'babel-polyfill';
import React, {Fragment, useState, useMemo} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import { Generators } from '@globalfishingwatch/layer-composer';
import { useLayerComposer } from '@globalfishingwatch/react-hooks'

const id = 'heatmap';
const tileset = 'carriers_v8';

function App() {
  const [viewport, setViewport] = useState({
    longitude: -17.3163661,
    latitude: 16.3762596,
    zoom: 4.6424032
  });

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
        start: '2017-01-01T00:00:00.000Z',
        end: '2019-12-31T00:00:00.000Z',
        serverSideFilter: undefined,
        // serverSideFilter: `vesselid IN ('ddef384a3-330b-0511-5c1d-6f8ed78de0ca')`,
        updateColorRampOnTimeChange: true,
        singleFrame: true,
        colorRampMult: 0.01,
        zoom: viewport.zoom,
        fetchStats: visible
      }
    ],
    [viewport, visible, geomType]
  );

  const globalConfig = useMemo(
    () => ({
      start: '2019-01-01T00:00:00.000Z',
      end: '2020-01-01T00:00:00.000Z',
    }),
    []
  )

  const { style } = useLayerComposer(layers, globalConfig)

  return (
    <Fragment>
      <MapGL
        {...viewport}
        width="100vw"
        height="100vh"
        mapStyle={style}
        onViewportChange={nextViewport => setViewport(nextViewport)}
      />
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
    </Fragment>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
