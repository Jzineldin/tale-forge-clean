import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFeedback, FeedbackRecord } from '@/hooks/useFeedback';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, User, Globe, RefreshCw, Filter, Search } from 'lucide-react';

const FeedbackManager: React.FC = () => {
  const { getAllFeedback, getFeedbackStats, updateFeedbackStatus } = useFeedback(true); // Enable admin queries
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Enable queries for admin - they're now automatically enabled via the hook parameter
  useEffect(() => {
    console.log('FeedbackManager mounted, admin queries should be enabled');
    
    // Debug: Check authentication status
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Auth session:', session);
      console.log('Auth error:', error);
      console.log('User ID:', session?.user?.id);
      setDebugInfo({
        isAuthenticated: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });
    };
    
    checkAuth();
  }, []);

  const handleStatusUpdate = async (
    id: string, 
    status: string, 
    priority?: string, 
    notes?: string
  ) => {
    try {
      const updateData: any = { id, status };
      if (priority !== undefined) updateData.priority = priority;
      if (notes !== undefined) updateData.admin_notes = notes;
      
      await updateFeedbackStatus.mutateAsync(updateData);
      
      // Refresh data
      getAllFeedback.refetch();
      getFeedbackStats.refetch();
      
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Failed to update feedback:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'praise': return '👏';
      case 'complaint': return '😞';
      default: return '💬';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const filteredFeedback = getAllFeedback.data?.filter(feedback => {
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchesType = filterType === 'all' || feedback.feedback_type === filterType;
    const matchesSearch = searchTerm === '' || 
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  }) || [];

  if (getAllFeedback.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-slate-300">Loading feedback...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Feedback Manager</h1>
            <p className="text-slate-400">Manage user feedback and support requests</p>
            {debugInfo && (
              <p className="text-xs text-yellow-400 mt-1">
                Debug: {debugInfo.isAuthenticated ? `Authenticated as ${debugInfo.userEmail} (${debugInfo.userId})` : 'NOT AUTHENTICATED'}
              </p>
            )}
          </div>
        </div>
        <Button 
          onClick={() => {
            getAllFeedback.refetch();
            getFeedbackStats.refetch();
          }}
          variant="outline"
          className="border-slate-600 text-slate-300"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      {getFeedbackStats.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-2xl font-bold text-white">{getFeedbackStats.data.total_feedback}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">New</p>
                  <p className="text-2xl font-bold text-blue-400">{getFeedbackStats.data.new_feedback}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-400">{getFeedbackStats.data.in_progress_feedback}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-400">{getFeedbackStats.data.resolved_feedback}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="praise">Praise</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Items */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Feedback Items ({filteredFeedback.length})
          </h2>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredFeedback.map((feedback) => (
              <Card 
                key={feedback.id}
                className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:bg-slate-750 ${
                  selectedFeedback?.id === feedback.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => {
                  setSelectedFeedback(feedback);
                  setAdminNotes(feedback.admin_notes || '');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(feedback.feedback_type)}</span>
                      <Badge 
                        className={`${getStatusColor(feedback.status)} text-white text-xs`}
                      >
                        {feedback.status.replace('_', ' ')}
                      </Badge>
                      <span className={`text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                        {feedback.priority.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {feedback.subject && (
                    <h3 className="font-medium text-white mb-1 truncate">
                      {feedback.subject}
                    </h3>
                  )}
                  
                  <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                    {feedback.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-4">
                      {feedback.email && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{feedback.email}</span>
                        </div>
                      )}
                      {feedback.page_url && (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">
                            {new URL(feedback.page_url).pathname}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredFeedback.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback found matching your filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Feedback Details</h2>
          
          {selectedFeedback ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <span className="mr-2">{getTypeIcon(selectedFeedback.feedback_type)}</span>
                      {selectedFeedback.subject || 'No Subject'}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={`${getStatusColor(selectedFeedback.status)} text-white`}>
                        {selectedFeedback.status.replace('_', ' ')}
                      </Badge>
                      <span className={`text-sm font-medium ${getPriorityColor(selectedFeedback.priority)}`}>
                        {selectedFeedback.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Message */}
                <div>
                  <Label className="text-slate-300 text-sm font-medium">Message</Label>
                  <div className="mt-1 p-3 bg-slate-700 rounded-md">
                    <p className="text-white whitespace-pre-wrap">{selectedFeedback.message}</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Email</Label>
                    <p className="text-white text-sm mt-1">{selectedFeedback.email || 'Anonymous'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Date</Label>
                    <p className="text-white text-sm mt-1">
                      {new Date(selectedFeedback.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Technical Info */}
                {selectedFeedback.page_url && (
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Page URL</Label>
                    <p className="text-white text-sm mt-1 break-all">{selectedFeedback.page_url}</p>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="space-y-4 pt-4 border-t border-slate-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300 text-sm font-medium">Status</Label>
                      <Select
                        value={selectedFeedback.status}
                        onValueChange={(value) => handleStatusUpdate(selectedFeedback.id, value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-sm font-medium">Priority</Label>
                      <Select
                        value={selectedFeedback.priority}
                        onValueChange={(value) => handleStatusUpdate(selectedFeedback.id, selectedFeedback.status, value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this feedback..."
                      className="mt-1 bg-slate-700 border-slate-600 text-white"
                      rows={3}
                    />
                    <Button
                      onClick={() => handleStatusUpdate(selectedFeedback.id, selectedFeedback.status, selectedFeedback.priority, adminNotes)}
                      className="mt-2 bg-purple-600 hover:bg-purple-700"
                      disabled={updateFeedbackStatus.isPending}
                    >
                      {updateFeedbackStatus.isPending ? 'Saving...' : 'Save Notes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-400 opacity-50" />
                <p className="text-slate-400">Select a feedback item to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManager;