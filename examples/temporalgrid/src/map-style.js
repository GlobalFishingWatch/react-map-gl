const apiTilesUrl = 'https://fst-tiles-jzzp2ui3wq-uc.a.run.app/v1';
const tileset = 'carriers_v3';
const id = 'heatmap';

const style = {
  version: 8,
  name: '4winds mapbox fork',
  sources: {
    [id]: {
      type: 'temporalgrid',
      tiles: [`${apiTilesUrl}/${tileset}/tile/heatmap/{z}/{x}/{y}`]
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

// const style = {
//   version: 8,
//   name: '4winds mapbox fork',
//   sources: {
//     points: {
//       type: 'vector',
//       tiles: ['https://storage.googleapis.com/cilex-books-map-tiles/points/{z}/{x}/{y}.pbf']
//     }
//   },
//   layers: [
//     {
//       id: 'pointsLayer',
//       type: 'circle',
//       source: 'points',
//       'source-layer': 'books-rank1',
//       layout: {
//         visibility: 'visible'
//       },
//       paint: {
//         'circle-color': '#00ffc3',
//         'circle-radius': 10
//       }
//     }
//   ]
// };

export default style;
