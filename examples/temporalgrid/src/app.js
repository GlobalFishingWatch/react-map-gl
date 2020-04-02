import 'babel-polyfill';
import React, {Fragment, useState, useMemo} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
// import LayerComposer, {TYPES} from '@globalfishingwatch/layer-composer';
// import useLayerComposer from '@globalfishingwatch/map-components/components/layer-composer-hook';
import qs from 'qs';
import style from './map-style.js';

// const layerComposer = new LayerComposer();
// const id = 'heatmap';
// const tileset = 'carriers_v3';

function App() {
  const [viewport, setViewport] = useState({
    longitude: 1,
    latitude: 2,
    zoom: 2,
    bearing: 0,
    pitch: 0
  });

  const [geomType, setGeomType] = useState('gridded');
  const [visible, setVisible] = useState(true);
  // const layers = [
  //   {id: 'background', type: TYPES.BACKGROUND, color: '#00265c'},
  //   {
  //     type: TYPES.HEATMAP,
  //     id,
  //     tileset,
  //     start: '2017-01-01T00:00:00.000Z',
  //     end: '2018-12-31T00:00:00.000Z',
  //     zoom: viewport.zoom,
  //     visible,
  //     serverSideFilter: undefined,
  //     updateColorRampOnTimeChange: true,
  //     singleFrame: true,
  //     fetchStats: visible,
  //     colorRampMult: 0.01
  //   }
  // ];
  // const [mapStyle] = useLayerComposer(layerComposer, layers);
  const params = qs.stringify({
    geomType
  });
  const mapStyle = useMemo(
    () =>
      style.sources.heatmap
        ? {
            ...style,
            sources: {
              ...style.sources,
              heatmap: {
                ...style.sources.heatmap,
                tiles: [`${style.sources.heatmap.tiles[0]}?${params}`]
              }
            }
          }
        : style,
    []
  );

  return (
    <Fragment>
      <MapGL
        {...viewport}
        width="100vw"
        height="100vh"
        mapStyle={mapStyle}
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
