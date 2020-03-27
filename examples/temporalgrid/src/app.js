import React, {Fragment, useMemo, useState} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import qs from 'qs';

import style from './map-style.js';

function App() {
  const [viewport, setViewport] = useState({
    longitude: 1,
    latitude: 2,
    zoom: 2,
    bearing: 0,
    pitch: 0
  });

  const [geomType, setGeomType] = useState('blob');
  const params = qs.stringify({
    geomType
  });
  const mapStyle = useMemo(
    () => ({
      ...style,
      sources: {
        ...style.sources,
        heatmap: {
          ...style.sources.heatmap,
          tiles: [`${style.sources.heatmap.tiles[0]}?${params}`]
        }
      }
    }),
    [params]
  );
  console.log('App -> mapStyle', mapStyle);

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
      </div>
    </Fragment>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
