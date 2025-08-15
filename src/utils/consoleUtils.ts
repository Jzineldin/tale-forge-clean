// Console utility for testing welcome emails and checking founder status
import { supabase } from '@/integrations/supabase/client';

// Check current user's founder status
export const checkFounderStatus = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No authenticated user found');
    return;
  }

  console.log('👤 Current user:', user.email);
  console.log('🆔 User ID:', user.id);

  // Check founder status
  const { data: founderData, error: founderError } = await supabase
    .from('user_founders')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (founderError) {
    console.error('❌ Error checking founder status:', founderError);
    return;
  }

  if (founderData) {
    console.log('👑 FOUNDER STATUS DETECTED:');
    console.log('  - Founder tier:', founderData.founder_tier);
    console.log('  - Founder number:', founderData.founder_number);
    console.log('  - Lifetime discount:', founderData.lifetime_discount);
    console.log('  - Benefits:', founderData.benefits);
    console.log('');
    console.log('🎯 This explains why you see "Unlimited stories" - Genesis founders get Pro tier for free!');
  } else {
    console.log('✅ No founder status found - you should see normal Free tier limits');
  }

  return founderData;
};

// Remove founder status (for testing)
export const removeFounderStatus = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No authenticated user found');
    return;
  }

  const { error } = await supabase
    .from('user_founders')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('❌ Error removing founder status:', error);
    return;
  }

  console.log('✅ Founder status removed. Refresh the page to see normal Free tier limits.');
};

// Send welcome email for current user
export const sendWelcomeEmail = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No authenticated user found');
    return;
  }

  console.log('📧 Attempting to send welcome email to:', user.email);

  const { data, error } = await supabase.functions.invoke('send-welcome-email', {
    body: {
      userId: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
      isNewUser: true,
      signupMethod: 'google'
    }
  });

  if (error) {
    console.error('❌ Error sending welcome email:', error);
    return;
  }

  console.log('✅ Welcome email sent successfully!', data);
  return data;
};

// Check profiles table structure
export const checkProfilesTable = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No authenticated user found');
    return;
  }

  console.log('🔍 Checking profiles table structure...');
  
  // Try different query approaches to understand the table structure
  const queries = [
    // Try with user_id (old structure)
    { name: 'user_id approach', query: supabase.from('profiles').select('*').eq('user_id', user.id) },
    // Try with id (new structure)
    { name: 'id approach', query: supabase.from('profiles').select('*').eq('id', user.id) },
    // Try getting all profiles (limited to 5)
    { name: 'all profiles', query: supabase.from('profiles').select('*').limit(5) }
  ];

  for (const { name, query } of queries) {
    console.log(`\n🔎 Trying ${name}:`);
    const { data, error } = await query;
    
    if (error) {
      console.log(`❌ Error with ${name}:`, error.message);
    } else {
      console.log(`✅ Success with ${name}:`, data);
      if (data && data.length > 0) {
        console.log(`� Table columns found:`, Object.keys(data[0]));
        return data;
      }
    }
  }

  console.log('\n💡 None of the queries worked. The profiles table might be empty or have a different structure.');
  return null;
};

// Make functions available globally for console use
declare global {
  interface Window {
    checkFounderStatus: () => Promise<any>;
    removeFounderStatus: () => Promise<void>;
    sendWelcomeEmail: () => Promise<any>;
    checkProfilesTable: () => Promise<any>;
    checkDatabaseSchema: () => Promise<any>;
    forceCreateProfile: () => Promise<any>;
    checkSubscriptionData: () => Promise<any>;
    fixSubscriptionStatus: () => Promise<any>;
    testEffectiveTier: () => Promise<any>;
    testGetEffectiveTier: () => Promise<any>;
    fixGetEffectiveTierFunction: () => Promise<string>;
    fixGetEffectiveTierFunctionComplete: () => Promise<string>;
    refreshSubscriptionData: () => Promise<void>;
    refreshAuthSubscription: () => Promise<void>;
  }
}

// Test the get_effective_tier function
export const testEffectiveTier = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No authenticated user found');
    return;
  }

  console.log('🧪 Testing get_effective_tier function for user:', user.id);

  try {
    const { data, error } = await supabase
      .rpc('get_effective_tier', { p_user_id: user.id });

    if (error) {
      console.log('❌ Error calling get_effective_tier:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ get_effective_tier result:', data);
    }
  } catch (err) {
    console.log('❌ Exception calling get_effective_tier:', err);
  }
};

