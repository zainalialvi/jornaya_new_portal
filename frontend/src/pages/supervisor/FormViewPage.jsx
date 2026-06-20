import React, { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import FormRenderer from '../../components/FormRenderer';
import { useAuth } from '../../context/AuthContext';

const FormViewPage = () => {
  const [formSchema, setFormSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const { companyId } = useAuth();
  const { control, formState: { errors } } = useForm();

  useEffect(() => {
    if (!companyId) return;
    const fetchForm = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/companies/${companyId}/form`);
        setFormSchema(response.data);
      } catch (error) {
        if (error.response?.status !== 404) {
          message.error('Failed to load form');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [companyId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#8b8fa8', fontSize: 14 }}>
        Loading form...
      </div>
    );
  }

  if (!formSchema) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 0' }}>
        <div style={{
          background: '#1a1d2e',
          border: '1px solid #2a2d3e',
          borderRadius: 16,
          padding: '40px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#8b8fa8', fontSize: 14, margin: 0 }}>
            No form has been configured for your company yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#8b8fa8', margin: 0 }}>
          Read-only preview of the form submitted by users
        </p>
      </div>

      <div style={{
        background: '#1a1d2e',
        border: '1px solid #2a2d3e',
        borderRadius: 16,
        padding: '36px 40px',
      }}>
        <Form layout="vertical" requiredMark={false}>
          <FormRenderer schema={formSchema.schema} control={control} errors={errors} disabled />
        </Form>
      </div>
    </div>
  );
};

export default FormViewPage;
