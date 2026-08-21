import fs from 'fs'

// Minimal 1x1 transparent PNG buffer
const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
const buffer = Buffer.from(transparentPngBase64, 'base64')

fs.writeFileSync('public/placeholder.png', buffer)
if (fs.existsSync('app/public')) {
  fs.writeFileSync('app/public/placeholder.png', buffer)
}
if (fs.existsSync('.output/public')) {
  fs.writeFileSync('.output/public/placeholder.png', buffer)
}
console.log('✅ placeholder.png substituído por buffer limpo e transparente!')
