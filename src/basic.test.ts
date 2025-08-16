import { describe, it, expect } from 'vitest'

describe('Basic Test Suite', () => {
  it('should pass a simple test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should verify strings work', () => {
    expect('Tale Forge').toContain('Tale')
  })

  it('should test arrays', () => {
    const genres = ['fantasy', 'adventure', 'mystery']
    expect(genres).toHaveLength(3)
    expect(genres).toContain('fantasy')
  })
})
