import { Bell, BellOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationSettingsProps {
  householdCode: string;
}

export const PushNotificationSettings = ({ householdCode }: PushNotificationSettingsProps) => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications(householdCode);

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive reminders even when the app is closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-enabled">Enable Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {permission === 'denied' 
                ? 'Notifications are blocked in browser settings'
                : isSubscribed 
                  ? 'You will receive push notifications'
                  : 'Enable to receive reminders'}
            </p>
          </div>
          <Switch
            id="push-enabled"
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        </div>

        {isSubscribed && (
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Test Notification
          </Button>
        )}

        {permission === 'denied' && (
          <p className="text-sm text-destructive">
            Please enable notifications in your browser settings to use this feature.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
