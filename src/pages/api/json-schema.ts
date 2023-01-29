// create api for get json schema
import type { JSONSchemaType } from 'ajv';
import type { NextApiRequest, NextApiResponse } from 'next';

// just for demo
type SchemaData = {
  username: string;
  password: string;
  phone: string;
  age?: number;
  acceptTerms: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<JSONSchemaType<SchemaData>>
) {
  const jsonSchema: JSONSchemaType<SchemaData> = {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        nullable: false,
        minLength: 3,
      },
      password: {
        type: 'string',
        nullable: false,
        minLength: 6,
        maxLength: 10,
      },
      phone: {
        type: 'string',
        nullable: false,
        pattern: '^((\\+62-?)|0)?[0-9]{10,13}$',
      },
      age: {
        type: 'number',
        nullable: true, // TODO: handle this case, currently if field is optional, must set nullable to true
        minimum: 18,
        maximum: 100,
      },
      acceptTerms: {
        type: 'boolean',
        nullable: false,
        const: true,
        // errorMessage is not official from json schema, but ajv support this
        errorMessage: {
          const: 'You must accept terms and conditions',
        },
      },
    },
    required: ['username', 'password', 'phone'],
  };

  res.status(200).json(jsonSchema);
}
