import type { JSONSchemaType, ValidateFunction } from 'ajv';
import Ajv from 'ajv';
import AjvErrors from 'ajv-errors';
import type { RuleObject } from 'antd/es/form';
import type { StoreValue } from 'antd/es/form/interface';
import { useMemo } from 'react';

const ajv = new Ajv({
  strict: false,
  allErrors: true,
});

AjvErrors(ajv);

type UseJsonSchemaOptions = {
  mapFields: Record<string, string>;
};

type ValidateOptions<D> = {
  onSuccess?: (data: D, validator: ValidateFunction<D>) => void;
  onError?: (
    errors: ValidateFunction['errors'],
    validator: ValidateFunction<D>
  ) => void;
};

/**
 * D - the type of the data to be validated
 * SFN - the type of the schema field name
 */
function useJsonSchema<D = unknown, SFN = string>(
  schema: JSONSchemaType<D>,
  options: UseJsonSchemaOptions
) {
  const validator = useMemo(() => {
    const finalSchema = {
      ...schema,
    };
    return ajv.compile<D>(finalSchema);
  }, [ajv, schema]);

  /**
   * validate all data, to make sure that all fields are valid
   */
  const validate = (data: unknown, validateOptions?: ValidateOptions<D>) => {
    if (validator(data)) {
      validateOptions?.onSuccess?.(data as D, validator);
    } else {
      validateOptions?.onError?.(validator.errors, validator);
    }
  };

  /**
   * validate a single field
   */
  const validateField =
    (SchemaFieldName: SFN) => (rule: RuleObject, value: StoreValue) => {
      // @ts-ignore
      const localField = rule?.field;

      const data = {
        [`${SchemaFieldName}`]: value,
      };

      if (validator(data)) {
        return Promise.resolve();
      }

      const errorsFields = errorsToFields(validator.errors, {
        [`${SchemaFieldName}`]: localField,
      });

      const currentFieldError = errorsFields.find(
        (error) => error.name === localField
      );

      if (!currentFieldError) return Promise.resolve();

      if (currentFieldError.errors?.[0]) {
        return Promise.reject(currentFieldError.errors[0]);
      }

      return Promise.resolve();
    };

  /**
   * for set fields errors using form.setFields
   */
  const mapErrorsToFields = () => {
    return errorsToFields(validator.errors, options.mapFields);
  };

  return { validate, validateField, mapErrorsToFields };
}

/**
 * mapper - a map of schema field name to local field name
 */
const errorsToFields = (
  errors: ValidateFunction['errors'],
  mapper: Record<string, string> // { schemaFieldName: 'localFieldName' }
) => {
  if (!errors || !mapper) return [];

  const fields: { name: string; errors: string[] }[] = [];

  errors?.forEach((error) => {
    // handle errorMessage from ajv-errors
    if (error.keyword === 'errorMessage') {
      if (error.params.errors) {
        error.params.errors.forEach((err: any) => {
          if (err.keyword === 'required') {
            const fieldName = mapper[err.params.missingProperty];
            if (error?.message && fieldName) {
              fields.push({
                name: fieldName,
                errors: [error.message],
              });
            }
          }
          if (err.instancePath) {
            const fieldName = getFieldName(err.instancePath, mapper);
            if (error.message && fieldName) {
              fields.push({
                name: fieldName,
                errors: [error.message],
              });
            }
          }
        });
      }
      return;
    }

    // handle errorMessage from default ajv
    if (error.keyword === 'required') {
      if (error.params.missingProperty) {
        const fieldName = mapper[error.params.missingProperty];
        if (error?.message && fieldName) {
          fields.push({
            name: fieldName,
            errors: [error.message],
          });
        }
      }
    }
    if (error.instancePath) {
      const fieldName = getFieldName(error.instancePath, mapper);

      if (error.message && fieldName) {
        fields.push({
          name: fieldName,
          errors: [error.message],
        });
      }
    }
  });

  return fields;
};

// TODO: handle nested fields
const getFieldName = (path: string, mapper: Record<string, string>) => {
  const pathParts = path.split('/');
  const fieldName = pathParts[pathParts.length - 1];
  if (!fieldName) return null;

  return mapper[fieldName];
};

export default useJsonSchema;
