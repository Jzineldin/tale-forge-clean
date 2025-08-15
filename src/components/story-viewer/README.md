
# Story Image Generation Flow

## Overview
This system provides reliable real-time image updates for story segments with intelligent fallback mechanisms.

## Component Architecture

### StoryImage.tsx
- **Purpose**: Single-responsibility image display component
- **States**: 
  - Generating (spinner + "Generating image...")
  - Error (alert icon + retry button with 10s auto-retry)
  - Success (actual image with forced remount on URL change)
- **Key Features**:
  - Forces image element remount using React keys
  - Auto-retry after 10 seconds on first error
  - Manual retry button
  - Clean state transitions

### useStoryRealtimeWithPolling.ts
- **Purpose**: Hybrid real-time + polling data fetching
- **Logic**:
  - Subscribes to WebSocket updates filtered by story ID
  - Falls back to 3-second polling when WebSocket fails
  - Automatically stops polling when all images are complete
  - Updates React Query cache consistently
- **Smart Polling**: Only polls when segments have pending image generation

### StorySegmentItem.tsx
- **Purpose**: Orchestrates image display within segment layout
- **Integration**: Uses StoryImage component with segment data

## Data Flow

1. **Initial Load**: Segments load via React Query with `image_url: null`
2. **Generation Starts**: Backend updates `image_generation_status: 'in_progress'`
3. **Real-time Update**: WebSocket or polling detects `image_url` populated
4. **Cache Update**: React Query cache updated with new segment data
5. **UI Re-render**: StoryImage detects URL change and remounts `<img>` element
6. **Complete**: Spinner disappears, image appears within 100ms

## Error Handling

- **Network Errors**: Auto-retry after 10 seconds, manual retry available
- **WebSocket Failures**: Automatic fallback to 3-second polling
- **Image Load Failures**: Visual error state with retry mechanism

## Performance

- **No Excessive Polling**: Stops when all images complete
- **Efficient Re-renders**: Uses React Query cache for data consistency
- **Forced Remounts**: Prevents browser cache issues with image URLs

## TypeScript

All components are fully typed with strict mode compliance.
