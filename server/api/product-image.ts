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

    if (error || !data || !data.image_blob) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Imagem não encontrada',
        })
    }

    let imgBuffer: Buffer
    if (typeof data.image_blob === 'string') {
        const hex = data.image_blob.replace(/^\\x/, '')
        imgBuffer = Buffer.from(hex, 'hex')
    } else {
        imgBuffer = Buffer.from(data.image_blob)
    }

    const imageUrl = data.image || ''
    const isJpg = imageUrl.toLowerCase().endsWith('.jpg') || imageUrl.toLowerCase().endsWith('.jpeg')
    const contentType = isJpg ? 'image/jpeg' : 'image/png'

    setHeader(event, 'Content-Type', contentType)
    return imgBuffer
})
