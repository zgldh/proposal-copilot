import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ISettings } from '../../../shared/types';

interface ISettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const LLM_PROVIDER_OPTIONS = [
  { label: 'OpenAI', value: 'openai' as const },
  { label: 'DeepSeek', value: 'deepseek' as const },
  { label: 'Custom', value: 'custom' as const },
];

export const SettingsModal: React.FC<ISettingsModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.settings.get();
      if (result.success && result.data) {
        const settings: ISettings = {
          llm: {
            provider: result.data.provider,
            openai: result.data.openai,
            deepseek: result.data.deepseek,
            custom: result.data.custom,
          },
          project: {},
        };
        form.setFieldsValue(settings);
      }
    } catch (error) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const activeProvider = values.llm.provider;

      await window.electronAPI.settings.setProvider(activeProvider);
      await window.electronAPI.settings.updateLLM('openai', values.llm.openai || {});
      await window.electronAPI.settings.updateLLM('deepseek', values.llm.deepseek || {});
      await window.electronAPI.settings.updateLLM('custom', values.llm.custom || {});

      message.success('Settings saved successfully');
      onClose();
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const LLMConfigForm = ({ provider }: { provider: 'openai' | 'deepseek' | 'custom' }) => {
    const activeProvider = Form.useWatch(['llm', 'provider'], form);

    return (
      <Form.Item label={`${provider.charAt(0).toUpperCase() + provider.slice(1)} Configuration`} style={{ marginBottom: 0 }}>
        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <Form.Item
            name={['llm', provider, 'apiKey']}
            label="API Key"
            style={{ marginBottom: 12 }}
            rules={activeProvider === provider ? [{ required: true, message: `API Key is required for ${provider}` }] : []}
          >
            <Input.Password placeholder={provider === 'openai' ? 'sk-...' : 'Enter API key'} />
          </Form.Item>
          <Form.Item
            name={['llm', provider, 'model']}
            label="Model"
            style={{ marginBottom: 12 }}
            rules={activeProvider === provider ? [{ required: true, message: `Model is required for ${provider}` }] : []}
          >
            <Input
              placeholder={
                provider === 'openai' ? 'gpt-4o-mini'
                : provider === 'deepseek' ? 'deepseek-chat'
                : 'llama3'
              }
            />
          </Form.Item>
          {provider === 'custom' && (
            <Form.Item
              name={['llm', provider, 'baseURL']}
              label="Base URL"
              style={{ marginBottom: 12 }}
              rules={activeProvider === 'custom' ? [{ required: true, message: 'Base URL is required for custom provider' }] : []}
            >
              <Input placeholder="http://localhost:11434/v1" />
            </Form.Item>
          )}
          <Form.Item
            name={['llm', provider, 'temperature']}
            label="Temperature"
            style={{ marginBottom: 0 }}
            rules={activeProvider === provider ? [{ required: true, message: 'Temperature is required' }] : []}
          >
            <InputNumber step={0.1} min={0} max={2} placeholder="0.7" style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </Form.Item>
    );
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          <SettingOutlined style={{ marginRight: '8px' }} />
          Settings
        </span>
      }
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          llm: {
            provider: 'openai',
            openai: { temperature: 0.7 },
            deepseek: { temperature: 0.7 },
            custom: { temperature: 0.7 },
          },
        }}
      >
        <Form.Item
          name={['llm', 'provider']}
          label="Active LLM Provider"
          rules={[{ required: true, message: 'Please select a provider' }]}
        >
          <Select options={LLM_PROVIDER_OPTIONS} />
        </Form.Item>

        <LLMConfigForm provider="openai" />
        <LLMConfigForm provider="deepseek" />
        <LLMConfigForm provider="custom" />
      </Form>
    </Modal>
  );
};
