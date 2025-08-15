import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AccessChecker = () => {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        
        setRole(roleData?.role || 'user')
      }
    } catch (error) {
      console.error('Error checking access:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAccessLevel = () => {
    if (!user) return 'guest'
    return role || 'user'
  }

  const getFeatures = (accessLevel: string) => {
    const features = {
      guest: {
        name: "🚪 Guest User (Not Logged In)",
        color: "bg-slate-100 border-slate-300",
        access: [
          "✅ Generate Text Stories",
          "✅ Generate Images", 
          "❌ Voice Generation",
          "❌ Save Stories",
          "❌ Premium Features",
          "❌ Admin Panel"
        ]
      },
      user: {
        name: "👤 Regular User",
        color: "bg-blue-100 border-blue-300",
        access: [
          "✅ Generate Text Stories",
          "✅ Generate Images",
          "✅ Save Stories",
          "❌ Voice Generation (Premium Only)",
          "❌ Advanced Features (Premium Only)",
          "❌ Admin Panel"
        ]
      },
      premium: {
        name: "⭐ Premium User",
        color: "bg-purple-100 border-purple-300",
        access: [
          "✅ Generate Text Stories",
          "✅ Generate Images",
          "✅ Voice Generation (ALL VOICES)",
          "✅ Save & Manage Stories",
          "✅ Premium Creation Tools",
          "✅ Advanced Features",
          "❌ Admin Panel"
        ]
      },
      admin: {
        name: "👑 ADMIN USER",
        color: "bg-red-100 border-red-300",
        access: [
          "✅ EVERYTHING Premium Users Have",
          "✅ Voice Generation (ALL VOICES)",
          "✅ Admin Panel Access",
          "✅ User Management",
          "✅ System Configuration",
          "✅ Database Access",
          "✅ FULL CONTROL"
        ]
      }
    }
    return features[accessLevel as keyof typeof features] || features.user
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2">Loading access check...</p>
        </div>
      </div>
    )
  }

  const accessLevel = getAccessLevel()
  const features = getFeatures(accessLevel)

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-slate-800">🔐 ACCESS CHECKER</h1>
      
      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User:</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> <code className="text-xs bg-slate-100 px-1 rounded">{user.id}</code></p>
              <p><strong>Role:</strong> <span className="font-bold text-blue-600">{role || 'user'}</span></p>
            </div>
          ) : (
            <p className="text-slate-600">Not logged in (Guest)</p>
          )}
        </CardContent>
      </Card>

      {/* Access Level Display */}
      <Card className={`border-2 ${features.color}`}>
        <CardHeader>
          <CardTitle className="text-2xl">{features.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {features.access.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Quick Tests:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="mr-2"
            >
              🔄 Refresh Check
            </Button>
            
            {user && (
              <Button 
                onClick={() => supabase.auth.signOut().then(() => window.location.reload())} 
                variant="destructive"
                className="mr-2"
              >
                🚪 Sign Out
              </Button>
            )}
            
            {!user && (
              <p className="text-sm text-slate-600 mt-2">
                Sign in to test user/premium/admin access
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expected Results */}
      <Card className="bg-yellow-50 border-2 border-yellow-200">
        <CardHeader>
          <CardTitle>📋 Expected Results:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            <li><strong>jzineldin@gmail.com</strong> → Should show "👑 ADMIN USER"</li>
            <li><strong>demo@tale-forge.app</strong> → Should show "⭐ Premium User"</li>
            <li><strong>hermesz.clari@gmail.com</strong> → Should show "👤 Regular User"</li>
            <li><strong>Not logged in</strong> → Should show "🚪 Guest User"</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccessChecker 