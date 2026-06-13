export type RouteClient = {
  id: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  endereco: string | null;
  regiao_nome: string | null;
};

export type RouteStop = {
  clientId: string;
  nome: string;
  endereco: string;
  cidade: string | null;
  regiaoNome: string | null;
  order: number;
  legDistanceMeters: number | null;
  legDurationSeconds: number | null;
  isOrigin: boolean;
  isDestination: boolean;
};

export type OptimizedRouteSummary = {
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  selectedCount: number;
  waypointOrder: number[];
  cached: boolean;
};

export type OptimizedRouteResult = {
  summary: OptimizedRouteSummary;
  stops: RouteStop[];
  warnings: string[];
  originLabel: string;
  destinationLabel: string;
  cacheKey: string;
};

export type RouteGenerationRequest = {
  selectedClientIds: string[];
};

export type RouteGenerationResponse = OptimizedRouteResult;
