import React from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Radio, Checkbox } from 'antd';
import { Controller } from 'react-hook-form';

const { TextArea } = Input;

const FormRenderer = ({ schema, control, errors, disabled = false }) => {
  const renderField = (field) => {
    const rules = {
      required: field.required ? `${field.name} is required` : false
    };

    const fieldProps = {
      placeholder: field.name,
      style: { width: '100%' },
      disabled,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: rules.required }}
            render={({ field: inputField }) => (
              <Input
                {...inputField}
                {...fieldProps}
                type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: rules.required }}
            render={({ field: inputField }) => (
              <TextArea {...inputField} {...fieldProps} rows={4} />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: rules.required }}
            render={({ field: inputField }) => (
              <InputNumber
                {...inputField}
                {...fieldProps}
                min={field.validations?.min}
                max={field.validations?.max}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: rules.required }}
            render={({ field: inputField }) => (
              <DatePicker {...inputField} {...fieldProps} />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: rules.required }}
            render={({ field: inputField }) => (
              <Select {...inputField} {...fieldProps}>
                {field.options?.map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: rules.required }}
            render={({ field: inputField }) => (
              <Radio.Group {...inputField} disabled={disabled}>
                {field.options?.map((option) => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: rules.required }}
            render={({ field: inputField }) => (
              <Checkbox.Group {...inputField} options={field.options} disabled={disabled} />
            )}
          />
        );

      default:
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: rules.required }}
            render={({ field: inputField }) => <Input {...inputField} {...fieldProps} />}
          />
        );
    }
  };

  return (
    <>
      {schema?.map((field) => (
        <Form.Item
          key={field.id}
          label={field.name}
          validateStatus={errors[field.id] ? 'error' : ''}
          help={errors[field.id]?.message}
          required={field.required}
        >
          {renderField(field)}
        </Form.Item>
      ))}
    </>
  );
};

export default FormRenderer;
