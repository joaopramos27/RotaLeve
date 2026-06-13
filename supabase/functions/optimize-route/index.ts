import { createClient } from "npm:@supabase/supabase-js@2";

type RouteClientRow = {
  id: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  endereco: string | null;
  regiao_id: string | null;
  latitude: number | null;
  longitude: number | null;
  geocode_address: string | null;
};

type RegionRow = {
  id: string;
  nome: string;
};

type GeocodedClient = RouteClientRow & {
  regiaoNome: string | null;
  latitude: number;
  longitude: number;
};

type RouteStop = {
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

type RouteGenerationResult = {
  summary: {
    totalDistanceMeters: number;
    totalDurationSeconds: number;
    selectedCount: number;
    waypointOrder: number[];
    cached: boolean;
  };
  stops: RouteStop[];
  warnings: string[];
  originLabel: string;
  destinationLabel: string;
  cacheKey: string;
};

type NominatimSearchResult = {
  lat?: string;
  lon?: string;
  display_name?: string;
};

type OsrmTripLeg = {
  distance?: number;
  duration?: number;
};

type OsrmTrip = {
  distance?: number;
  duration?: number;
  legs?: OsrmTripLeg[];
};

type OsrmWaypoint = {
  waypoint_index?: number;
  trips_index?: number;
};

type OsrmTripResponse = {
  code?: string;
  message?: string;
  trips?: OsrmTrip[];
  waypoints?: OsrmWaypoint[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function normalizeText(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    if (value === null || value === undefined) {
      return fallback;
    }

    return String(value).replace(/\s+/g, " ").trim() || fallback;
  }

  return value.replace(/\s+/g, " ").trim() || fallback;
}

function normalizeOptionalText(value: unknown) {
  const text = normalizeText(value);
  return text.length > 0 ? text : null;
}

function normalizeNumber(value: unknown) {
  const numberValue = typeof value === "string" ? Number(value) : value;
  return typeof numberValue === "number" && Number.isFinite(numberValue) ? numberValue : null;
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const numberValue = normalizeNumber(value);
  return numberValue !== null && numberValue > 0 ? Math.floor(numberValue) : fallback;
}

function uniqueValues(values: string[]) {
  return [...new Set(values.filter((value) => value.length > 0))];
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatClientAddress(client: RouteClientRow) {
  return [client.endereco, client.cidade].map((value) => normalizeText(value)).filter(Boolean).join(", ");
}

function formatClientLabel(client: RouteClientRow) {
  const name = normalizeText(client.nome);
  const address = normalizeText(client.endereco);
  const city = normalizeText(client.cidade);
  return [name, address, city].filter((value) => value.length > 0).join(" - ");
}

function stableClientSort(left: RouteClientRow, right: RouteClientRow) {
  return left.nome.localeCompare(right.nome, "pt-BR", { sensitivity: "base" }) || left.id.localeCompare(right.id);
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function buildNominatimUrl(baseUrl: string, query: string) {
  const url = new URL("/search", baseUrl);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);
  return url.toString();
}

async function geocodeAddress(baseUrl: string, userAgent: string, referer: string | null, query: string) {
  const headers = new Headers({
    Accept: "application/json",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "User-Agent": userAgent,
  });

  if (referer) {
    headers.set("Referer", referer);
  }

  const response = await fetch(buildNominatimUrl(baseUrl, query), { headers });
  if (!response.ok) {
    throw new Error(`Falha ao geocodificar endereco. HTTP ${response.status}.`);
  }

  const results = (await response.json()) as NominatimSearchResult[];
  const firstResult = results[0];
  const latitude = normalizeNumber(firstResult?.lat);
  const longitude = normalizeNumber(firstResult?.lon);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    latitude,
    longitude,
    displayName: normalizeOptionalText(firstResult?.display_name),
  };
}

async function getClientCoordinates(
  adminClient: ReturnType<typeof createClient>,
  client: RouteClientRow & { regiaoNome: string | null },
  nominatimBaseUrl: string,
  nominatimUserAgent: string,
  nominatimReferer: string | null,
  shouldWaitBeforeFetch: boolean,
) {
  const address = formatClientAddress(client);
  const cachedLatitude = normalizeNumber(client.latitude);
  const cachedLongitude = normalizeNumber(client.longitude);

  if (
    cachedLatitude !== null &&
    cachedLongitude !== null &&
    normalizeText(client.geocode_address) === address
  ) {
    return {
      ...client,
      latitude: cachedLatitude,
      longitude: cachedLongitude,
    };
  }

  if (shouldWaitBeforeFetch) {
    await delay(1100);
  }

  const geocoded = await geocodeAddress(nominatimBaseUrl, nominatimUserAgent, nominatimReferer, address);
  if (!geocoded) {
    throw new Error(`Nao foi possivel localizar o endereco do cliente "${client.nome}".`);
  }

  const { error: geocodeUpdateError } = await adminClient
    .from("clientes")
    .update({
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      geocode_provider: "nominatim",
      geocode_address: address,
      geocode_at: new Date().toISOString(),
    })
    .eq("id", client.id);

  if (geocodeUpdateError) {
    throw new Error(`Nao foi possivel salvar a localizacao do cliente "${client.nome}".`);
  }

  return {
    ...client,
    latitude: geocoded.latitude,
    longitude: geocoded.longitude,
  };
}

function buildOsrmTripUrl(baseUrl: string, clients: GeocodedClient[]) {
  const coordinates = clients.map((client) => `${client.longitude},${client.latitude}`).join(";");
  const url = new URL(`/trip/v1/driving/${coordinates}`, baseUrl);
  url.searchParams.set("roundtrip", "false");
  url.searchParams.set("source", "first");
  url.searchParams.set("destination", "last");
  url.searchParams.set("steps", "false");
  url.searchParams.set("overview", "false");
  return url.toString();
}

async function fetchOsrmTrip(baseUrl: string, clients: GeocodedClient[]) {
  const response = await fetch(buildOsrmTripUrl(baseUrl, clients), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar o OSRM. HTTP ${response.status}.`);
  }

  return (await response.json()) as OsrmTripResponse;
}

function buildRouteResult(
  selectedClients: GeocodedClient[],
  trip: OsrmTrip,
  waypoints: OsrmWaypoint[],
  cacheKey: string,
  cached: boolean,
): RouteGenerationResult {
  const indexedOrder = selectedClients
    .map((client, inputIndex) => ({
      client,
      inputIndex,
      waypointIndex: waypoints[inputIndex]?.waypoint_index ?? inputIndex,
    }))
    .sort((left, right) => left.waypointIndex - right.waypointIndex);

  const orderedClients = indexedOrder.map((item) => item.client);
  const orderedInputIndexes = indexedOrder.map((item) => item.inputIndex);
  const legs = trip.legs ?? [];

  const stops: RouteStop[] = orderedClients.map((client, index) => {
    const leg = index === 0 ? null : legs[index - 1];

    return {
      clientId: client.id,
      nome: client.nome,
      endereco: normalizeText(client.endereco),
      cidade: client.cidade,
      regiaoNome: client.regiaoNome,
      order: index,
      legDistanceMeters: leg ? normalizeNumber(leg.distance) : null,
      legDurationSeconds: leg ? normalizeNumber(leg.duration) : null,
      isOrigin: index === 0,
      isDestination: index === orderedClients.length - 1,
    };
  });

  const totalDistanceMeters = normalizeNumber(trip.distance) ?? legs.reduce((sum, leg) => sum + (normalizeNumber(leg.distance) ?? 0), 0);
  const totalDurationSeconds = normalizeNumber(trip.duration) ?? legs.reduce((sum, leg) => sum + (normalizeNumber(leg.duration) ?? 0), 0);
  const waypointOrder = orderedInputIndexes
    .slice(1, -1)
    .map((inputIndex) => inputIndex - 1)
    .filter((inputIndex) => inputIndex >= 0);

  return {
    summary: {
      totalDistanceMeters,
      totalDurationSeconds,
      selectedCount: selectedClients.length,
      waypointOrder,
      cached,
    },
    stops,
    warnings: [],
    originLabel: formatClientLabel(orderedClients[0]),
    destinationLabel: formatClientLabel(orderedClients[orderedClients.length - 1]),
    cacheKey,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Metodo nao permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const osrmBaseUrl = Deno.env.get("OSRM_BASE_URL") ?? "https://router.project-osrm.org";
  const nominatimBaseUrl = Deno.env.get("NOMINATIM_BASE_URL") ?? "https://nominatim.openstreetmap.org";
  const nominatimUserAgent = Deno.env.get("NOMINATIM_USER_AGENT") ?? "RotaLeve/1.0";
  const nominatimReferer = normalizeOptionalText(Deno.env.get("NOMINATIM_REFERER"));
  const cacheTtlMinutes = normalizePositiveInteger(Deno.env.get("ROUTE_CACHE_TTL_MINUTES"), 60);
  const rateLimitMaxRequests = normalizePositiveInteger(Deno.env.get("ROUTE_RATE_LIMIT_MAX_REQUESTS"), 12);
  const rateLimitWindowMinutes = normalizePositiveInteger(Deno.env.get("ROUTE_RATE_LIMIT_WINDOW_MINUTES"), 15);
  const maxClients = normalizePositiveInteger(Deno.env.get("ROUTE_MAX_CLIENTS"), 12);

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse({ error: "Configuracao incompleta da Edge Function." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Nao autenticado." }, 401);
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Nao foi possivel validar a sessao." }, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Corpo da requisicao invalido." }, 400);
  }

  const selectedClientIds = uniqueValues(
    Array.isArray((body as { selectedClientIds?: unknown }).selectedClientIds)
      ? (body as { selectedClientIds: unknown[] }).selectedClientIds.map((value) => normalizeText(value))
      : [],
  );

  if (selectedClientIds.length < 2) {
    return jsonResponse({ error: "Selecione ao menos dois clientes com endereco para gerar a rota." }, 400);
  }

  if (selectedClientIds.length > maxClients) {
    return jsonResponse({ error: `A rota suporta no maximo ${maxClients} clientes por calculo neste provedor.` }, 400);
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: clientRows, error: clientsError } = await authClient
    .from("clientes")
    .select("id, nome, telefone, cidade, endereco, regiao_id, latitude, longitude, geocode_address")
    .eq("usuario_id", user.id)
    .in("id", selectedClientIds);

  if (clientsError) {
    return jsonResponse({ error: "Nao foi possivel carregar os clientes selecionados." }, 500);
  }

  if (!clientRows || clientRows.length !== selectedClientIds.length) {
    return jsonResponse({ error: "Alguns clientes selecionados nao foram encontrados." }, 400);
  }

  const normalizedClients = (clientRows as RouteClientRow[]).map((client) => ({
    ...client,
    nome: normalizeText(client.nome),
    telefone: normalizeOptionalText(client.telefone),
    cidade: normalizeOptionalText(client.cidade),
    endereco: normalizeOptionalText(client.endereco),
    latitude: normalizeNumber(client.latitude),
    longitude: normalizeNumber(client.longitude),
    geocode_address: normalizeOptionalText(client.geocode_address),
  }));

  const invalidClients = normalizedClients.filter((client) => !client.endereco);
  if (invalidClients.length > 0) {
    return jsonResponse(
      {
        error: "Todos os clientes precisam ter endereco para gerar a rota.",
        invalidClients: invalidClients.map((client) => client.id),
      },
      400,
    );
  }

  const regionIds = uniqueValues(normalizedClients.map((client) => client.regiao_id ?? ""));
  let regionRows: RegionRow[] = [];

  if (regionIds.length > 0) {
    const { data, error } = await authClient.from("regioes").select("id, nome").in("id", regionIds);
    if (error) {
      return jsonResponse({ error: "Nao foi possivel carregar as regioes dos clientes selecionados." }, 500);
    }

    regionRows = (data ?? []) as RegionRow[];
  }

  const regionMap = new Map((regionRows ?? []).map((region) => [region.id, normalizeText(region.nome)]));
  const clientsWithRegions = normalizedClients
    .map((client) => ({
      ...client,
      regiaoNome: client.regiao_id ? regionMap.get(client.regiao_id) ?? null : null,
    }))
    .sort(stableClientSort);

  let geocodedClients: GeocodedClient[];
  try {
    geocodedClients = [];
    for (const [index, client] of clientsWithRegions.entries()) {
      geocodedClients.push(
        await getClientCoordinates(
          adminClient,
          client,
          nominatimBaseUrl,
          nominatimUserAgent,
          nominatimReferer,
          index > 0,
        ),
      );
    }
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel geocodificar os enderecos.",
      },
      422,
    );
  }

  const cacheKey = await sha256Hex(
    JSON.stringify({
      usuarioId: user.id,
      provider: "osrm-nominatim",
      clients: geocodedClients.map((client) => ({
        id: client.id,
        nome: client.nome,
        endereco: client.endereco,
        cidade: client.cidade,
        regiaoId: client.regiao_id,
        regiaoNome: client.regiaoNome,
        latitude: client.latitude,
        longitude: client.longitude,
      })),
    }),
  );

  const { count: recentCount, error: countError } = await adminClient
    .from("route_generation_requests")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", user.id)
    .gte("data_criacao", new Date(Date.now() - rateLimitWindowMinutes * 60 * 1000).toISOString());

  if (countError) {
    return jsonResponse({ error: "Nao foi possivel validar o limite de requisicoes." }, 500);
  }

  if ((recentCount ?? 0) >= rateLimitMaxRequests) {
    return jsonResponse(
      {
        error: "Limite de requisicoes atingido. Tente novamente mais tarde.",
      },
      429,
    );
  }

  const { error: requestLogError } = await adminClient.from("route_generation_requests").insert({
    usuario_id: user.id,
    cache_key: cacheKey,
  });

  if (requestLogError) {
    return jsonResponse({ error: "Nao foi possivel registrar a requisicao." }, 500);
  }

  const { data: cachedRoute, error: cacheLookupError } = await adminClient
    .from("route_cache")
    .select("result_json, expires_at")
    .eq("usuario_id", user.id)
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (cacheLookupError) {
    return jsonResponse({ error: "Nao foi possivel consultar o cache da rota." }, 500);
  }

  if (cachedRoute && cachedRoute.result_json) {
    const cachedResult = cachedRoute.result_json as RouteGenerationResult;
    return jsonResponse({
      ...cachedResult,
      summary: {
        ...cachedResult.summary,
        cached: true,
      },
    });
  }

  let tripJson: OsrmTripResponse;
  try {
    tripJson = await fetchOsrmTrip(osrmBaseUrl, geocodedClients);
  } catch (error) {
    return jsonResponse(
      {
        error: "Nao foi possivel consultar o servico de rotas OSRM.",
        details: error instanceof Error ? error.message : "Erro desconhecido.",
      },
      502,
    );
  }

  if (tripJson.code !== "Ok") {
    return jsonResponse(
      {
        error: "O OSRM nao conseguiu calcular uma rota para os enderecos informados.",
        status: tripJson.code ?? "UNKNOWN_ERROR",
        details: normalizeText(tripJson.message),
      },
      422,
    );
  }

  const trip = tripJson.trips?.[0];
  if (!trip) {
    return jsonResponse({ error: "O OSRM nao retornou uma rota valida." }, 502);
  }

  const result = buildRouteResult(geocodedClients, trip, tripJson.waypoints ?? [], cacheKey, false);
  const expiresAt = new Date(Date.now() + cacheTtlMinutes * 60 * 1000).toISOString();

  const { error: cacheUpsertError } = await adminClient.from("route_cache").upsert(
    {
      usuario_id: user.id,
      cache_key: cacheKey,
      selected_client_ids: geocodedClients.map((client) => client.id),
      selected_snapshot: geocodedClients.map((client) => ({
        id: client.id,
        nome: client.nome,
        telefone: client.telefone,
        cidade: client.cidade,
        endereco: client.endereco,
        regiao_id: client.regiao_id,
        regiao_nome: client.regiaoNome,
        latitude: client.latitude,
        longitude: client.longitude,
      })),
      origin_label: result.originLabel,
      destination_label: result.destinationLabel,
      result_json: result,
      expires_at: expiresAt,
      data_atualizacao: new Date().toISOString(),
    },
    {
      onConflict: "usuario_id,cache_key",
    },
  );

  if (cacheUpsertError) {
    return jsonResponse(
      {
        ...result,
        warnings: [...result.warnings, "Nao foi possivel salvar o cache da rota."],
      },
      200,
    );
  }

  return jsonResponse(result);
});
