
import { useAuth } from "@/lib/auth-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

export default function Profile() {
  const { user } = useAuth();
  const { daysRemaining, hoursRemaining, subscription } = useSubscriptionStatus(user?.id);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="font-medium">Email</label>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="font-medium">ID</label>
              <p className="text-muted-foreground">{user?.id}</p>
            </div>
            <div className="space-y-2">
              <div>
                <label className="font-medium">Subscription Type</label>
                <p className="text-muted-foreground capitalize">
                  {subscription?.subscription_type || 'Loading...'}
                </p>
              </div>
              <div>
                <label className="font-medium">Status</label>
                <p className={`text-muted-foreground capitalize ${
                  subscription?.subscription_status === 'Active' ? 'text-green-500' :
                  subscription?.subscription_status === 'Suspended' ? 'text-orange-500' :
                  subscription?.subscription_status === 'Cancelled' ? 'text-red-500' : ''
                }`}>
                  {subscription?.subscription_status || 'Loading...'}
                </p>
              </div>
              <div>
                <label className="font-medium">Subscription Status</label>
                <p className={`text-muted-foreground ${daysRemaining && daysRemaining <= 2 ? 'text-orange-500' : ''}`}>
                  {daysRemaining !== null && hoursRemaining !== null
                    ? `${daysRemaining} days and ${hoursRemaining} hours remaining`
                    : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
