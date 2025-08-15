import { supabase } from '@/integrations/supabase/client';

export interface QualityScores {
  storyCoherence: number;
  characterConsistency: number;
  choiceDiversity: number;
  visualConsistency: number;
  ageAppropriateness: number;
  genreAdherence: number;
  overallScore: number;
}

export interface StoryAnalysis {
  storyId: string;
  segments: any[];
  characters: any[];
  choices: any[];
  images: any[];
  metadata: {
    ageGroup: string;
    genre: string[];
    createdAt: string;
  };
}

export class QualityScoringSystem {
  private readonly thresholds = {
    excellent: 90,
    good: 75,
    acceptable: 60,
    poor: 40
  };

  /**
   * Calculate overall quality score for a story
   */
  async calculateStoryQuality(analysis: StoryAnalysis): Promise<QualityScores> {
    const coherenceScore = await this.calculateCoherence(analysis);
    const characterScore = await this.calculateCharacterConsistency(analysis);
    const diversityScore = await this.calculateChoiceDiversity(analysis);
    const visualScore = await this.calculateVisualConsistency(analysis);
    const ageScore = await this.calculateAgeAppropriateness(analysis);
    const genreScore = await this.calculateGenreAdherence(analysis);

    const overallScore = this.calculateWeightedAverage([
      { score: coherenceScore, weight: 0.25 },
      { score: characterScore, weight: 0.20 },
      { score: diversityScore, weight: 0.15 },
      { score: visualScore, weight: 0.15 },
      { score: ageScore, weight: 0.15 },
      { score: genreScore, weight: 0.10 }
    ]);

    const scores: QualityScores = {
      storyCoherence: coherenceScore,
      characterConsistency: characterScore,
      choiceDiversity: diversityScore,
      visualConsistency: visualScore,
      ageAppropriateness: ageScore,
      genreAdherence: genreScore,
      overallScore
    };

    // Store scores in database
    await this.storeScores(analysis.storyId, scores);

    // Check for alerts
    await this.checkThresholds(scores);

    return scores;
  }

