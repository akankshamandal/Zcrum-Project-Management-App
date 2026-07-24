import { useState, useCallback } from "react";
import { toast } from "sonner";

const useFetch = <T, A extends unknown[]>(
  cb: (...args: A) => Promise<T>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = useCallback(async (...args: A) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      return response;
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : new Error("Something went wrong");

      setError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cb]);

  return {
    data,
    loading,
    error,
    fn,
    setData,
  };
};

export default useFetch;