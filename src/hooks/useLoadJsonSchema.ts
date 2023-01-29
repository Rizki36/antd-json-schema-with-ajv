import { useEffect, useState } from 'react';

// TODO: refactor to tanstack query
function useLoadJsonSchema(url: string) {
  const [jsonSchema, setJsonSchema] = useState<unknown>(); // TODO: add type
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchJsonSchema = async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        setJsonSchema(json);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
      }
    };

    fetchJsonSchema();
  }, [url]);

  return { jsonSchema, isLoading, isError };
}

export default useLoadJsonSchema;
