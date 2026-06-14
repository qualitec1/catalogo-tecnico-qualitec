export function hexToBase64(hex: string): string {
  if (!hex) return ''
  
  // Remove PostgreSQL bytea hex prefix if present (\x)
  const cleanHex = hex.startsWith('\\x') ? hex.slice(2) : hex
  
  // Convert hex string to binary string
  const match = cleanHex.match(/.{1,2}/g)
  if (!match) return ''
  
  const binaryString = match
    .map(byte => String.fromCharCode(parseInt(byte, 16)))
    .join('')
    
  return globalThis.btoa(binaryString)
}
