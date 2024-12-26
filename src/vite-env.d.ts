/// <reference types="vite/client" />

declare module '@azure/maps-control' {
  export class Map {
    constructor(container: HTMLElement, options: any);
    dispose(): void;
    events: {
      add(eventName: string, target?: any, callback?: (e: any) => void): void;
    };
    sources: {
      add(source: any): void;
    };
    layers: {
      add(layer: any): void;
    };
  }

  export namespace source {
    class DataSource {
      add(data: any): void;
    }
  }

  export namespace layer {
    class SymbolLayer {
      constructor(source: any, id: string | null, options?: any);
    }
  }

  export class Popup {
    constructor(options?: any);
    setOptions(options: any): void;
    open(map: Map): void;
    close(): void;
  }

  export namespace data {
    class Feature {
      constructor(geometry: any, properties?: any);
      getProperties(): any;
    }
    class Point {
      constructor(coordinates: [number, number]);
    }
  }

  export namespace Shape {
    function getProperties(): any;
  }
}

declare module 'azure-maps-control' {
  export class Map {
    constructor(container: HTMLElement, options: any);
    dispose(): void;
    events: {
      add(eventName: string, target?: any, callback?: (e: any) => void): void;
    };
    sources: {
      add(source: any): void;
    };
    layers: {
      add(layer: any): void;
    };
  }

  export namespace source {
    class DataSource {
      add(data: any): void;
    }
  }

  export namespace layer {
    class SymbolLayer {
      constructor(source: any, id: string | null, options?: any);
    }
  }

  export class Popup {
    constructor(options?: any);
    setOptions(options: any): void;
    open(map: Map): void;
    close(): void;
  }

  export namespace data {
    class Feature {
      constructor(geometry: any, properties?: any);
      getProperties(): any;
    }
    class Point {
      constructor(coordinates: [number, number]);
    }
  }

  export namespace Shape {
    function getProperties(): any;
  }
}
