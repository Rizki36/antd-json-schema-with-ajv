import type { JSONSchemaType } from 'ajv';
import { Button, Checkbox, Form, Input, InputNumber } from 'antd';

import useJsonSchema from '@/hooks/useJsonSchema';
import useLoadJsonSchema from '@/hooks/useLoadJsonSchema';

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

  // fetch json schema from server
  const { jsonSchema } = useLoadJsonSchema('/api/json-schema');

  const { validate, validateField, mapErrorsToFields } = useJsonSchema<
    SchemaData,
    keyof SchemaData
  >(jsonSchema as JSONSchemaType<SchemaData>, {
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
