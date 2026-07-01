import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const id = query.id

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID do produto é obrigatório',
        })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = (config.public as any).supabaseUrl || process.env.SUPABASE_URL
    const supabaseKey = (config.public as any).supabaseAnonKey || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Configuração do Supabase ausente',
        })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch only image_blob and image name/URL to determine type
    const { data, error } = await supabase
        .from('products')
        .select('image, image_blob')
        .eq('id', id)
        .single()

    if (error || !data) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Produto não encontrado',
        })
    }

    let imgBuffer: Buffer
    if (data.image_blob) {
        if (typeof data.image_blob === 'string') {
            const hex = data.image_blob.replace(/^\\x/, '')
            imgBuffer = Buffer.from(hex, 'hex')
        } else {
            imgBuffer = Buffer.from(data.image_blob)
        }
    } else if (data.image && (data.image.startsWith('http://') || data.image.startsWith('https://'))) {
        try {
            const res = await fetch(data.image)
            if (!res.ok) throw new Error('Falha ao baixar imagem externa')
            const arrayBuffer = await res.arrayBuffer()
            imgBuffer = Buffer.from(arrayBuffer)
            // Just proxy the external image without saving it to database to avoid bloat
        } catch (e) {
            console.error('Error proxying external image:', e)
            throw createError({
                statusCode: 404,
                statusMessage: 'Imagem externa indisponível',
            })
        }
    } else {
        throw createError({
            statusCode: 404,
            statusMessage: 'Imagem não encontrada',
        })
    }

    const imageUrl = data.image || ''
    const isJpg = imageUrl.toLowerCase().endsWith('.jpg') || imageUrl.toLowerCase().endsWith('.jpeg')
    const contentType = isJpg ? 'image/jpeg' : 'image/png'

    setHeader(event, 'Content-Type', contentType)
    return imgBuffer
})
