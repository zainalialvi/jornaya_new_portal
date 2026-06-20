import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, InputNumber, Switch, Popconfirm, Divider, message } from 'antd';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import EmptyState from '../../components/EmptyState';

const fieldTypeColors = {
  text: '#3b82f6',
  textarea: '#3b82f6',
  number: '#8b5cf6',
  date: '#f59e0b',
  email: '#22c55e',
  phone: '#06b6d4',
  select: '#ec4899',
  radio: '#ec4899',
  checkbox: '#ec4899',
};

const FieldTypeBadge = ({ type }) => (
  <span style={{
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '2px 8px',
    borderRadius: 20,
    background: `${fieldTypeColors[type] || '#8b8fa8'}22`,
    color: fieldTypeColors[type] || '#8b8fa8',
    flexShrink: 0,
  }}>
    {type}
  </span>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const FormBuilderPage = () => {
  const { id: companyId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [fieldForm] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [fieldType, setFieldType] = useState('text');
  const [options, setOptions] = useState([]);
  const [optionInput, setOptionInput] = useState('');

  const fetchForm = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/companies/${companyId}/form`);
      setForm(response.data);
      setFields(response.data.schema || []);
    } catch (error) {
      if (error.response?.status !== 404) {
        message.error('Failed to load form');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [companyId]);

  const handleAddField = () => {
    setEditingIndex(null);
    fieldForm.resetFields();
    setOptions([]);
    setFieldType('text');
    setIsEditorOpen(true);
  };

  const handleSaveField = (values) => {
    const newField = {
      id: values.id,
      name: values.name,
      type: fieldType,
      required: values.required || false,
      validations: {
        minLength: values.minLength,
        maxLength: values.maxLength,
        regex: values.regex,
        min: values.min,
        max: values.max,
      },
      options: ['select', 'radio', 'checkbox'].includes(fieldType) ? options : undefined,
      default: values.default,
    };

    if (editingIndex !== null) {
      const updatedFields = [...fields];
      updatedFields[editingIndex] = newField;
      setFields(updatedFields);
    } else {
      setFields([...fields, newField]);
    }

    setIsEditorOpen(false);
    fieldForm.resetFields();
    setOptions([]);
  };

  const handleRemoveField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSaveForm = async () => {
    if (fields.length === 0) {
      message.error('Please add at least one field');
      return;
    }
    try {
      await api.post(`/companies/${companyId}/form`, { schema: fields });
      message.success('Form created successfully');
      fetchForm();
    } catch (error) {
      message.error(error.response?.data?.detail || 'Failed to create form');
    }
  };

  const handleDeleteForm = async () => {
    try {
      await api.delete(`/companies/${companyId}/form/${form._id}`);
      message.success('Form deleted successfully');
      setForm(null);
      setFields([]);
      setIsEditorOpen(false);
    } catch (error) {
      message.error('Failed to delete form');
    }
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const panelBase = {
    background: '#1a1d2e',
    border: '1px solid #2a2d3e',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
  };

  const displayFields = form ? form.schema : fields;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#e8eaf6', margin: 0 }}>Form Builder</h1>
        <p style={{ fontSize: 14, color: '#8b8fa8', margin: '4px 0 0' }}>
          {form ? 'Active form — delete to make changes' : 'Build and configure your company form'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* LEFT PANEL — Field List */}
        <div style={{ ...panelBase, width: '40%', minWidth: 0, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#e8eaf6' }}>Form Fields</span>
            {!form && (
              <Button
                type="primary"
                size="small"
                onClick={handleAddField}
                style={{ borderRadius: 6, fontWeight: 500 }}
              >
                + Add Field
              </Button>
            )}
          </div>

          {displayFields.length === 0 ? (
            <EmptyState
              type="form"
              title="No fields added"
              description="Click 'Add Field' to start building your form. You can add text, number, date, and more."
            />
          ) : (
            <div style={{ flex: 1 }}>
              {displayFields.map((field, index) => (
                <div
                  key={field.id || index}
                  style={{
                    background: '#13151f',
                    border: '1px solid #2a2d3e',
                    borderRadius: 8,
                    padding: '14px 16px',
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <FieldTypeBadge type={field.type} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#e8eaf6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {field.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#8b8fa8' }}>{field.id}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {field.required && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: 20,
                        background: 'rgba(34,197,94,0.15)',
                        color: '#22c55e',
                      }}>
                        Required
                      </span>
                    )}
                    {!form && (
                      <button
                        onClick={() => handleRemoveField(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#555870',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: 4,
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#555870'; }}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!form && fields.length > 0 && (
              <Button
                type="primary"
                onClick={handleSaveForm}
                block
                style={{ height: 44, fontWeight: 600, borderRadius: 8 }}
              >
                Save Form
              </Button>
            )}
            {form && (
              <Popconfirm
                title="Delete this form?"
                description="All fields will be removed. This cannot be undone."
                onConfirm={handleDeleteForm}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  block
                  style={{ height: 44, borderRadius: 8, fontWeight: 600 }}
                >
                  Delete Form
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ ...panelBase, flex: 1, minWidth: 0, padding: 24, minHeight: 400 }}>

          {/* Form exists — show active notice */}
          {form && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px', textAlign: 'center' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#e8eaf6', marginBottom: 8 }}>Form Active</div>
              <div style={{ fontSize: 14, color: '#8b8fa8', maxWidth: 300 }}>
                This company has an active form with {form.schema?.length || 0} field{(form.schema?.length || 0) !== 1 ? 's' : ''}.
              </div>
              <div style={{ fontSize: 13, color: '#555870', marginTop: 12 }}>
                Delete the form to make changes.
              </div>
            </div>
          )}

          {/* No form, editor not open — placeholder */}
          {!form && !isEditorOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px', textAlign: 'center', color: '#555870' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#555870" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="15" x2="12" y2="15" />
              </svg>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#8b8fa8', marginBottom: 6 }}>No field selected</div>
              <div style={{ fontSize: 13 }}>Click "Add Field" to configure and add a new field</div>
            </div>
          )}

          {/* No form, editor open — field editor */}
          {!form && isEditorOpen && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#e8eaf6' }}>Add New Field</span>
                <button
                  onClick={() => { setIsEditorOpen(false); fieldForm.resetFields(); setOptions([]); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8b8fa8',
                    fontSize: 20,
                    lineHeight: 1,
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#e8eaf6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8b8fa8'; }}
                >
                  ×
                </button>
              </div>
              <Divider style={{ margin: '16px 0' }} />

              <Form form={fieldForm} onFinish={handleSaveField} layout="vertical" requiredMark={false}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Basic Info
                  </div>
                  <Form.Item name="id" label="Field ID" rules={[{ required: true, message: 'Field ID is required' }]} style={{ marginBottom: 16 }}
                    extra={<span style={{ fontSize: 12, color: '#555870' }}>Use snake_case, no spaces (e.g. first_name)</span>}
                  >
                    <Input placeholder="first_name" />
                  </Form.Item>
                  <Form.Item name="name" label="Field Label" rules={[{ required: true, message: 'Label is required' }]} style={{ marginBottom: 16 }}>
                    <Input placeholder="First Name" />
                  </Form.Item>
                  <Form.Item label="Field Type" style={{ marginBottom: 16 }}>
                    <Select value={fieldType} onChange={(val) => { setFieldType(val); setOptions([]); }}>
                      <Select.Option value="text">Text</Select.Option>
                      <Select.Option value="textarea">Textarea</Select.Option>
                      <Select.Option value="number">Number</Select.Option>
                      <Select.Option value="date">Date</Select.Option>
                      <Select.Option value="email">Email</Select.Option>
                      <Select.Option value="phone">Phone</Select.Option>
                      <Select.Option value="select">Select</Select.Option>
                      <Select.Option value="radio">Radio</Select.Option>
                      <Select.Option value="checkbox">Checkbox</Select.Option>
                    </Select>
                  </Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#8b8fa8' }}>Required</span>
                    <Form.Item name="required" valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Switch size="small" />
                    </Form.Item>
                  </div>
                </div>

                {(fieldType === 'number' || ['text', 'textarea', 'email', 'phone'].includes(fieldType)) && (
                  <>
                    <Divider style={{ margin: '16px 0' }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                      Validations
                    </div>
                    {fieldType === 'number' && (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <Form.Item name="min" label="Min Value" style={{ flex: 1, marginBottom: 0 }}>
                          <InputNumber style={{ width: '100%' }} placeholder="0" />
                        </Form.Item>
                        <Form.Item name="max" label="Max Value" style={{ flex: 1, marginBottom: 0 }}>
                          <InputNumber style={{ width: '100%' }} placeholder="100" />
                        </Form.Item>
                      </div>
                    )}
                    {['text', 'textarea'].includes(fieldType) && (
                      <>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                          <Form.Item name="minLength" label="Min Length" style={{ flex: 1, marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} placeholder="0" />
                          </Form.Item>
                          <Form.Item name="maxLength" label="Max Length" style={{ flex: 1, marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} placeholder="255" />
                          </Form.Item>
                        </div>
                        <Form.Item name="regex" label="Regex Pattern" style={{ marginBottom: 0 }}>
                          <Input placeholder="^[a-zA-Z]+$" />
                        </Form.Item>
                      </>
                    )}
                    {['email', 'phone'].includes(fieldType) && (
                      <Form.Item name="regex" label="Regex Pattern" style={{ marginBottom: 0 }}>
                        <Input placeholder="Custom regex pattern" />
                      </Form.Item>
                    )}
                  </>
                )}

                {['select', 'radio', 'checkbox'].includes(fieldType) && (
                  <>
                    <Divider style={{ margin: '16px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Options</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <Input
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        placeholder="Enter option value"
                        onPressEnter={handleAddOption}
                        style={{ flex: 1 }}
                      />
                      <Button onClick={handleAddOption} style={{ borderColor: '#2a2d3e', color: '#8b8fa8' }}>
                        + Add
                      </Button>
                    </div>
                    {options.map((option, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#13151f',
                          border: '1px solid #2a2d3e',
                          borderRadius: 6,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 13, color: '#e8eaf6' }}>{option}</span>
                        <button
                          onClick={() => handleRemoveOption(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#555870',
                            fontSize: 16,
                            lineHeight: 1,
                            padding: 2,
                            fontFamily: "'Inter', sans-serif",
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#555870'; }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </>
                )}

                <Divider style={{ margin: '16px 0' }} />
                <Form.Item name="default" label="Default Value" style={{ marginBottom: 20 }}>
                  <Input placeholder="Optional default value" />
                </Form.Item>

                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    onClick={() => { setIsEditorOpen(false); fieldForm.resetFields(); setOptions([]); }}
                    style={{ flex: 1, height: 40, borderColor: '#2a2d3e', color: '#8b8fa8', borderRadius: 8 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ flex: 1, height: 40, fontWeight: 600, borderRadius: 8 }}
                  >
                    Add Field
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilderPage;
