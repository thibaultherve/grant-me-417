import { supabase } from './supabase';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const api = {
  get: async (endpoint) => {
    const { data, error } = await supabase
      .from(endpoint)
      .select('*');
    
    if (error) throw new ApiError(error.message, error.code);
    return { data };
  },

  post: async (endpoint, body) => {
    const { data, error } = await supabase
      .from(endpoint)
      .insert(body)
      .select()
      .single();
    
    if (error) throw new ApiError(error.message, error.code);
    return { data };
  },

  patch: async (endpoint, id, body) => {
    const { data, error } = await supabase
      .from(endpoint)
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new ApiError(error.message, error.code);
    return { data };
  },

  delete: async (endpoint, id) => {
    const { error } = await supabase
      .from(endpoint)
      .delete()
      .eq('id', id);
    
    if (error) throw new ApiError(error.message, error.code);
    return { success: true };
  },
};