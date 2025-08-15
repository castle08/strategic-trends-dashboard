import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🔍 Inspecting Supabase schema...');
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Try to get schema information by querying the table
    try {
      // Get one row to see the structure
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .limit(1);
      
      if (error) {
        return res.status(200).json({
          error: 'Failed to query table',
          details: error.message,
          code: error.code
        });
      }
      
      // Get column names from the first row
      const columnNames = data.length > 0 ? Object.keys(data[0]) : [];
      
      return res.status(200).json({
        timestamp: new Date().toISOString(),
        tableName: 'trends',
        columnNames: columnNames,
        sampleRow: data[0] || null,
        rowCount: data.length
      });
      
    } catch (error) {
      return res.status(200).json({
        error: 'Failed to inspect schema',
        details: error.message
      });
    }
    
  } catch (error) {
    console.error('❌ Error in schema inspection:', error);
    return res.status(500).json({ 
      error: 'Failed to inspect schema',
      details: error.message
    });
  }
}

