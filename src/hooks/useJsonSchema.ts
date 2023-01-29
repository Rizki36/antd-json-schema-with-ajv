import type { JTDSchemaType } from 'ajv/dist/core';

const useJsonSchema = <T>(schema: JTDSchemaType<T>) => {
  console.log(schema);
};

export default useJsonSchema;
