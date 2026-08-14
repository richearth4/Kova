import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Progressive Web App (PWA) Validation Tests', () => {
  it('should verify that manifest.json exists and has valid configuration', () => {
    const manifestPath = path.resolve(__dirname, '../../../public/manifest.json')
    expect(fs.existsSync(manifestPath)).toBe(true)

    const rawContent = fs.readFileSync(manifestPath, 'utf-8')
    const json = JSON.parse(rawContent)

    expect(json.short_name).toBe('KOVA')
    expect(json.name).toBe('KOVA Finance')
    expect(json.display).toBe('standalone')
    expect(json.start_url).toBe('/member')
    expect(json.background_color).toBe('#0D1B2A')
  })

  it('should verify that service worker sw.js exists in public directory', () => {
    const swPath = path.resolve(__dirname, '../../../public/sw.js')
    expect(fs.existsSync(swPath)).toBe(true)

    const rawContent = fs.readFileSync(swPath, 'utf-8')
    expect(rawContent).toContain('kova-cache-v1')
    expect(rawContent).toContain('self.addEventListener')
  })
})
