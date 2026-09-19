# OMNIFORGE AI — Production Security Checklist

## Client
- Only the Supabase publishable key is permitted in browser code.
- Provider secrets such as MESHY_API_KEY must remain in Edge Function secrets.
- Never place Supabase secret/service-role keys in Vite environment variables.

## Database
- All OMNIFORGE public tables have Row Level Security enabled.
- User-owned records are scoped with auth.uid().
- Storage bucket `omniforge-assets` is private and uses user-scoped object policies.
- API keys are stored as SHA-256 hashes; plaintext keys are shown only at creation time.

## Edge Functions
- User-facing generation functions authenticate the caller.
- Developer API uses a dedicated x-api-key authentication layer.
- Long-running generation work is delegated to provider tasks rather than blocking the request.

## Launch blockers
1. Configure MESHY_API_KEY in Supabase Edge Function secrets.
2. Configure an LLM provider secret before enabling a real AI assistant model.
3. Create/link a production Vercel deployment and verify its build.
4. Pin npm dependency versions and commit package-lock.json before a production release.
