import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, Tabs } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ISettings, ILLMConfig } from '../../../shared/types';

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
  const [settings, setSettings] = useState<ISettings | null>(null);

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
        setSettings(settings);
        form.setFieldsValue(settings);
      }
    } catch (error) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: 'openai' | 'deepseek' | 'custom') => {
    const result = window.electronAPI.settings.setProvider(provider);
    result.then(res => {
      if (res.success) {
        message.success(`Provider changed to ${provider}`);
      } else {
        message.error(`Failed to change provider: ${res.error}`);
      }
    });
  };

  const handleLLMConfigChange = (provider: 'openai' | 'deepseek' | 'custom') => {
    const values = form.getFieldsValue();

    const config: Partial<ILLMConfig> = {};
    if (values[provider]?.apiKey) config.apiKey = values[provider].apiKey;
    if (values[provider]?.model) config.model = values[provider].model;
    if (values[provider]?.baseURL) config.baseURL = values[provider].baseURL;
    if (values[provider]?.temperature !== undefined) config.temperature = values[provider].temperature;

    window.electronAPI.settings.updateLLM(provider, config).then(res => {
      if (res.success) {
        message.success(`${provider} configuration updated`);
      } else {
        message.error(`Failed to update ${provider}: ${res.error}`);
      }
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        handleLLMConfigChange('openai'),
        handleLLMConfigChange('deepseek'),
        handleLLMConfigChange('custom'),
      ]);
      message.success('Settings saved successfully');
      onClose();
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const LLMConfigForm = ({ provider }: { provider: 'openai' | 'deepseek' | 'custom' }) => (
    <Form.Item label={`${provider.charAt(0).toUpperCase() + provider.slice(1)} Configuration`} style={{ marginBottom: 0 }}>
      <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
        <Form.Item
          name={['llm', provider, 'apiKey']}
          label="API Key"
          style={{ marginBottom: 12 }}
        >
          <Input.Password placeholder="Enter API key" />
        </Form.Item>
        <Form.Item
          name={['llm', provider, 'model']}
          label="Model"
          style={{ marginBottom: 12 }}
        >
          <Input placeholder="Enter model name" />
        </Form.Item>
        {provider === 'custom' && (
          <Form.Item
            name={['llm', provider, 'baseURL']}
            label="Base URL"
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="https://api.example.com/v1" />
          </Form.Item>
        )}
        <Form.Item
          name={['llm', provider, 'temperature']}
          label="Temperature"
          style={{ marginBottom: 0 }}
        >
          <Input type="number" step={0.1} min={0} max={2} placeholder="0.7" />
        </Form.Item>
      </div>
    </Form.Item>
  );

  return (
    <Modal
      title={
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          <SettingOutlined style={{ marginRight: '8px' }} />
          Settings
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          Save
        </Button>,
      ]}
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
          <Select
            options={LLM_PROVIDER_OPTIONS}
            onChange={handleProviderChange}
          />
        </Form.Item>

        <LLMConfigForm provider="openai" />
        <LLMConfigForm provider="deepseek" />
        <LLMConfigForm provider="custom" />
      </Form>
    </Modal>
  );
};
