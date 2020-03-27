const apiTilesUrl = 'https://fst-tiles-jzzp2ui3wq-uc.a.run.app/v1';
const tileset = 'carriers_v2';
const id = 'heatmap';

const style = {
  version: 8,
  name: '4winds mapbox fork',
  sources: {
    [id]: {
      type: 'temporalgrid',
      tiles: [`${apiTilesUrl}/${tileset}/tile/heatmap/{z}/{x}/{y}`],
      aggregationConfig: {
        geomType: 'gridded', // blob | gridded | extruded
        quantizeOffset: 0,
        delta: 10,
        singleFrame: false,
        start: '2019-01-01T00:00:00.000Z'
      }
    }
  },
  layers: [
    {
      id,
      type: 'fill',
      source: id,
      'source-layer': tileset,
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['to-number', ['get', '3']],
          0,
          'rgba(12, 39, 108, 0)',
          1,
          'rgb(12, 39, 108)',
          2,
          '#114685',
          3,
          '#00ffc3',
          4,
          '#ffffff'
        ]
      }
    }
  ]
};

export default style;
