# RotaLeve

Aplicação web mobile-first para representantes comerciais.

## Variáveis de ambiente

Crie um arquivo `.env` com base em `.env.example`.

Para a integração com Gemini, configure também os segredos da Edge Function no Supabase:

- `GEMINI_API_KEY`
- `GEMINI_MODEL` opcional, padrão `gemini-2.5-flash`
- `SUPABASE_SERVICE_ROLE_KEY`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`

## Producao

Veja o checklist completo em [`docs/production.md`](docs/production.md).

## Previa local sem APIs

Para abrir o projeto em modo demo, crie um `.env.local` com:

```env
VITE_DEMO_MODE=true
```

Depois rode:

```bash
npm run dev
```

Nesse modo, o sistema usa dados locais simulados e desativa chamadas para Supabase, OSRM/Nominatim e Gemini.

## Produção

Veja o checklist completo em [`docs/production.md`](docs/production.md).
