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
    const supabaseUrl = process.env.SUPABASE_URL || config.public.supabase?.url
    const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || config.public.supabase?.key

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
            
            // Convert to postgres bytea hex string for Supabase
            const hex = '\\x' + imgBuffer.toString('hex')
            // Save to database so subsequent loads are local and fast
            await supabase.from('products').update({ image_blob: hex }).eq('id', id)
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