// Check subscription data in database
export const checkSubscriptionData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) {
    console.log('❌ No authenticated user found');
    return;
  }

  console.log('🔍 Checking subscription data for:', user.email);

  // Check subscribers table
  const { data: subscriberData, error: subError } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  if (subError) {
    console.log('❌ Error checking subscribers table:', subError.message);
  } else if (subscriberData) {
    console.log('📊 Subscriber data found:', subscriberData);
  } else {
    console.log('❌ No subscriber data found for email:', user.email);
  }

  // Check profiles table for tier info
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.log('❌ Error checking profile:', profileError.message);
  } else if (profileData) {
    console.log('👤 Profile data:', profileData);
  } else {
    console.log('❌ No profile found');
  }

  return { subscriberData, profileData };
};

// Fix subscription status manually
export const fixSubscriptionStatus = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) {
    console.log('❌ No authenticated user found');
    return;
  }

  console.log('🔧 Attempting to fix subscription status for:', user.email);

  // The $7.99 price corresponds to Core tier
  const subscriptionData = {
    user_id: user.id,
    email: user.email,
    subscription_tier: 'Core', // $7.99 subscription is Core tier
    is_active: true,
    subscribed: true,
    subscription_start: new Date().toISOString(),
    subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    updated_at: new Date().toISOString(),
    stripe_customer_id: 'manual_fix_' + Date.now() // Temporary until we get real customer ID
  };

  console.log('📝 Creating subscription record:', subscriptionData);

  // Insert/update subscriber record
  const { data: subData, error: subError } = await supabase
    .from('subscribers')
    .upsert(subscriptionData, {
      onConflict: 'user_id'  // Use user_id as the conflict column since it's UNIQUE
    })
    .select()
    .single();

  if (subError) {
    console.log('❌ Error updating subscribers table:', subError.message);
  } else {
    console.log('✅ Subscribers table updated:', subData);
  }

  // Update profile with tier info
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update({
      // Add tier info if the profiles table has these columns
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single();

  if (profileError) {
    console.log('❌ Error updating profile:', profileError.message);
  } else {
    console.log('✅ Profile updated:', profileData);
  }

  console.log('🔄 Refresh the page to see changes!');
  return { subData, profileData };
};

// Fix the get_effective_tier function SQL bug - Complete Version
const fixGetEffectiveTierFunctionComplete = async () => {
  console.log('🔧 Applying complete fix for get_effective_tier function...');
  console.log('📋 This will make the function return the expected object format');
  
  const fixSQL = `-- Fix get_effective_tier function to return the expected object format
-- This matches the TypeScript interface expected by the frontend

DROP FUNCTION IF EXISTS get_effective_tier(UUID);

CREATE OR REPLACE FUNCTION get_effective_tier(p_user_id UUID)
RETURNS TABLE(
  base_tier TEXT,
  effective_tier TEXT,
  subscribed BOOLEAN,
  is_active BOOLEAN,
  is_founder BOOLEAN,
  founder_tier TEXT,
  lifetime_discount INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(s.subscription_tier, 'Free')::TEXT as base_tier,
    CASE 
      WHEN s.subscribed = true AND (s.subscription_end IS NULL OR s.subscription_end > NOW()) THEN 
        COALESCE(s.subscription_tier, 'Free')::TEXT
      ELSE 'Free'::TEXT
    END as effective_tier,
    COALESCE(s.subscribed, false) as subscribed,
    CASE 
      WHEN s.subscribed = true AND (s.subscription_end IS NULL OR s.subscription_end > NOW()) THEN true
      ELSE false
    END as is_active,
    false as is_founder,  -- Simplified since we're not using founders table
    null::TEXT as founder_tier,
    0 as lifetime_discount
  FROM subscribers s
  WHERE s.user_id = p_user_id
  
  UNION ALL
  
  -- If no subscription record exists, return default values
  SELECT 
    'Free'::TEXT as base_tier,
    'Free'::TEXT as effective_tier,
    false as subscribed,
    false as is_active,
    false as is_founder,
    null::TEXT as founder_tier,
    0 as lifetime_discount
  WHERE NOT EXISTS (SELECT 1 FROM subscribers WHERE user_id = p_user_id)
  
  LIMIT 1;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_effective_tier(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_effective_tier(UUID) TO anon;`;

  console.log('� SQL to execute in Supabase SQL Editor:');
  console.log('');
  console.log(fixSQL);
  console.log('');
  console.log('💡 After running this SQL, call window.testEffectiveTier() to test');
  
  return fixSQL;
};

// Refresh subscription data to update the UI
export const refreshSubscriptionData = async () => {
  console.log('🔄 Refreshing subscription data...');
  
  // Try to get refreshSubscription from the auth context
  if (typeof window !== 'undefined' && (window as any).refreshSubscription) {
    try {
      await (window as any).refreshSubscription();
      console.log('✅ Subscription refreshed successfully!');
      console.log('🔄 Try refreshing the page if the dashboard still shows "Free"');
    } catch (error) {
      console.log('❌ Error refreshing subscription:', error);
    }
  } else {
    console.log('❌ refreshSubscription function not available');
    console.log('🔄 Try refreshing the page manually (F5 or Ctrl+R)');
  }
};

// Check database schema for profiles table
export const checkDatabaseSchema = async () => {
  console.log('🗃️ Checking database schema for profiles table...');
  console.log('❌ Cannot access information_schema through Supabase client');
  console.log('💡 You need to run this SQL query in Supabase Dashboard:');
  console.log(`
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'profiles' 
  AND table_schema = 'public';
  `);
  return null;
};

// Force create profile for current user
export const forceCreateProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No authenticated user found');
    return;
  }

  console.log('🔨 Force creating profile for current user...');
  console.log('🆔 User ID:', user.id);
  console.log('📧 User Email:', user.email);
  
  // Try to insert a profile with the new structure (using id)
  const profileData = {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    welcome_email_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('📝 Attempting to create profile with NEW structure:', profileData);

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.log('❌ Error with new structure:', error.message);
    
    // Try with old structure
    const oldProfileData = {
      user_id: user.id,
      email: user.email || '',
      display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Trying with OLD structure:', oldProfileData);
    
    // Use any to bypass TypeScript
    const { data: oldData, error: oldError } = await (supabase as any)
      .from('profiles')
      .insert(oldProfileData)
      .select()
      .single();
    
    if (oldError) {
      console.log('❌ Old structure also failed:', oldError.message);
      return null;
    } else {
      console.log('✅ Profile created with old structure:', oldData);
      return oldData;
    }
  } else {
    console.log('✅ Profile created with new structure:', data);
    return data;
  }
};

