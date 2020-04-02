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
      // aggregationConfig: {
      //   geomType: 'gridded', // blob | gridded | extruded
      //   quantizeOffset: 0,
      //   delta: 10,
      //   singleFrame: false,
      //   start: '2019-01-01T00:00:00.000Z'
      // }
    }
  },
  layers: [
    {
      id,
      type: 'fill',
      source: id,
      'source-layer': 'temporalgrid',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-color': '#00ffc3'
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
