import { secureStorage } from '@/services/secureStorage';
import { validateInput, sanitizeContent } from '@/utils/security';
import { securityConfig } from '@/services/securityConfig';

/**
 * Utility functions for testing security implementations
 */

/**
 * Test secure storage encryption and decryption
 */
export const testSecureStorage = async (): Promise<boolean> => {
  try {
    const testData = { message: 'test security data', timestamp: Date.now() };
    
    // Test encrypted storage
    await secureStorage.setItem('security_test', testData, { encrypt: true });
    const retrievedData = await secureStorage.getItem('security_test');
    
    const isValid = retrievedData && 
                   retrievedData.message === testData.message &&
                   retrievedData.timestamp === testData.timestamp;
    
    // Clean up
    secureStorage.removeItem('security_test');
    
    console.log('✅ Secure storage test:', isValid ? 'PASSED' : 'FAILED');
    return isValid;
  } catch (error) {
    console.error('❌ Secure storage test FAILED:', error);
    return false;
  }
};

/**
 * Test input validation functions
 */
export const testInputValidation = (): boolean => {
  try {
    // Test valid inputs
    const validTitle = validateInput.storyTitle('A Valid Story Title');
    const validPrompt = validateInput.storyPrompt('Create a story about adventure');
    
    // Test input sanitization
    const sanitizedHtml = sanitizeContent.html('<script>alert("xss")</script><p>Safe content</p>');
    const sanitizedText = sanitizeContent.text('<script>malicious</script>Normal text');
    
    const isValid = validTitle === 'A Valid Story Title' &&
                   validPrompt === 'Create a story about adventure' &&
                   !sanitizedHtml.includes('<script>') &&
                   !sanitizedText.includes('<script>');
    
    console.log('✅ Input validation test:', isValid ? 'PASSED' : 'FAILED');
    return isValid;
  } catch (error) {
    console.error('❌ Input validation test FAILED:', error);
    return false;
  }
};

/**
 * Test security configuration
 */
export const testSecurityConfig = (): boolean => {
  try {
    const corsConfig = securityConfig.getCorsConfig();
    const headers = securityConfig.getSecurityHeaders();
    const validationConfig = securityConfig.getValidationConfig();
    
    const isValid = corsConfig && 
                   headers && 
                   headers.xFrameOptions === 'DENY' &&
                   validationConfig &&
                   validationConfig.maxInputLength > 0;
    
    console.log('✅ Security config test:', isValid ? 'PASSED' : 'FAILED');
    return isValid;
  } catch (error) {
    console.error('❌ Security config test FAILED:', error);
    return false;
  }
};

/**
 * Test malicious input handling
 */
export const testMaliciousInputHandling = (): boolean => {
  try {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      'onload="malicious()"',
      '<img src="x" onerror="alert(1)">',
    ];
    
    let allBlocked = true;
    
    maliciousInputs.forEach(input => {
      try {
        // These should throw errors or be sanitized
        validateInput.storyTitle(input);
        validateInput.storyPrompt(input);
        
        const sanitized = sanitizeContent.text(input);
        if (sanitized.includes('script') || sanitized.includes('javascript:') || sanitized.includes('onerror')) {
          allBlocked = false;
        }
      } catch {
        // Expected to throw errors for malicious input
      }
    });
    
    console.log('✅ Malicious input test:', allBlocked ? 'PASSED' : 'FAILED');
    return allBlocked;
  } catch (error) {
    console.error('❌ Malicious input test FAILED:', error);
    return false;
  }
};

/**
 * Run comprehensive security tests
 */
export const runSecurityTests = async (): Promise<{
  storageTest: boolean;
  validationTest: boolean;
  configTest: boolean;
  maliciousInputTest: boolean;
  overallPassed: boolean;
}> => {
  console.log('🔒 Running security tests...');
  
  const storageTest = await testSecureStorage();
  const validationTest = testInputValidation();
  const configTest = testSecurityConfig();
  const maliciousInputTest = testMaliciousInputHandling();
  
  const overallPassed = storageTest && validationTest && configTest && maliciousInputTest;
  
  console.log(`\n🔒 Security Test Summary:
  - Secure Storage: ${storageTest ? '✅ PASSED' : '❌ FAILED'}
  - Input Validation: ${validationTest ? '✅ PASSED' : '❌ FAILED'}
  - Security Config: ${configTest ? '✅ PASSED' : '❌ FAILED'}
  - Malicious Input Handling: ${maliciousInputTest ? '✅ PASSED' : '❌ FAILED'}
  
  Overall: ${overallPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return {
    storageTest,
    validationTest,
    configTest,
    maliciousInputTest,
    overallPassed
  };
};

// Auto-run tests in development mode
if (import.meta.env.DEV) {
  console.log('🔒 Development mode: Running security tests...');
  runSecurityTests().catch(console.error);
}