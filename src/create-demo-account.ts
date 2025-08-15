import { supabase } from './integrations/supabase/client';

// Function to create a demo account
async function createDemoAccount() {
  try {
    console.log('Creating demo account...');
    const { data, error } = await supabase.functions.invoke('create-demo-account');
    
    if (error) {
      console.error('Error creating demo account:', error);
      return;
    }
    
    console.log('Demo account created successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error creating demo account:', error);
  }
}

// Function to sign in with the demo account
async function signInWithDemoAccount(): Promise<any> {
  try {
    const email = import.meta.env.VITE_DEMO_ACCOUNT_EMAIL || 'demo@example.com';
    const password = import.meta.env.VITE_DEMO_ACCOUNT_PASSWORD || 'Demo123!';
    
    console.log('Signing in with demo account...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing in with demo account:', error);
      return;
    }
    
    console.log('Successfully signed in with demo account:', data.user);
    return data;
  } catch (error) {
    console.error('Unexpected error signing in with demo account:', error);
  }
}

// Create demo account and sign in
async function setupDemoAccount() {
  await createDemoAccount();
  await signInWithDemoAccount();
}

// Export the functions
export { createDemoAccount, signInWithDemoAccount, setupDemoAccount };