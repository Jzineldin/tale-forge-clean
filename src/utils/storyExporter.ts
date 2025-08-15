import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/stories';

interface StorySegment {
  id: string;
  segment_text: string;
  image_url: string | null;
  audio_url: string | null;
  triggering_choice_text: string | null;
  created_at: string;
}

interface StoryExportData {
  story: Story;
  segments: StorySegment[];
  metadata: {
    exportDate: string;
    totalWords: number;
    totalSegments: number;
    hasAudio: boolean;
    hasImages: boolean;
    storyMode: string;
  };
}

export class StoryExporter {
  static async fetchStoryData(storyId: string): Promise<StoryExportData> {
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title, created_at, is_public, is_completed, story_mode, thumbnail_url, segment_count, published_at, full_story_audio_url, audio_generation_status, shotstack_render_id, shotstack_video_url, shotstack_status')
      .eq('id', storyId)
      .single();

    if (storyError) {
      throw new Error(`Failed to fetch story: ${storyError.message}`);
    }

    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('id, segment_text, image_url, audio_url, triggering_choice_text, created_at')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    if (segmentsError) {
      throw new Error(`Failed to fetch story segments: ${segmentsError.message}`);
    }

    const totalWords = segments.reduce((total, segment) => {
      return total + (segment.segment_text?.split(' ').length || 0);
    }, 0);

    const hasAudio = segments.some(segment => segment.audio_url) || !!story.full_story_audio_url;
    const hasImages = segments.some(segment => segment.image_url && segment.image_url !== '/placeholder.svg');

    return {
      story: story as Story,
      segments: segments as StorySegment[],
      metadata: {
        exportDate: new Date().toISOString(),
        totalWords,
        totalSegments: segments.length,
        hasAudio,
        hasImages,
        storyMode: story.story_mode || 'Unknown'
      }
    };
  }

  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    this.downloadFile(blob, filename);
  }

  static downloadHTMLFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    this.downloadFile(blob, filename);
  }

  static async exportAsText(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    
    let content = `# ${data.story.title || 'Untitled Story'}\n\n`;
    content += `**Story Mode:** ${data.metadata.storyMode}\n`;
    content += `**Created:** ${new Date(data.story.created_at).toLocaleDateString()}\n`;
    content += `**Total Words:** ${data.metadata.totalWords}\n`;
    content += `**Total Segments:** ${data.metadata.totalSegments}\n`;
    content += `**Exported:** ${new Date(data.metadata.exportDate).toLocaleString()}\n\n`;
    content += `---\n\n`;

    data.segments.forEach((segment, index) => {
      content += `## Chapter ${index + 1}\n\n`;
      if (segment.triggering_choice_text) {
        content += `*Choice: "${segment.triggering_choice_text}"*\n\n`;
      }
      content += `${segment.segment_text}\n\n`;
      if (segment.image_url && segment.image_url !== '/placeholder.svg') {
        content += `*[Image available: ${segment.image_url}]*\n\n`;
      }
      if (segment.audio_url) {
        content += `*[Audio available: ${segment.audio_url}]*\n\n`;
      }
      content += `---\n\n`;
    });

    if (data.story.full_story_audio_url) {
      content += `## 🎵 Complete Story Audio\n\n`;
      content += `*[Full story audio: ${data.story.full_story_audio_url}]*\n\n`;
    }

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    this.downloadTextFile(content, filename);
  }

  static async exportAsHTML(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.story.title || 'Untitled Story'}</title>
    <style>
        body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; background-color: #f9f7f4; color: #333; }
        .header { border-bottom: 2px solid #8B4513; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
        .title { font-size: 2.5em; color: #8B4513; margin-bottom: 10px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
        .metadata { background: #f0eee8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #D4AF37; }
        .chapter { margin-bottom: 40px; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .chapter h2 { color: #8B4513; border-bottom: 1px solid #D4AF37; padding-bottom: 10px; }
        .choice { font-style: italic; color: #666; background: #f8f6f0; padding: 10px; border-left: 3px solid #D4AF37; margin-bottom: 15px; }
        .story-text { font-size: 1.1em; line-height: 1.8; text-align: justify; }
        .media-content { margin: 20px 0; text-align: center; }
        .media-content img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .full-story-audio { background: #e8f4f8; padding: 20px; border-radius: 10px; margin: 30px 0; text-align: center; border: 2px solid #5bc0de; }
        audio { width: 100%; margin-top: 10px; }
        @media print { body { background: white; } .chapter { box-shadow: none; border: 1px solid #ddd; } }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${data.story.title || 'Untitled Story'}</h1>
        <div class="metadata">
            <p><strong>Story Mode:</strong> ${data.metadata.storyMode}</p>
            <p><strong>Created:</strong> ${new Date(data.story.created_at).toLocaleDateString()}</p>
            <p><strong>Total Words:</strong> ${data.metadata.totalWords}</p>
            <p><strong>Total Segments:</strong> ${data.metadata.totalSegments}</p>
            <p><strong>Exported:</strong> ${new Date(data.metadata.exportDate).toLocaleString()}</p>
        </div>
    </div>`;

    if (data.story.full_story_audio_url) {
      html += `<div class="full-story-audio">
            <h3>🎵 Complete Story Audio</h3>
            <audio controls src="${data.story.full_story_audio_url}">
                Your browser does not support the audio element.
            </audio>
        </div>`;
    }

    data.segments.forEach((segment, index) => {
      html += `<div class="chapter">
            <h2>Chapter ${index + 1}</h2>`;
      
      if (segment.triggering_choice_text) {
        html += `<div class="choice">Choice: "${segment.triggering_choice_text}"</div>`;
      }
      
      html += `<div class="story-text">${segment.segment_text.replace(/\n/g, '<br>')}</div>`;
      
      if (segment.image_url && segment.image_url !== '/placeholder.svg') {
        html += `<div class="media-content">
                <img src="${segment.image_url}" alt="Chapter ${index + 1} illustration" loading="lazy" />
            </div>`;
      }
      
      if (segment.audio_url) {
        html += `<div class="media-content">
                <audio controls src="${segment.audio_url}">
                    Your browser does not support the audio element.
                </audio>
            </div>`;
      }
      
      html += `</div>`;
    });

    html += `</body></html>`;

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    this.downloadHTMLFile(html, filename);
  }

  static async exportAsEPUB(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
    
    // For now, we'll create a structured HTML file that can be converted to EPUB
    // In a full implementation, you'd use a library like epub-gen
    const epubHTML = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8"/>
    <title>${data.story.title || 'Untitled Story'}</title>
    <style type="text/css">
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 0; padding: 20px; }
        .title-page { text-align: center; margin-bottom: 50px; page-break-after: always; }
        .title { font-size: 24pt; font-weight: bold; margin-bottom: 20px; }
        .author { font-size: 14pt; color: #666; }
        .metadata { font-size: 10pt; color: #888; margin-top: 30px; }
        .chapter { page-break-before: always; margin-bottom: 30px; }
        .chapter-title { font-size: 16pt; font-weight: bold; margin-bottom: 20px; text-align: center; }
        .choice { font-style: italic; color: #666; background: #f5f5f5; padding: 10px; margin: 15px 0; border-left: 3px solid #ccc; }
        .story-text { text-align: justify; text-indent: 1.5em; }
        .image-placeholder { text-align: center; margin: 20px 0; font-style: italic; color: #666; }
        .audio-placeholder { text-align: center; margin: 20px 0; font-style: italic; color: #666; }
        @page { margin: 1in; }
    </style>
</head>
<body>
    <div class="title-page">
        <h1 class="title">${data.story.title || 'Untitled Story'}</h1>
        <p class="author">Generated by Tale Forge</p>
        <div class="metadata">
            <p>Story Mode: ${data.metadata.storyMode}</p>
            <p>Created: ${new Date(data.story.created_at).toLocaleDateString()}</p>
            <p>Total Words: ${data.metadata.totalWords}</p>
            <p>Total Chapters: ${data.metadata.totalSegments}</p>
            <p>Exported: ${new Date(data.metadata.exportDate).toLocaleString()}</p>
        </div>
    </div>`;

    let epubBody = epubHTML;

    data.segments.forEach((segment, index) => {
      epubBody += `<div class="chapter">
            <h2 class="chapter-title">Chapter ${index + 1}</h2>`;
      
      if (segment.triggering_choice_text) {
        epubBody += `<div class="choice">Choice: "${segment.triggering_choice_text}"</div>`;
      }
      
      epubBody += `<div class="story-text">${segment.segment_text.replace(/\n/g, '</p><p>')}</div>`;
      
      if (segment.image_url && segment.image_url !== '/placeholder.svg') {
        epubBody += `<div class="image-placeholder">[Image: Chapter ${index + 1} illustration]</div>`;
      }
      
      if (segment.audio_url) {
        epubBody += `<div class="audio-placeholder">[Audio: Chapter ${index + 1} narration]</div>`;
      }
      
      epubBody += `</div>`;
    });

    if (data.story.full_story_audio_url) {
      epubBody += `<div class="chapter">
            <h2 class="chapter-title">Complete Story Audio</h2>
            <div class="audio-placeholder">[Full Story Audio Available]</div>
        </div>`;
    }

    epubBody += `</body></html>`;

    // For now, download as HTML with EPUB-ready structure
    // Users can convert this to EPUB using tools like Calibre
    const blob = new Blob([epubBody], { type: 'text/html;charset=utf-8' });
    this.downloadFile(blob, filename.replace('.epub', '_ebook.html'));
  }

  static async exportAsPDF(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    
    // Create PDF-optimized HTML
    const pdfHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.story.title || 'Untitled Story'}</title>
    <style>
        @page { size: A4; margin: 1in; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
        .title-page { text-align: center; margin-bottom: 50px; page-break-after: always; }
        .title { font-size: 24pt; font-weight: bold; margin-bottom: 20px; }
        .metadata { font-size: 10pt; color: #666; margin-top: 30px; }
        .chapter { page-break-before: always; margin-bottom: 30px; }
        .chapter-title { font-size: 16pt; font-weight: bold; margin-bottom: 20px; text-align: center; }
        .choice { font-style: italic; color: #666; background: #f5f5f5; padding: 10px; margin: 15px 0; border-left: 3px solid #ccc; }
        .story-text { text-align: justify; text-indent: 1.5em; }
        .image-placeholder { text-align: center; margin: 20px 0; font-style: italic; color: #666; border: 1px dashed #ccc; padding: 20px; }
        .audio-placeholder { text-align: center; margin: 20px 0; font-style: italic; color: #666; }
        .page-break { page-break-before: always; }
        @media print { body { background: white; } }
    </style>
</head>
<body>
    <div class="title-page">
        <h1 class="title">${data.story.title || 'Untitled Story'}</h1>
        <p style="font-size: 14pt; color: #666;">Generated by Tale Forge</p>
        <div class="metadata">
            <p>Story Mode: ${data.metadata.storyMode}</p>
            <p>Created: ${new Date(data.story.created_at).toLocaleDateString()}</p>
            <p>Total Words: ${data.metadata.totalWords}</p>
            <p>Total Chapters: ${data.metadata.totalSegments}</p>
            <p>Exported: ${new Date(data.metadata.exportDate).toLocaleString()}</p>
        </div>
    </div>`;

    let pdfBody = pdfHTML;

    data.segments.forEach((segment, index) => {
      pdfBody += `<div class="chapter">
            <h2 class="chapter-title">Chapter ${index + 1}</h2>`;
      
      if (segment.triggering_choice_text) {
        pdfBody += `<div class="choice">Choice: "${segment.triggering_choice_text}"</div>`;
      }
      
      pdfBody += `<div class="story-text">${segment.segment_text.replace(/\n/g, '</p><p>')}</div>`;
      
      if (segment.image_url && segment.image_url !== '/placeholder.svg') {
        pdfBody += `<div class="image-placeholder">[Image: Chapter ${index + 1} illustration]<br/><small>Image URL: ${segment.image_url}</small></div>`;
      }
      
      if (segment.audio_url) {
        pdfBody += `<div class="audio-placeholder">[Audio: Chapter ${index + 1} narration]</div>`;
      }
      
      pdfBody += `</div>`;
    });

    if (data.story.full_story_audio_url) {
      pdfBody += `<div class="page-break">
            <h2 class="chapter-title">Complete Story Audio</h2>
            <div class="audio-placeholder">[Full Story Audio Available]<br/><small>Audio URL: ${data.story.full_story_audio_url}</small></div>
        </div>`;
    }

    pdfBody += `
    <div class="page-break">
        <h2 class="chapter-title">Instructions</h2>
        <p>To convert this HTML file to PDF:</p>
        <ol>
            <li>Open this file in your web browser</li>
            <li>Press Ctrl+P (or Cmd+P on Mac) to print</li>
            <li>Select "Save as PDF" as the destination</li>
            <li>Choose appropriate settings and save</li>
        </ol>
        <p>For best results, use Chrome or Edge browser for PDF conversion.</p>
    </div>
    </body></html>`;

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_pdf.html`;
    const blob = new Blob([pdfBody], { type: 'text/html;charset=utf-8' });
    this.downloadFile(blob, filename);
  }


  static async exportAsJSON(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    const jsonContent = JSON.stringify(data, null, 2);
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.json`;
    this.downloadTextFile(jsonContent, filename);
  }

  static async exportAsMarkdown(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    
    let content = `# ${data.story.title || 'Untitled Story'}\n\n`;
    content += `**Story Mode:** ${data.metadata.storyMode}  \n`;
    content += `**Created:** ${new Date(data.story.created_at).toLocaleDateString()}  \n`;
    content += `**Total Words:** ${data.metadata.totalWords}  \n`;
    content += `**Total Segments:** ${data.metadata.totalSegments}  \n`;
    content += `**Exported:** ${new Date(data.metadata.exportDate).toLocaleString()}  \n\n`;
    content += `---\n\n`;

    data.segments.forEach((segment, index) => {
      content += `## Chapter ${index + 1}\n\n`;
      if (segment.triggering_choice_text) {
        content += `> **Choice:** "${segment.triggering_choice_text}"\n\n`;
      }
      content += `${segment.segment_text}\n\n`;
      if (segment.image_url && segment.image_url !== '/placeholder.svg') {
        content += `![Chapter ${index + 1} illustration](${segment.image_url})\n\n`;
      }
      if (segment.audio_url) {
        content += `🎵 [Chapter ${index + 1} Audio](${segment.audio_url})\n\n`;
      }
      content += `---\n\n`;
    });

    if (data.story.full_story_audio_url) {
      content += `## 🎵 Complete Story Audio\n\n`;
      content += `[Full Story Audio](${data.story.full_story_audio_url})\n\n`;
    }

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    this.downloadTextFile(content, filename);
  }

  static async downloadImages(storyId: string, title: string): Promise<void> {
    const data = await this.fetchStoryData(storyId);
    const images = data.segments.filter(s => s.image_url && s.image_url !== '/placeholder.svg');
    
    if (images.length === 0) {
      alert('No images found in this story to download.');
      return;
    }

    let html = `<!DOCTYPE html>
<html>
<head>
    <title>${data.story.title} - Images</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .header { text-align: center; margin-bottom: 30px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .image-container { margin-bottom: 30px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        h3 { margin-bottom: 10px; color: #333; }
        .download-link { display: inline-block; margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .download-link:hover { background: #0056b3; }
        .instructions { background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.story.title} - All Images</h1>
        <div class="instructions">
            <p><strong>How to download images:</strong></p>
            <p>Right-click on any image and select "Save image as..." to download it to your computer.</p>
        </div>
    </div>`;

    images.forEach((segment) => {
      const chapterIndex = data.segments.indexOf(segment) + 1;
      html += `<div class="image-container">
        <h3>Chapter ${chapterIndex} Image</h3>
        <img src="${segment.image_url}" alt="Chapter ${chapterIndex} illustration" />
        <br/>
        <a href="${segment.image_url}" download="chapter_${chapterIndex}_image" class="download-link">Download Image</a>
    </div>`;
    });

    html += `</body></html>`;

    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_images.html`;
    this.downloadHTMLFile(html, filename);
  }

  // Utility method to get all available export formats
  static getAvailableFormats(): Array<{value: string, label: string, description: string}> {
    return [
      { value: 'text', label: 'Plain Text (.txt)', description: 'Simple text format, compatible with all devices' },
      { value: 'html', label: 'Web Page (.html)', description: 'Rich HTML format with images and styling' },
      { value: 'markdown', label: 'Markdown (.md)', description: 'Markdown format, perfect for documentation' },
      { value: 'epub', label: 'E-book (.epub)', description: 'E-book format for e-readers (HTML-based)' },
      { value: 'pdf', label: 'PDF Ready (.html)', description: 'PDF-optimized HTML (convert via browser print)' },
      { value: 'json', label: 'Data Export (.json)', description: 'Complete story data in JSON format' },
      { value: 'images', label: 'Images (.html)', description: 'All story images in a downloadable gallery' }
    ];
  }
}
