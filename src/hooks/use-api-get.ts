import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../libs/api';

// Define a generic interface for API responses
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Custom hook for making GET API requests
// T is a generic type parameter representing the expected data type
const useApiGet = <T>(url: string | null) => {
  // State hooks for data, loading status, and error
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Flag to handle component unmount scenario
    let isMounted = true;

    // Async function to fetch data
    const fetchData = async () => {
      // If no URL is provided, return early
      if (!url) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Make the GET request
        const res = await api.get<ApiResponse<T>>(url);

        // Update state only if the component is still mounted
        if (isMounted) {
          if (res.data.success && res.data.data) {
            setData(res.data.data);
          } else {
            // Throw error if API returns a failure
            throw new Error(res.data.message || 'API call failed');
          }
        }
      } catch (err) {
        // Error handling
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
          // Display error toast
          toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
        }
      } finally {
        // Set loading to false regardless of success or failure
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to run on component unmount
    return () => {
      isMounted = false;
    };
  }, [url]); // Dependency array: re-run effect if url changes

  // Return object containing data, loading status, and error
  return { data, loading, error };
};

export default useApiGet;
