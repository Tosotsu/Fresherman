import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Helper function to sync data with Supabase
export async function syncDataWithSupabase<T extends { id?: string; user_id?: string }>(
  table: string,
  data: T[], 
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    console.error('syncDataWithSupabase: Aborted - User not authenticated');
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const updates = [];
    const inserts = [];

    console.log(`syncDataWithSupabase: Processing ${data.length} items for table ${table}`);

    for (const item of data) {
      // Remove updated_at and created_at, rely on database triggers/defaults
      const { updated_at, created_at, ...itemData } = item as any;
      const record = { ...itemData, user_id: userId };
      
      if (item.id) {
        console.log(`syncDataWithSupabase: Preparing UPDATE for ID ${item.id}`, record);
        updates.push(supabase.from(table).update(record).eq('id', item.id).eq('user_id', userId));
      } else {
        console.log(`syncDataWithSupabase: Preparing INSERT`, record); // Log the record being inserted
        inserts.push(supabase.from(table).insert(record));
      }
    }

    // Execute all updates and inserts
    if (updates.length > 0) {
      console.log(`syncDataWithSupabase: Executing ${updates.length} updates...`);
      const updateResults = await Promise.all(updates);
      console.log('syncDataWithSupabase: Update results:', updateResults);
      for (const result of updateResults) {
        if (result.error) throw result.error; // Throw first update error
      }
    }
    if (inserts.length > 0) {
      console.log(`syncDataWithSupabase: Executing ${inserts.length} inserts...`);
      const insertResults = await Promise.all(inserts);
      console.log('syncDataWithSupabase: Insert results:', insertResults);
      for (const result of insertResults) {
        if (result.error) { // Log specific insert error before throwing
            console.error('syncDataWithSupabase: Insert failed!', result.error);
            throw result.error; 
        }
      }
    }
    
    console.log(`syncDataWithSupabase: Sync successful for table ${table}`);
    return { success: true };
  } catch (error) {
    console.error(`syncDataWithSupabase: Error syncing data for table ${table}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred during sync' 
    };
  }
}

// Helper function to retrieve user data from Supabase
export async function fetchUserData<T>(
  table: string,
  userId: string
): Promise<{ data: T[] | null; error: string | null }> {
  if (!userId) {
    return { data: null, error: 'User not authenticated' };
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching data from Supabase for table ${table}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Helper to get the current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper to delete an item
export async function deleteItem(
  table: string,
  itemId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting item from ${table}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 