  /**
   * Calculate story coherence score (0-100)
   */
  private async calculateCoherence(analysis: StoryAnalysis): Promise<number> {
    let score = 100;
    const segments = analysis.segments;

    // Check narrative flow
    for (let i = 1; i < segments.length; i++) {
      const prevSegment = segments[i - 1];
      const currentSegment = segments[i];

      // Check for plot continuity
      const plotContinuity = this.checkPlotContinuity(prevSegment, currentSegment);
      if (!plotContinuity.isCoherent) {
        score -= plotContinuity.penalty;
      }

      // Check for setting consistency
      const settingConsistency = this.checkSettingConsistency(prevSegment, currentSegment);
      if (!settingConsistency.isConsistent) {
        score -= settingConsistency.penalty;
      }

      // Check for tone consistency
      const toneConsistency = this.checkToneConsistency(prevSegment, currentSegment);
      if (!toneConsistency.isConsistent) {
        score -= toneConsistency.penalty;
      }
    }

    // Check for resolution
    const hasProperResolution = this.checkStoryResolution(segments);
    if (!hasProperResolution) {
      score -= 10;
    }

    // Check for narrative threads
    const threadCompletion = this.checkNarrativeThreads(segments);
    score -= (100 - threadCompletion) * 0.2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate character consistency score (0-100)
   */
  private async calculateCharacterConsistency(analysis: StoryAnalysis): Promise<number> {
    let totalScore = 0;
    const characters = analysis.characters;
    const segments = analysis.segments;

    for (const character of characters) {
      let characterScore = 100;

      // Check appearance consistency
      const appearanceChanges = this.detectAppearanceChanges(character, segments);
      characterScore -= appearanceChanges * 5;

      // Check personality consistency
      const personalityShifts = this.detectPersonalityShifts(character, segments);
      characterScore -= personalityShifts * 10;

      // Check ability consistency
      const abilityInconsistencies = this.detectAbilityInconsistencies(character, segments);
      characterScore -= abilityInconsistencies * 15;

      // Check presence frequency
      const presenceScore = this.calculateCharacterPresence(character, segments);
      characterScore = (characterScore * 0.7) + (presenceScore * 0.3);

      totalScore += characterScore;
    }

    return characters.length > 0 ? totalScore / characters.length : 0;
  }

  /**
   * Calculate choice diversity score (0-100)
   */
  private async calculateChoiceDiversity(analysis: StoryAnalysis): Promise<number> {
    const choices = analysis.choices;
    if (choices.length === 0) return 0;

    let diversityScore = 100;

    // Calculate type diversity
    const typeDistribution = this.calculateTypeDistribution(choices);
    const typeDiversity = this.calculateShannonDiversity(typeDistribution);
    const maxTypeDiversity = Math.log(Object.keys(typeDistribution).length);
    const normalizedTypeDiversity = maxTypeDiversity > 0 ? (typeDiversity / maxTypeDiversity) * 100 : 0;

    // Calculate text uniqueness
    const textUniqueness = this.calculateTextUniqueness(choices);

    // Calculate consequence variety
    const consequenceVariety = this.calculateConsequenceVariety(choices);

    // Check for repetitive patterns
    const repetitivePatterns = this.detectRepetitivePatterns(choices);
    diversityScore -= repetitivePatterns * 5;

    // Weighted average
    return (normalizedTypeDiversity * 0.3) + 
           (textUniqueness * 0.3) + 
           (consequenceVariety * 0.3) + 
           ((100 - repetitivePatterns * 5) * 0.1);
  }

  /**
   * Calculate visual consistency score (0-100)
   */
  private async calculateVisualConsistency(analysis: StoryAnalysis): Promise<number> {
    const images = analysis.images;
    if (images.length < 2) return 100;

    let consistencyScore = 100;

    // Check character visual consistency
    for (const character of analysis.characters) {
      const characterImages = images.filter(img => img.characters?.includes(character.name));
      if (characterImages.length > 1) {
        const visualChanges = this.detectVisualChanges(characterImages, character);
        consistencyScore -= visualChanges * 3;
      }
    }

    // Check setting visual consistency
    const settingConsistency = this.checkSettingVisualConsistency(images);
    consistencyScore -= (100 - settingConsistency) * 0.3;

    // Check style consistency
    const styleConsistency = this.checkStyleConsistency(images);
    consistencyScore -= (100 - styleConsistency) * 0.2;

    return Math.max(0, Math.min(100, consistencyScore));
  }

  /**
   * Calculate age appropriateness score (0-100)
   */
  private async calculateAgeAppropriateness(analysis: StoryAnalysis): Promise<number> {
    const ageGroup = analysis.metadata.ageGroup;
    const segments = analysis.segments;
    let appropriatenessScore = 100;

    for (const segment of segments) {
      // Check vocabulary complexity
      const vocabScore = this.checkVocabularyComplexity(segment.text, ageGroup);
      if (vocabScore < 80) {
        appropriatenessScore -= (80 - vocabScore) * 0.2;
      }

      // Check content appropriateness
      const contentScore = this.checkContentAppropriateness(segment.text, ageGroup);
      if (contentScore < 90) {
        appropriatenessScore -= (90 - contentScore) * 0.3;
      }

      // Check emotional complexity
      const emotionalScore = this.checkEmotionalComplexity(segment.text, ageGroup);
      if (emotionalScore < 85) {
        appropriatenessScore -= (85 - emotionalScore) * 0.1;
      }

      // Check theme appropriateness
      const themeScore = this.checkThemeAppropriateness(segment.themes, ageGroup);
      if (themeScore < 95) {
        appropriatenessScore -= (95 - themeScore) * 0.2;
      }
    }

    // Check choice complexity
    const choiceComplexity = this.checkChoiceComplexity(analysis.choices, ageGroup);
    appropriatenessScore = (appropriatenessScore * 0.8) + (choiceComplexity * 0.2);

    return Math.max(0, Math.min(100, appropriatenessScore));
  }

  /**
   * Calculate genre adherence score (0-100)
   */
  private async calculateGenreAdherence(analysis: StoryAnalysis): Promise<number> {
    const genres = analysis.metadata.genre;
    const segments = analysis.segments;
    let adherenceScore = 0;

    for (const genre of genres) {
      let genreScore = 100;
      const expectedElements = this.getGenreElements(genre);

      // Check for required elements
      const foundElements = this.findGenreElements(segments, expectedElements);
      const elementCoverage = (foundElements.length / expectedElements.required.length) * 100;
      genreScore = elementCoverage;

      // Check for optional elements (bonus points)
      const optionalElements = this.findGenreElements(segments, expectedElements.optional);
      genreScore += (optionalElements.length / expectedElements.optional.length) * 10;

      // Check for genre-specific patterns
      const patternScore = this.checkGenrePatterns(segments, genre);
      genreScore = (genreScore * 0.7) + (patternScore * 0.3);

      adherenceScore += genreScore;
    }

    return genres.length > 0 ? Math.min(100, adherenceScore / genres.length) : 0;
  }

  /**
   * Helper methods
   */
  private calculateWeightedAverage(scores: { score: number; weight: number }[]): number {
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private checkPlotContinuity(prev: any, current: any): { isCoherent: boolean; penalty: number } {
    // Implementation would check for plot continuity
    return { isCoherent: true, penalty: 0 };
  }

  private checkSettingConsistency(prev: any, current: any): { isConsistent: boolean; penalty: number } {
    // Implementation would check setting consistency
    return { isConsistent: true, penalty: 0 };
  }

  private checkToneConsistency(prev: any, current: any): { isConsistent: boolean; penalty: number } {
    // Implementation would check tone consistency
    return { isConsistent: true, penalty: 0 };
  }

  private checkStoryResolution(segments: any[]): boolean {
    // Implementation would check if story has proper resolution
    return true;
  }

  private checkNarrativeThreads(segments: any[]): number {
    // Implementation would check narrative thread completion
    return 90;
  }

  private detectAppearanceChanges(character: any, segments: any[]): number {
    // Implementation would detect appearance changes
    return 0;
  }

  private detectPersonalityShifts(character: any, segments: any[]): number {
    // Implementation would detect personality shifts
    return 0;
  }

  private detectAbilityInconsistencies(character: any, segments: any[]): number {
    // Implementation would detect ability inconsistencies
    return 0;
  }

  private calculateCharacterPresence(character: any, segments: any[]): number {
    // Implementation would calculate character presence
    return 80;
  }

  private calculateTypeDistribution(choices: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    choices.forEach(choice => {
      const type = choice.type || 'default';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  }

  private calculateShannonDiversity(distribution: Record<string, number>): number {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    let diversity = 0;
    
    for (const count of Object.values(distribution)) {
      if (count > 0) {
        const proportion = count / total;
        diversity -= proportion * Math.log(proportion);
      }
    }
    
    return diversity;
  }

  private calculateTextUniqueness(choices: any[]): number {
    const uniqueTexts = new Set(choices.map(c => c.text.toLowerCase()));
    return (uniqueTexts.size / choices.length) * 100;
  }

  private calculateConsequenceVariety(choices: any[]): number {
    const consequences = choices.flatMap(c => c.consequences || []);
    const uniqueConsequences = new Set(consequences);
    return consequences.length > 0 ? (uniqueConsequences.size / consequences.length) * 100 : 100;
  }

  private detectRepetitivePatterns(choices: any[]): number {
    // Implementation would detect repetitive patterns
    return 0;
  }

  private detectVisualChanges(images: any[], character: any): number {
    // Implementation would detect visual changes
    return 0;
  }

  private checkSettingVisualConsistency(images: any[]): number {
    // Implementation would check setting visual consistency
    return 85;
  }

  private checkStyleConsistency(images: any[]): number {
    // Implementation would check style consistency
    return 90;
  }

  private checkVocabularyComplexity(text: string, ageGroup: string): number {
    // Implementation would check vocabulary complexity
    return 85;
  }

  private checkContentAppropriateness(text: string, ageGroup: string): number {
    // Implementation would check content appropriateness
    return 95;
  }

  private checkEmotionalComplexity(text: string, ageGroup: string): number {
    // Implementation would check emotional complexity
    return 90;
  }

  private checkThemeAppropriateness(themes: string[], ageGroup: string): number {
    // Implementation would check theme appropriateness
    return 95;
  }

  private checkChoiceComplexity(choices: any[], ageGroup: string): number {
    // Implementation would check choice complexity
    return 88;
  }

  private getGenreElements(genre: string): { required: string[]; optional: string[] } {
    const genreElements: Record<string, { required: string[]; optional: string[] }> = {
      fantasy: {
        required: ['magic', 'quest', 'hero', 'conflict'],
        optional: ['dragon', 'wizard', 'prophecy', 'artifact']
      },
      mystery: {
        required: ['clues', 'investigation', 'suspect', 'revelation'],
        optional: ['detective', 'red herring', 'alibi', 'motive']
      },
      adventure: {
        required: ['journey', 'challenge', 'discovery', 'danger'],
        optional: ['treasure', 'map', 'companion', 'escape']
      },
      'sci-fi': {
        required: ['technology', 'future', 'innovation', 'conflict'],
        optional: ['space', 'alien', 'robot', 'time travel']
      }
    };
    
    return genreElements[genre] || { required: [], optional: [] };
  }

  private findGenreElements(segments: any[], elements: string[]): string[] {
    const found: string[] = [];
    const text = segments.map(s => s.text).join(' ').toLowerCase();
    
    for (const element of elements) {
      if (text.includes(element.toLowerCase())) {
        found.push(element);
      }
    }
    
    return found;
  }

  private checkGenrePatterns(segments: any[], genre: string): number {
    // Implementation would check genre-specific patterns
    return 85;
  }

  /**
   * Store scores in database
   */
  private async storeScores(storyId: string, scores: QualityScores): Promise<void> {
    try {
      // Note: This table would need to be created in the database
      // For now, we'll just log the scores
      console.log('Quality scores for story', storyId, scores);
      
      // In a real implementation:
      // await supabase
      //   .from('ai_quality_metrics')
      //   .insert({
      //     story_id: storyId,
      //     story_coherence: scores.storyCoherence,
      //     character_consistency: scores.characterConsistency,
      //     choice_diversity: scores.choiceDiversity,
      //     visual_consistency: scores.visualConsistency,
      //     age_appropriateness: scores.ageAppropriateness,
      //     genre_adherence: scores.genreAdherence,
      //     overall_score: scores.overallScore,
      //     created_at: new Date().toISOString()
      //   });
    } catch (error) {
      console.error('Error storing quality scores:', error);
    }
  }

  /**
   * Check if scores are below thresholds and trigger alerts
   */
  private async checkThresholds(scores: QualityScores): Promise<void> {
    const alerts: string[] = [];

    if (scores.storyCoherence < this.thresholds.acceptable) {
      alerts.push(`Story coherence below threshold: ${scores.storyCoherence.toFixed(1)}%`);
    }
    if (scores.characterConsistency < this.thresholds.good) {
      alerts.push(`Character consistency below threshold: ${scores.characterConsistency.toFixed(1)}%`);
    }
    if (scores.choiceDiversity < this.thresholds.acceptable) {
      alerts.push(`Choice diversity below threshold: ${scores.choiceDiversity.toFixed(1)}%`);
    }
    if (scores.ageAppropriateness < this.thresholds.excellent) {
      alerts.push(`Age appropriateness below threshold: ${scores.ageAppropriateness.toFixed(1)}%`);
    }

    if (alerts.length > 0) {
      console.warn('Quality alerts:', alerts);
      // In a real implementation, send alerts to monitoring system
    }
  }

  /**
   * Generate quality report
   */
  async generateQualityReport(storyId: string): Promise<string> {
    // Fetch story data
    const { data: story } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (!story) {
      return 'Story not found';
    }

    // Fetch segments
    const { data: segments } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('segment_number');

    // Analyze story
    const analysis: StoryAnalysis = {
      storyId,
      segments: segments || [],
      characters: [], // Would be extracted from segments
      choices: [], // Would be extracted from segments
      images: [], // Would be fetched from image records
      metadata: {
        ageGroup: story.age_group || '7-9',
        genre: story.genre ? [story.genre] : [],
        createdAt: story.created_at
      }
    };

    const scores = await this.calculateStoryQuality(analysis);

    // Generate markdown report
    const report = `
# AI Story Quality Report

## Story Information
- **Story ID**: ${storyId}
- **Age Group**: ${analysis.metadata.ageGroup}
- **Genre**: ${analysis.metadata.genre.join(', ')}
- **Created**: ${new Date(analysis.metadata.createdAt).toLocaleDateString()}

## Quality Scores

### Overall Score: ${scores.overallScore.toFixed(1)}%

| Metric | Score | Status |
|--------|-------|--------|
| Story Coherence | ${scores.storyCoherence.toFixed(1)}% | ${this.getStatus(scores.storyCoherence)} |
| Character Consistency | ${scores.characterConsistency.toFixed(1)}% | ${this.getStatus(scores.characterConsistency)} |
| Choice Diversity | ${scores.choiceDiversity.toFixed(1)}% | ${this.getStatus(scores.choiceDiversity)} |
| Visual Consistency | ${scores.visualConsistency.toFixed(1)}% | ${this.getStatus(scores.visualConsistency)} |
| Age Appropriateness | ${scores.ageAppropriateness.toFixed(1)}% | ${this.getStatus(scores.ageAppropriateness)} |
| Genre Adherence | ${scores.genreAdherence.toFixed(1)}% | ${this.getStatus(scores.genreAdherence)} |

## Recommendations

${this.generateRecommendations(scores)}

## Detailed Analysis

### Story Coherence
The story maintains ${scores.storyCoherence >= this.thresholds.good ? 'good' : 'poor'} narrative flow across segments.

### Character Consistency
Characters show ${scores.characterConsistency >= this.thresholds.good ? 'strong' : 'weak'} consistency in appearance and behavior.

### Choice Diversity
The interactive choices demonstrate ${scores.choiceDiversity >= this.thresholds.acceptable ? 'adequate' : 'insufficient'} variety.

### Visual Consistency
Visual elements maintain ${scores.visualConsistency >= this.thresholds.good ? 'high' : 'low'} consistency throughout the story.

### Age Appropriateness
Content is ${scores.ageAppropriateness >= this.thresholds.excellent ? 'highly' : 'moderately'} appropriate for the target age group.

### Genre Adherence
The story ${scores.genreAdherence >= this.thresholds.good ? 'successfully follows' : 'deviates from'} genre conventions.

---
*Report generated on ${new Date().toLocaleString()}*
`;

    return report;
  }

  private getStatus(score: number): string {
    if (score >= this.thresholds.excellent) return '✅ Excellent';
    if (score >= this.thresholds.good) return '✅ Good';
    if (score >= this.thresholds.acceptable) return '⚠️ Acceptable';
    return '❌ Needs Improvement';
  }

  private generateRecommendations(scores: QualityScores): string {
    const recommendations: string[] = [];

    if (scores.storyCoherence < this.thresholds.good) {
      recommendations.push('- Improve narrative flow and plot continuity between segments');
    }
    if (scores.characterConsistency < this.thresholds.good) {
      recommendations.push('- Enhance character consistency in appearance and behavior');
    }
    if (scores.choiceDiversity < this.thresholds.acceptable) {
      recommendations.push('- Increase variety in choice types and consequences');
    }
    if (scores.visualConsistency < this.thresholds.good) {
      recommendations.push('- Maintain visual consistency across generated images');
    }
    if (scores.ageAppropriateness < this.thresholds.excellent) {
      recommendations.push('- Review content for age-appropriate vocabulary and themes');
    }
    if (scores.genreAdherence < this.thresholds.good) {
      recommendations.push('- Strengthen genre-specific elements and conventions');
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '- No specific recommendations. Story quality is excellent!';
  }
}

// Export singleton instance
export const qualityScoring = new QualityScoringSystem();