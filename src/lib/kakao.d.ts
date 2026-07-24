export {};

declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
  }

  class LatLngBounds {
    extend(latlng: LatLng): void;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    setBounds(bounds: LatLngBounds): void;
  }

  class MarkerImage {
    constructor(
      src: string,
      size: Size,
      options?: { offset?: Point }
    );
  }

  class Marker {
    constructor(options: {
      map?: Map;
      position: LatLng;
      image?: MarkerImage;
      title?: string;
    });
  }

  class InfoWindow {
    constructor(options: { content: string });
    open(map: Map, marker: Marker): void;
  }

  const event: {
    addListener: (
      target: Marker,
      type: string,
      handler: () => void
    ) => void;
  };

  function load(callback: () => void): void;

  namespace services {
    type GeocoderResult = { x: string; y: string };

    enum Status {
      OK = "OK",
      ZERO_RESULT = "ZERO_RESULT",
      ERROR = "ERROR",
    }

    class Geocoder {
      addressSearch(
        address: string,
        callback: (result: GeocoderResult[], status: Status) => void
      ): void;
    }
  }
}

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}
