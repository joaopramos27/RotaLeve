import type { OptimizedRouteResult, RouteStop } from './types';

export type RouteExportLink = {
  label: string;
  href: string;
  helper: string;
};

export type RouteExportLinks = {
  googleMapsRoute: RouteExportLink;
  googleMapsStops: RouteExportLink[];
  wazeStops: RouteExportLink[];
};

function formatAddress(stop: RouteStop) {
  return [stop.endereco, stop.cidade, stop.regiaoNome]
    .filter((value): value is string => Boolean(value && value.trim().length > 0))
    .join(', ');
}

function buildGoogleMapsRouteUrl(result: OptimizedRouteResult) {
  const [origin, ...rest] = result.stops;
  const destination = rest.length > 0 ? rest[rest.length - 1] : origin;
  const waypoints = result.stops.slice(1, -1).map((stop) => formatAddress(stop));

  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('origin', formatAddress(origin));
  url.searchParams.set('destination', formatAddress(destination));
  url.searchParams.set('travelmode', 'driving');

  if (waypoints.length > 0) {
    url.searchParams.set('waypoints', waypoints.join('|'));
  }

  return url.toString();
}

function buildGoogleMapsStopUrl(stop: RouteStop) {
  const url = new URL('https://www.google.com/maps/search/');
  url.searchParams.set('api', '1');
  url.searchParams.set('query', formatAddress(stop));
  return url.toString();
}

function buildWazeStopUrl(stop: RouteStop) {
  const url = new URL('https://www.waze.com/ul');
  url.searchParams.set('q', formatAddress(stop));
  url.searchParams.set('navigate', 'yes');
  url.searchParams.set('utm_source', 'rotaleve');
  return url.toString();
}

export function buildRouteExportLinks(result: OptimizedRouteResult): RouteExportLinks {
  const routeLabel = `${result.stops.length} paradas`;

  return {
    googleMapsRoute: {
      label: 'Abrir rota completa no Google Maps',
      href: buildGoogleMapsRouteUrl(result),
      helper: `Rota completa calculada com ${routeLabel}.`,
    },
    googleMapsStops: result.stops.map((stop, index) => ({
      label: `Abrir parada ${index + 1} no Google Maps`,
      href: buildGoogleMapsStopUrl(stop),
      helper: `${stop.nome} - ${formatAddress(stop)}`,
    })),
    wazeStops: result.stops.map((stop, index) => ({
      label: `Abrir parada ${index + 1} no Waze`,
      href: buildWazeStopUrl(stop),
      helper: `${stop.nome} - ${formatAddress(stop)}`,
    })),
  };
}
