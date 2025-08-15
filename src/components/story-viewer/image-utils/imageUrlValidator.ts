
export const validateImageUrl = (imageUrl?: string) => {
    console.log('🔍 Validating image URL:', imageUrl);
    
    if (!imageUrl || imageUrl === '/placeholder.svg' || imageUrl.includes('placeholder.svg')) {
        console.log('❌ URL is placeholder or empty');
        return {
            isRealImageUrl: false,
            urlContainsSupabase: false,
            urlContainsStorage: false,
            urlStartsWithHttp: false,
            hasImageExtension: false
        };
    }
    
    // Skip unsplash URLs (placeholder images)
    if (imageUrl.includes('unsplash.com')) {
        console.log('❌ URL is unsplash placeholder');
        return {
            isRealImageUrl: false,
            urlContainsSupabase: false,
            urlContainsStorage: false,
            urlStartsWithHttp: true,
            hasImageExtension: false
        };
    }
    
    const urlContainsSupabase = imageUrl.includes('supabase.co');
    const urlContainsStorage = imageUrl.includes('storage');
    const urlStartsWithHttp = imageUrl.startsWith('http');
    const hasImageExtension = /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(imageUrl);
    
    // More permissive validation - accept any HTTP URL from Supabase storage OR any URL with image extension
    const isRealImageUrl = (urlStartsWithHttp && (urlContainsSupabase || urlContainsStorage)) || 
                          hasImageExtension ||
                          (urlStartsWithHttp && imageUrl.includes('blob.core.windows.net')); // Accept OpenAI generated images
    
    console.log('✅ URL validation result:', {
        isRealImageUrl,
        urlContainsSupabase,
        urlContainsStorage,
        urlStartsWithHttp,
        hasImageExtension,
        url: imageUrl
    });

    return {
        isRealImageUrl,
        urlContainsSupabase,
        urlContainsStorage,
        urlStartsWithHttp,
        hasImageExtension
    };
};
