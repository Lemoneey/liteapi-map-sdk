# LiteAPI Map SDK

An embeddable maps experience that renders LiteAPI hotel data on top of a Mapbox GL scene. The SDK bundles the map renderer, API client so you can drop a fully interactive map into any web surface with a few lines of code.

## Features

- Mapbox GL powered viewport seeded with LiteAPI place metadata
- Heatmap overlay and marker layer fed by hotel rate data
- Extensible adapter layer for alternative map providers or api

## Getting Started

### Prerequisites

- Access to a LiteAPI-compatible proxy that exposes `/places/:placeId` and `/hotels/rates`

### Installation

```bash
npm install
```

## Using the SDK

1. Ensure your host app has a container element for the map:

```html
<div id="app"></div>
```

2. Initialize the map with the bundled entry point:

```ts
import { LiteAPI } from "liteapi-map-sdk";

LiteAPI.Map.init({
  selector: "#app",
  placeId: "PLACE_ID_FROM_LITEAPI",
  proxyDomain: "proxy.example.com",
});
```

`init` returns a `MapManager` instance that you can use to toggle layers:

```ts
const mapManager = LiteAPI.Map.init({
  selector: "#app",
  placeId: "PLACE_ID_FROM_LITEAPI",
  proxyDomain: "proxy.example.com",
});

mapManager.toggleMapHeatmap(true);
```

### Configuration Reference

- `selector` (`string`): CSS selector for the map container element.
- `placeId` (`string`): LiteAPI place identifier.
- `proxyDomain` (`string`): Domain (without protocol) for your LiteAPI proxy. Calls are issued over HTTPS.

## Proxy Expectations

- `GET /places/:placeId` must return place geometry and bounds.
- `POST /hotels/rates` should respond with hotel options.

## Project Structure

- `src/index.ts` – public entry point exporting the `LiteAPI` namespace.
- `src/MapManager.ts` – orchestrates data loading, heatmap/markers, and adapter lifecycle.
- `src/adapters/Mapbox/` – Mapbox implementation of the `MapAdapter` interface.
- `src/services/LiteApi/` – REST client, response normalizers, and supporting utilities.
