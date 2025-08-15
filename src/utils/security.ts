
import DOMPurify from 'dompurify';

// Rate limiting utility
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, [now]);
      return true;
    }

    const requests = this.requests.get(clientId)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(clientId, recentRequests);
    return true;
  }

  clear() {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Input validation utilities
export const validateInput = {
  storyTitle: (title: string): string => {
    if (!title || title.trim().length === 0) {
      throw new Error('Story title is required');
    }
    if (title.length > 200) {
      throw new Error('Story title cannot exceed 200 characters');
    }
    // Additional security check
    if (/<script|javascript:|vbscript:|onload=|onerror=/i.test(title)) {
      throw new Error('Invalid characters detected in story title');
    }
    return title.trim();
  },

  storyDescription: (description: string): string => {
    if (description && description.length > 1000) {
      throw new Error('Story description cannot exceed 1000 characters');
    }
    if (description && /<script|javascript:|vbscript:|onload=|onerror=/i.test(description)) {
      throw new Error('Invalid characters detected in story description');
    }
    return description.trim();
  },

  segmentText: (text: string): string => {
    if (!text || text.trim().length === 0) {
      throw new Error('Story segment text is required');
    }
    if (text.length > 5000) {
      throw new Error('Story segment cannot exceed 5000 characters');
    }
    if (/<script|javascript:|vbscript:|onload=|onerror=/i.test(text)) {
      throw new Error('Invalid characters detected in story segment');
    }
    return text.trim();
  },

  choiceText: (choice: string): string => {
    if (choice && choice.length > 200) {
      throw new Error('Choice text cannot exceed 200 characters');
    }
    if (choice && /<script|javascript:|vbscript:|onload=|onerror=/i.test(choice)) {
      throw new Error('Invalid characters detected in choice text');
    }
    return choice.trim();
  },

  email: (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    return email.toLowerCase().trim();
  },

  // Enhanced validation for TaleForge story generation pipeline
  storyPrompt: (prompt: string): string => {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Story prompt is required');
    }
    if (prompt.length > 2000) {
      throw new Error('Story prompt cannot exceed 2000 characters');
    }
    
    // Check for potentially harmful content
    const harmfulPatterns = [
      /\b(kill|murder|suicide|violence|gore|torture)\b/i,
      /\b(nude|naked|sexual|erotic|adult|porn)\b/i,
      /\b(racist|sexist|bigot|hate)\b/i,
      /<script|javascript:|vbscript:|onload=|onerror=/i,
      /\b(hack|exploit|inject|malware|virus)\b/i
    ];
    
    const foundHarmful = harmfulPatterns.some(pattern => pattern.test(prompt));
    if (foundHarmful) {
      throw new Error('Story prompt contains inappropriate content. Please use family-friendly language.');
    }
    
    return prompt.trim();
  },

  storyGenre: (genre: string): string => {
    const genreMap: Record<string, string> = {
      'bedtime': 'bedtime-stories',
      'adventures': 'adventure-exploration',
      'fantasy': 'fantasy-magic',
      'mystery': 'mystery-detective',
      'science': 'science-space',
      'educational': 'educational-stories',
      'values': 'values-lessons',
      'silly': 'silly-humor'
    };

    const validGenres = [
      'fantasy', 'sci-fi', 'mystery', 'adventure', 'horror', 'romance', 
      'thriller', 'comedy', 'drama', 'educational', 'child-adapted',
      'epic-fantasy', 'sci-fi-thriller', 'mystery-detective', 'romantic-drama',
      'adventure-quest', 'horror-story', 'comedy-adventure', 'historical-journey',
      'bedtime-stories', 'fantasy-magic', 'adventure-exploration', 'mystery-detective',
      'science-space', 'educational-stories', 'values-lessons', 'silly-humor'
    ];
    
    // Map common names to internal genre names
    const mappedGenre = genreMap[genre] || genre;
    
    if (!validGenres.includes(mappedGenre)) {
      throw new Error('Invalid story genre selected');
    }
    
    return mappedGenre;
  },

  imagePrompt: (prompt: string): string => {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Image prompt is required');
    }
    if (prompt.length > 1000) {
      throw new Error('Image prompt cannot exceed 1000 characters');
    }
    
    // Check for inappropriate image content
    const inappropriatePatterns = [
      /\b(nude|naked|sexual|erotic|adult|porn|explicit)\b/i,
      /\b(violence|gore|blood|torture|weapon)\b/i,
      /\b(racist|sexist|discriminatory|offensive)\b/i
    ];
    
    const foundInappropriate = inappropriatePatterns.some(pattern => pattern.test(prompt));
    if (foundInappropriate) {
      throw new Error('Image prompt contains inappropriate content. Please use family-friendly descriptions.');
    }
    
    return prompt.trim();
  },

  audioText: (text: string): string => {
    if (!text || text.trim().length === 0) {
      throw new Error('Audio text is required');
    }
    if (text.length > 10000) {
      throw new Error('Audio text cannot exceed 10000 characters');
    }
    
    return text.trim();
  },

  // New: UUID validation
  uuid: (id: string): string => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format');
    }
    return id;
  },

  // New: Rate limiting validation
  rateLimit: (clientId: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
    const limiter = new RateLimiter(windowMs, maxRequests);
    return limiter.isAllowed(clientId);
  }
};

// Content sanitization
export const sanitizeContent = {
  html: (content: string): string => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  },

  text: (content: string): string => {
    // Remove any HTML tags and potentially dangerous characters
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // New: URL validation and sanitization
  url: (url: string): string => {
    try {
      const parsed = new URL(url);
      // Only allow HTTPS URLs
      if (parsed.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed');
      }
      return url;
    } catch {
      throw new Error('Invalid URL format');
    }
  }
};

// Security headers for API requests
export const getSecurityHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  };
};

// New: CSRF protection
export const generateCSRFToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// New: Input length validation
export const validateLength = {
  short: (value: string, maxLength: number = 100): string => {
    if (value.length > maxLength) {
      throw new Error(`Text cannot exceed ${maxLength} characters`);
    }
    return value;
  },
  
  medium: (value: string, maxLength: number = 500): string => {
    if (value.length > maxLength) {
      throw new Error(`Text cannot exceed ${maxLength} characters`);
    }
    return value;
  },
  
  long: (value: string, maxLength: number = 2000): string => {
    if (value.length > maxLength) {
      throw new Error(`Text cannot exceed ${maxLength} characters`);
    }
    return value;
  }
};
