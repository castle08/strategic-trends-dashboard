import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Test 1: Check environment variables
    results.tests.environment = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing',
      urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    };
    
    // Test 2: Check table exists
    try {
      console.log('📋 Testing table access...');
      const { data, error } = await supabase
        .from('trends')
        .select('count')
        .limit(1);
      
      if (error) {
        results.tests.tableAccess = {
          success: false,
          error: error.message,
          code: error.code
        };
      } else {
        results.tests.tableAccess = {
          success: true,
          message: 'Table accessible'
        };
      }
    } catch (error) {
      results.tests.tableAccess = {
        success: false,
        error: error.message
      };
    }
    
    // Test 3: Try to insert test data
    try {
      console.log('📝 Testing insert...');
      const testData = {
        trends: [{ id: 'test', title: 'Test Trend' }],
        generatedat: new Date().toISOString(),
        lastupdated: new Date().toISOString(),
        storagetype: 'test',
        version: '1.0'
      };
      
      const { data, error } = await supabase
        .from('trends')
        .insert([testData])
        .select();
      
      if (error) {
        results.tests.insert = {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details
        };
      } else {
        results.tests.insert = {
          success: true,
          message: 'Insert successful',
          id: data[0]?.id
        };
        
        // Clean up test data
        if (data[0]?.id) {
          await supabase
            .from('trends')
            .delete()
            .eq('id', data[0].id);
        }
      }
    } catch (error) {
      results.tests.insert = {
        success: false,
        error: error.message
      };
    }
    
    console.log('📊 Supabase test results:', results);
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error in Supabase test:', error);
    return res.status(500).json({ 
      error: 'Failed to test Supabase',
      details: error.message,
      stack: error.stack
    });
  }
}
