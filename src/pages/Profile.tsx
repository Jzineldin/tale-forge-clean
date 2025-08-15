import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useSubscription } from '../hooks/useSubscription';
import { useAdminAccess } from '../hooks/useAdminAccess_enhanced';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  User, 
  Settings, 
  BookOpen, 
  Users, 
  Crown, 
  Edit3,
  TrendingUp,
  Calendar
} from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { effectiveTier, usage } = useSubscription();
  const { hasAccess: hasAdminAccess, loading: adminLoading } = useAdminAccess();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut, navigate]);

  const handleEditProfile = useCallback(() => {
    setIsEditing(true);
    navigate('/settings');
  }, [navigate]);

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'settings':
        navigate('/settings');
        break;
      case 'stories':
        navigate('/my-stories');
        break;
      case 'characters':
        navigate('/characters');
        break;
      default:
        break;
    }
  }, [navigate]);

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-body">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-heading">Profile Not Found</h1>
          <p className="text-body">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const isFounder = hasAdminAccess;
  const currentTier = effectiveTier || 'Free';
  const storiesCreated = usage?.stories_created || 0;
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const userEmail = user?.email || 'No email available';

  return (
    <ErrorBoundary fallback={<div className="text-center p-8">Something went wrong while loading your profile. Please try again.</div>}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-hero">Your Profile</h1>
            <p className="text-subheading">Manage your account and explore premium features</p>
          </div>
          
          <div className="profile-settings-container">
            <div className="profile-settings-grid">
              <div className="space-y-6">
                <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl p-8 text-center">
                  <div className="avatar-smooth w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {userInitial}
                  </div>
                  
                  <h2 className="text-heading mb-2">{userName}</h2>
                  <p className="text-body text-muted mb-4">{userEmail}</p>
                  
                  {isFounder && (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full font-semibold mb-6">
                      <Crown className="w-4 h-4" />
                      <span>Founder #1</span>
                    </div>
                  )}
                  
                  <button
                    onClick={handleEditProfile}
                    className="btn-ghost w-full"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
                
                <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl p-6">
                  <h3 className="text-heading mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    {[
                      { action: 'settings', label: 'Settings', icon: Settings },
                      { action: 'stories', label: 'My Stories', icon: BookOpen },
                      { action: 'characters', label: 'Characters', icon: Users }
                    ].map(({ action, label, icon: Icon }) => (
                      <button
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        className="btn-ghost w-full justify-start"
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass-card-enhanced p-6">
                  <h3 className="text-heading mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Usage This Month
                  </h3>
                  <p className="text-body text-muted mb-4">Track your story creation progress</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-body">Stories Created</span>
                        <span className="text-small text-muted">100% used</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-small text-muted">{storiesCreated} / ∞</span>
                        <span className="text-small text-muted">Free Tier</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl p-6">
                  <h3 className="text-heading mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-amber">{storiesCreated}</div>
                      <div className="text-small text-muted">Stories Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-amber">{currentTier}</div>
                      <div className="text-small text-muted">Current Tier</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-amber">{memberSince}</div>
                      <div className="text-small text-muted">Member Since</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-amber">
                        {isFounder ? 'Founder' : 'Standard'}
                      </div>
                      <div className="text-small text-muted">Account Type</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Profile;
