import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input, Button, Card, Select, Spin } from 'antd';
import { SendOutlined, SettingOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { IConversationMessage, ILLMResponseParsed } from '../../global';

interface IChatPanelProps {
  projectPath: string;
  onTreeUpdate?: () => void;
}

export const ChatPanel: React.FC<IChatPanelProps> = ({ projectPath, onTreeUpdate }) => {
  const [messages, setMessages] = useState<IConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'deepseek' | 'custom'>('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadHistory();
  }, [projectPath]);

  const loadHistory = useCallback(async () => {
    const result = await window.electronAPI.conversation.getHistory(projectPath);
    if (result.success && result.data) {
      setMessages(result.data);
    }
  }, [projectPath]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: IConversationMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await window.electronAPI.conversation.sendMessage(input, projectPath);

      if (result.success && result.data) {
        const response = result.data;
        const assistantMessage: IConversationMessage = {
          role: 'assistant',
          content: formatResponse(response),
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (response.operations.length > 0) {
          onTreeUpdate?.();
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${result.error}`,
          timestamp: Date.now(),
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, projectPath, onTreeUpdate]);

  const formatResponse = (response: ILLMResponseParsed): string => {
    let text = '';
    if (response.proactiveQuestions.length > 0) {
      text += '\n\n**Questions:**\n';
      response.proactiveQuestions.forEach((q: string, i: number) => {
        text += `${i + 1}. ${q}\n`;
      });
    }
    if (response.operations.length > 0) {
      text += '\n\n*Updated project structure*';
    }
    return text || 'I understand. How else can I help with your proposal?';
  };

  return (
    <div style={{
      height: '-webkit-fill-available',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      background: '#f9f9f9',
      borderRight: '1px solid #e0e0e0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0 }}>Dialogue</h3>
        <Select
          size="small"
          value={provider}
          onChange={(value) => {
            setProvider(value);
            window.electronAPI.settings.setProvider(value);
          }}
          style={{ width: 120 }}
        >
          <Select.Option value="openai">OpenAI</Select.Option>
          <Select.Option value="deepseek">DeepSeek</Select.Option>
          <Select.Option value="custom">Custom</Select.Option>
        </Select>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg) => (
          <Card
            key={msg.timestamp}
            size="small"
            style={{
              backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f5f5f5',
              marginLeft: msg.role === 'user' ? '20%' : '0',
              marginRight: msg.role === 'user' ? '0' : '20%',
            }}
          >
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </Card>
        ))}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Describe your requirements (Shift+Enter for new line)"
          autoSize={{ minRows: 2, maxRows: 4 }}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{ height: 'auto' }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
