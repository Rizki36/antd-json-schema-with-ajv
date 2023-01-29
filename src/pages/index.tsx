import type { JSONSchemaType } from 'ajv';
import { Button, Checkbox, Form, Input, InputNumber } from 'antd';

import useJsonSchema from '@/hooks/useJsonSchema';

type SchemaData = {
  username: string;
  password: string;
  phone: string;
  age?: number;
  acceptTerms: boolean;
};

// prefix local just for example when field name is different with json schema
type LocalData = {
  localUsername: string;
  localPassword: string;
  localPhone: string;
  localAge: number;
  localAcceptTerms: boolean;
};

const Index = () => {
  const [form] = Form.useForm<LocalData>();

  // TODO: get from api
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

  const { validate, validateField, mapErrorsToFields } = useJsonSchema<
    SchemaData,
    keyof SchemaData
  >(jsonSchema, {
    mapFields: {
      username: 'localUsername',
      password: 'localPassword',
      phone: 'localPhone',
      age: 'localAge',
    },
  });

  const onFinish = (values: any) => {
    const formattedValues = {
      username: values?.localUsername,
      password: values?.localPassword,
      passwordConfirmation: values?.localPasswordConfirmation,
    };

    validate(formattedValues, {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: () => {
        const fields = mapErrorsToFields();
        form.setFields(fields); // set error to form
      },
    });
  };

  return (
    <div className="p-9">
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
      >
        <Form.Item
          label="Username"
          name="localUsername"
          rules={[
            {
              validator: validateField('username'),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="localPassword"
          rules={[
            {
              validator: validateField('password'),
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="phone with regex"
          name="localPhone"
          rules={[
            {
              validator: validateField('phone'),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="age (optional)"
          name="localAge"
          rules={[
            {
              validator: validateField('age'),
            },
          ]}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          name="localAcceptTerms"
          valuePropName="checked"
          wrapperCol={{ offset: 8, span: 16 }}
          rules={[
            {
              validator: validateField('acceptTerms'),
            },
          ]}
        >
          <Checkbox>Accept term</Checkbox>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="default" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Index;