// Force refresh of AuthProvider subscription data
window.refreshAuthSubscription = async () => {
  console.log('🔄 Refreshing AuthProvider subscription data...');
  console.log('💡 After updating AuthProvider, it should now use get_effective_tier function');
  console.log('🔄 Please refresh the page to see the updated subscription tier');
  
  // Test that get_effective_tier is still working
  await window.testEffectiveTier();
};

// Test get_effective_tier function
export const testGetEffectiveTier = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No authenticated user found');
    return;
  }

  console.log('🧪 Testing get_effective_tier function for user:', user.id);

  try {
    const { data, error } = await supabase
      .rpc('get_effective_tier', { p_user_id: user.id });

    if (error) {
      console.log('❌ Error calling get_effective_tier:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ get_effective_tier result:', data);
    }
  } catch (err) {
    console.log('❌ Exception calling get_effective_tier:', err);
  }
};

// Auto-attach to window for console access
if (typeof window !== 'undefined') {
  window.checkFounderStatus = checkFounderStatus;
  window.removeFounderStatus = removeFounderStatus;
  window.sendWelcomeEmail = sendWelcomeEmail;
  window.checkProfilesTable = checkProfilesTable;
  window.checkDatabaseSchema = checkDatabaseSchema;
  window.forceCreateProfile = forceCreateProfile;
  window.checkSubscriptionData = checkSubscriptionData;
  window.fixSubscriptionStatus = fixSubscriptionStatus;
  window.testEffectiveTier = testEffectiveTier;
  window.testGetEffectiveTier = testGetEffectiveTier;
  window.fixGetEffectiveTierFunctionComplete = fixGetEffectiveTierFunctionComplete;
  window.refreshSubscriptionData = refreshSubscriptionData;
  
  console.log('🛠️ Console utilities loaded:');
  console.log('  - window.checkFounderStatus() - Check if you have founder status');
  console.log('  - window.removeFounderStatus() - Remove founder status (for testing)');
  console.log('  - window.sendWelcomeEmail() - Send welcome email manually');
  console.log('  - window.checkProfilesTable() - Check profiles table structure');
  console.log('  - window.checkDatabaseSchema() - Check database schema');
  console.log('  - window.forceCreateProfile() - Force create/update your profile');
  console.log('  - window.checkSubscriptionData() - Check subscription data');
  console.log('  - window.fixSubscriptionStatus() - Manually fix subscription status');
  console.log('  - window.testEffectiveTier() - Test get_effective_tier function');
  console.log('  - window.testGetEffectiveTier() - Test get_effective_tier function');
  console.log('  - window.fixGetEffectiveTierFunctionComplete() - Get COMPLETE SQL fix for tier function');
  console.log('  - window.refreshSubscriptionData() - Refresh subscription cache');
  console.log('  - window.refreshAuthSubscription() - Test updated AuthProvider (then refresh page)');
}
