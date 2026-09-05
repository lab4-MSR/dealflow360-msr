import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Plug, KeyRound, Webhook, ShieldCheck } from 'lucide-react'

export function IntegrationSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-4 w-4 text-primary" aria-hidden />
            Connected Services
          </CardTitle>
          <CardDescription>External services connected to your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Plug className="h-6 w-6" />}
            title="No connected services"
            description="Connected services configured for your workspace will appear here."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" aria-hidden />
            API
          </CardTitle>
          <CardDescription>API access configuration. Secrets are never shown here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-surface px-4 py-3 text-body-small text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
              API access is authenticated via your session token.
            </div>
            <EmptyState
              icon={<KeyRound className="h-6 w-6" />}
              title="No API keys"
              description="API keys are managed securely and only exposed through an authorized masked view."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-primary" aria-hidden />
            Webhooks
          </CardTitle>
          <CardDescription>Outgoing webhook endpoints for your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Webhook className="h-6 w-6" />}
            title="No webhooks configured"
            description="Webhook endpoints configured for your workspace will appear here."
          />
        </CardContent>
      </Card>
    </div>
  )
}