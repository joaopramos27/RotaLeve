import { createClient } from "npm:@supabase/supabase-js@2";

type IncomingProductRow = {
  rowNumber: number;
  nome: string;
  descricao: string;
  preco: string;
};

type GeminiProductRow = {
  rowNumber: number;
  nomeCorrigido?: string;
  nome_corrigido?: string;
  descricaoPadronizada?: string;
  descricao_padronizada?: string;
  categoriaSugerida?: string;
  categoria_sugerida?: string;
  possiveisErros?: string[];
  possiveis_erros?: string[];
  erros?: string[];
  observacoes?: string[];
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

    return String(value).trim() || fallback;
  }

  return value.replace(/\s+/g, " ").trim() || fallback;
}

function normalizeList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item))
    .filter((item) => item.length > 0)
    .slice(0, 8);
}

function extractJsonPayload(text: string) {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1] ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini nao retornou JSON valido.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function buildPrompt(rows: IncomingProductRow[]) {
  return [
    "Voce e um analista de qualidade de dados para um catalogo de produtos em pt-BR.",
    "Analise os itens de entrada e corrija apenas ortografia, capitalizacao e padronizacao textual.",
    "Nao altere o preco e nao invente valores ausentes.",
    "Sugira uma categoria curta e pratica para cada item.",
    "Detecte possiveis erros como nomes estranhos, descricoes vagas, termos incompletos, inconsistencias, duplicidade aparente ou indicios de cadastro incorreto.",
    "Retorne somente JSON valido, sem markdown, sem explicacoes fora do JSON.",
    "Formato esperado:",
    JSON.stringify(
      {
        rows: [
          {
            rowNumber: 1,
            nomeCorrigido: "Nome normalizado",
            descricaoPadronizada: "Descricao padronizada em pt-BR",
            categoriaSugerida: "Categoria sugerida",
            possiveisErros: ["Lista de possiveis problemas"],
            observacoes: ["Observacoes objetivas"],
          },
        ],
        summary: {
          notes: ["Notas gerais sobre a planilha"],
        },
      },
      null,
      2,
    ),
    "Dados a analisar:",
    JSON.stringify(rows, null, 2),
  ].join("\n\n");
}

function normalizeGeminiResponse(raw: unknown, inputRows: IncomingProductRow[]) {
  const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const rawRows = Array.isArray(source.rows)
    ? source.rows
    : Array.isArray(source.items)
      ? source.items
      : [];
  const rowsByNumber = new Map<number, GeminiProductRow>();

  for (const row of rawRows) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const item = row as GeminiProductRow;
    if (typeof item.rowNumber === "number") {
      rowsByNumber.set(item.rowNumber, item);
    }
  }

  const normalizedRows = inputRows.map((row) => {
    const suggested = rowsByNumber.get(row.rowNumber);

    return {
      rowNumber: row.rowNumber,
      nomeCorrigido: normalizeText(suggested?.nomeCorrigido ?? suggested?.nome_corrigido, row.nome),
      descricaoPadronizada: normalizeText(
        suggested?.descricaoPadronizada ?? suggested?.descricao_padronizada,
        row.descricao,
      ),
      categoriaSugerida: normalizeText(suggested?.categoriaSugerida ?? suggested?.categoria_sugerida, "Nao informada"),
      possiveisErros: normalizeList(suggested?.possiveisErros ?? suggested?.possiveis_erros ?? suggested?.erros),
      observacoes: normalizeList(suggested?.observacoes),
    };
  });

  const categories = [...new Set(normalizedRows.map((row) => row.categoriaSugerida).filter((item) => item.length > 0))];
  const rowsWithWarnings = normalizedRows.filter(
    (row) => row.possiveisErros.length > 0 || row.observacoes.length > 0,
  ).length;
  const notes = normalizeList(source.summary && typeof source.summary === "object" ? (source.summary as Record<string, unknown>).notes : []);

  return {
    summary: {
      totalRows: inputRows.length,
      rowsWithWarnings,
      categories,
      notes,
    },
    rows: normalizedRows,
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
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  const geminiModel = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !geminiApiKey) {
    return jsonResponse(
      {
        error: "Configuracao incompleta da Edge Function.",
      },
      500,
    );
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

  const incomingRows = Array.isArray((body as { rows?: unknown }).rows) ? (body as { rows: unknown[] }).rows : [];
  if (incomingRows.length === 0) {
    return jsonResponse({ error: "Envie ao menos uma linha para analise." }, 400);
  }

  if (incomingRows.length > 100) {
    return jsonResponse({ error: "A analise aceita no maximo 100 linhas por requisicao." }, 413);
  }

  const rows: IncomingProductRow[] = [];
  for (const [index, item] of incomingRows.entries()) {
    if (!item || typeof item !== "object") {
      return jsonResponse({ error: `Linha ${index + 1} invalida.` }, 400);
    }

    const candidate = item as Partial<IncomingProductRow>;
    const rowNumber = Number(candidate.rowNumber);

    if (!Number.isInteger(rowNumber) || rowNumber < 1) {
      return jsonResponse({ error: `Linha ${index + 1} com rowNumber invalido.` }, 400);
    }

    rows.push({
      rowNumber,
      nome: normalizeText(candidate.nome),
      descricao: normalizeText(candidate.descricao),
      preco: normalizeText(candidate.preco),
    });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: quotaData, error: quotaError } = await adminClient.rpc("consume_gemini_import_quota", {
    p_user_id: user.id,
    p_limit: 6,
    p_window_minutes: 15,
  });

  if (quotaError) {
    return jsonResponse(
      {
        error: "Nao foi possivel validar o limite de requisicoes.",
      },
      500,
    );
  }

  if (!quotaData || typeof quotaData !== "object" || !(quotaData as { allowed?: boolean }).allowed) {
    const requestCount = Number((quotaData as { request_count?: unknown })?.request_count ?? 0);
    return jsonResponse(
      {
        error: "Limite de requisicoes atingido. Tente novamente mais tarde.",
        requestCount,
      },
      429,
    );
  }

  const prompt = buildPrompt(rows);
  const geminiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const geminiResponse = await fetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    return jsonResponse(
      {
        error: "Falha ao consultar o Gemini.",
        details: errorText.slice(0, 500),
      },
      502,
    );
  }

  const geminiData = (await geminiResponse.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const text = geminiData.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    return jsonResponse(
      {
        error: "Gemini nao retornou uma resposta util.",
      },
      502,
    );
  }

  let parsed: unknown;
  try {
    parsed = extractJsonPayload(text);
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Nao foi possivel interpretar a resposta do Gemini.",
      },
      502,
    );
  }

  const normalized = normalizeGeminiResponse(parsed, rows);

  return jsonResponse(normalized);
});
