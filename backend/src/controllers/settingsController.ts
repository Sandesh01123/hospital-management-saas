import { Request, Response } from 'express'
import { supabase } from '../lib/supabaseClient'

/**
 * Fetches white-label configuration settings
 * 
 * Returns hospital branding configuration including name, logo, colors, and API keys.
 * If no settings row exists, returns default configuration object.
 * 
 * @param req - Express request
 * @param res - Express response
 * @returns 200 with settings data, or error response
 */
export async function getSettings(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to fetch settings', details: error.message })
    }

    if (!data) {
      // Return default settings if no row exists
      return res.json({
        hospital_name: 'Hospital Management SaaS',
        logo_url: null,
        primary_color: '#0ea5e9',
        secondary_color: '#10b981',
        whatsapp_api_token: null,
        payment_gateway_credentials: null,
        custom_api_keys: {}
      })
    }

    return res.json(data)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Updates white-label configuration settings
 * 
 * Updates hospital branding configuration including name, logo, colors, and API keys.
 * If settings row exists, performs UPDATE. If not, performs INSERT.
 * Automatically sets updated_at timestamp.
 * 
 * @param req - Express request with settings data in body
 * @param res - Express response
 * @returns 200 with updated settings data, or error response
 */
export async function updateSettings(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const {
      hospital_name,
      logo_url,
      primary_color,
      secondary_color,
      whatsapp_api_token,
      payment_gateway_credentials,
      custom_api_keys
    } = req.body

    // Check if settings row exists
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .single()

    let data

    if (existingSettings && !checkError) {
      // Update existing
      const { data: updatedData, error: updateError } = await supabase
        .from('settings')
        .update({
          hospital_name,
          logo_url,
          primary_color,
          secondary_color,
          whatsapp_api_token,
          payment_gateway_credentials,
          custom_api_keys,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (updateError || !updatedData) {
        return res.status(500).json({ error: 'Failed to update settings', details: updateError?.message })
      }
      data = updatedData
    } else {
      // Insert new
      const { data: newData, error: insertError } = await supabase
        .from('settings')
        .insert({
          hospital_name,
          logo_url,
          primary_color,
          secondary_color,
          whatsapp_api_token,
          payment_gateway_credentials,
          custom_api_keys
        })
        .select()
        .single()

      if (insertError || !newData) {
        return res.status(500).json({ error: 'Failed to create settings', details: insertError?.message })
      }
      data = newData
    }

    return res.json(data)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * Updates hospital logo URL
 * 
 * Updates only the logo_url field in the settings table.
 * If settings row exists, performs UPDATE. If not, performs INSERT.
 * Automatically sets updated_at timestamp.
 * 
 * @param req - Express request with logo_url in body
 * @param res - Express response
 * @returns 200 with updated settings data, or error response
 */
export async function uploadLogo(req: Request, res: Response) {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database connection not available' })
    }

    const { logo_url } = req.body

    // Check if settings row exists
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .single()

    let data

    if (existingSettings && !checkError) {
      const { data: updatedData, error: updateError } = await supabase
        .from('settings')
        .update({
          logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (updateError || !updatedData) {
        return res.status(500).json({ error: 'Failed to update logo', details: updateError?.message })
      }
      data = updatedData
    } else {
      const { data: newData, error: insertError } = await supabase
        .from('settings')
        .insert({
          logo_url
        })
        .select()
        .single()

      if (insertError || !newData) {
        return res.status(500).json({ error: 'Failed to create settings with logo', details: insertError?.message })
      }
      data = newData
    }

    return res.json(data)
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
