import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../libs/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

type MutationMethod = 'post' | 'put' | 'delete';

const useApiMutation = <T>(url: string, method: MutationMethod) => {
  const [loading, setLoading] = useState(false);

  const mutate = async (data?: any): Promise<ApiResponse<T>> => {
    setLoading(true);
    try {
      const response = await api[method]<ApiResponse<T>>(url, data);
      if (response.data.success) {
        toast.success(response.data.message || 'Operation successful');
      } else {
        toast.error(response.data.message || 'Operation failed');
      }
      return response.data;
    } catch (error) {
      toast.error('An error occurred during the operation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading };
};

export default useApiMutation;
