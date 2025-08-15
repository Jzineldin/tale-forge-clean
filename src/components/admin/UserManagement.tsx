import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Crown, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  subscription_tier?: string;
  is_founder?: boolean;
  founder_tier?: string;
  founder_number?: number;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('user_id, subscription_tier');

      const { data: founders } = await supabase
        .from('user_founders')
        .select('user_id, founder_tier, founder_number');

      // Combine data
      const combinedUsers = profiles?.map(profile => {
        const subscription = subscribers?.find(s => s.user_id === profile.id);
        const founder = founders?.find(f => f.user_id === profile.id);
        
        return {
          ...profile,
          subscription_tier: subscription?.subscription_tier || 'Free',
          is_founder: !!founder,
          founder_tier: founder?.founder_tier,
          founder_number: founder?.founder_number,
        };
      }) || [];

      return combinedUsers as User[];
    },
  });

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendBatchEmail = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to send email to');
      return;
    }

    try {
      const response = await supabase.functions.invoke('send-batch-email', {
        body: {
          userIds: selectedUsers,
          emailType: 'founder_update',
          subject: 'Tale Forge Founder Update',
          templateData: {
            title: 'Founder Program Update',
            message: 'Thank you for being a valued founder!'
          }
        }
      });

      if (response.error) {
        toast.error('Failed to send batch email');
      } else {
        toast.success(`Batch email sent to ${selectedUsers.length} users`);
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Error sending batch email:', error);
      toast.error('Failed to send batch email');
    }
  };

  const getFounderBadge = (user: User) => {
    if (!user.is_founder) return null;
    
    const colors = {
      genesis: 'bg-yellow-500',
      pioneer: 'bg-rose-500', 
      early_adopter: 'bg-purple-500'
    };
    
    const color = colors[user.founder_tier as keyof typeof colors] || 'bg-purple-500';
    
    return (
      <Badge className={`${color} text-white text-xs`}>
        <Crown className="w-3 h-3 mr-1" />
        Founder #{user.founder_number}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      Pro: 'bg-purple-500',
      Premium: 'bg-blue-500',
      Family: 'bg-green-500',
      Free: 'bg-gray-500'
    };
    
    return (
      <Badge className={`${colors[tier as keyof typeof colors] || 'bg-gray-500'} text-white text-xs`}>
        {tier}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSendBatchEmail}
                disabled={selectedUsers.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email ({selectedUsers.length})
              </Button>
            </div>

            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 dark:bg-gray-800 font-medium text-sm">
                <div className="col-span-1">Select</div>
                <div className="col-span-3">User</div>
                <div className="col-span-2">Subscription</div>
                <div className="col-span-2">Founder Status</div>
                <div className="col-span-2">Joined</div>
                <div className="col-span-2">Actions</div>
              </div>
              {filteredUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="font-medium">{user.full_name || 'No name'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="col-span-2">
                    {getTierBadge(user.subscription_tier || 'Free')}
                  </div>
                  <div className="col-span-2">
                    {getFounderBadge(user)}
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </div>
                  <div className="col-span-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Navigate to user details or perform action
                        toast.info(`Viewing user: ${user.email}`);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;