declare module '@globalfishingwatch/react-map-gl' {
  import * as ReactMapGl from 'react-map-gl'
  export = ReactMapGl
}

declare module '@globalfishingwatch/react-map-gl/dist/esm/components/use-map-context' {
  import { _MapContext } from '@globalfishingwatch/react-map-gl'
  export = _MapContext
}

declare module '@globalfishingwatch/react-map-gl/dist/esm/components/marker' {
  import { Marker } from '@globalfishingwatch/react-map-gl'
  export = Marker
}

declare module '@globalfishingwatch/react-map-gl/dist/esm/components/popup' {
  import { Popup } from '@globalfishingwatch/react-map-gl'
  export = Popup
}

declare module '@globalfishingwatch/react-map-gl/dist/esm/components/scale-control' {
  import { ScaleControl } from '@globalfishingwatch/react-map-gl'
  export = ScaleControl
}

declare module '@globalfishingwatch/react-map-gl/dist/esm/utils/transition/viewport-fly-to-interpolator' {
  import { FlyToInterpolator } from '@globalfishingwatch/react-map-gl'
  export = FlyToInterpolator
}
