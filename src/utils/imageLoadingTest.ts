import { getStoryCoverImage, clearImageCache } from './storyCoverUtils';

/**
 * Test utility for verifying image loading functionality
 * This can be used to test the robustness of the image loading system
 */
export const testImageLoading = async () => {
  console.log('🧪 Starting image loading test...');
  
  // Clear the cache to ensure a fresh test
  clearImageCache();
  
  // Test cases with different story configurations
  const testCases = [
    {
      name: 'Story with ID and thumbnail',
      story: {
        id: '123',
        thumbnail_url: 'https://example.com/image.jpg',
        story_mode: 'Epic Fantasy'
      }
    },
    {
      name: 'Story with ID but no thumbnail',
      story: {
        id: '456',
        thumbnail_url: null,
        story_mode: 'Sci-Fi Thriller'
      }
    },
    {
      name: 'Story with thumbnail but no ID',
      story: {
        thumbnail_url: 'https://example.com/image2.jpg',
        story_mode: 'Mystery Detective'
      }
    },
    {
      name: 'Story with only mode',
      story: {
        story_mode: 'Adventure Quest'
      }
    },
    {
      name: 'Story with placeholder thumbnail',
      story: {
        id: '789',
        thumbnail_url: '/placeholder.svg',
        story_mode: 'Horror Story'
      }
    }
  ];
  
  // Run tests sequentially
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // First call - should fetch from source
      console.time(`${testCase.name} - first call`);
      const result1 = await getStoryCoverImage(testCase.story, controller.signal);
      console.timeEnd(`${testCase.name} - first call`);
      console.log('✅ First call result:', result1);
      
      // Second call - should use cache
      console.time(`${testCase.name} - second call (cached)`);
      const result2 = await getStoryCoverImage(testCase.story, controller.signal);
      console.timeEnd(`${testCase.name} - second call (cached)`);
      console.log('✅ Second call result (should be cached):', result2);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Verify results match
      if (result1 === result2) {
        console.log('✅ Results match as expected');
      } else {
        console.error('❌ Results do not match!', { result1, result2 });
      }
    } catch (error) {
      console.error(`❌ Test failed for ${testCase.name}:`, error);
    }
  }
  
  // Test abort functionality
  console.log('\n🔍 Testing abort functionality');
  try {
    const controller = new AbortController();
    
    // Abort immediately
    setTimeout(() => controller.abort(), 0);
    
    await getStoryCoverImage({
      id: '999',
      story_mode: 'Epic Fantasy'
    }, controller.signal);
    
    console.error('❌ Abort test failed - should have thrown an AbortError');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('✅ Abort functionality working correctly');
    } else {
      console.error('❌ Unexpected error in abort test:', error);
    }
  }
  
  console.log('\n🧪 Image loading test completed');
};

/**
 * Run the test and log results
 */
export const runImageLoadingTest = () => {
  console.log('🚀 Running image loading test...');
  
  testImageLoading()
    .then(() => console.log('✅ All tests completed'))
    .catch(error => console.error('❌ Test suite failed:', error));
};