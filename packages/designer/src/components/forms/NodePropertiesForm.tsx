import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Card, Divider, Tooltip, Switch } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { NodeType, BrowserActionType } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

interface NodePropertiesFormProps {
  node: any;
  onSave: (nodeId: string, data: any) => void;
}

const NodePropertiesForm: React.FC<NodePropertiesFormProps> = ({ node, onSave }) => {
  const [form] = Form.useForm();
  const [nodeType, setNodeType] = useState<NodeType>(node?.data?.type || NodeType.TASK);
  const [browserActionType, setBrowserActionType] = useState<BrowserActionType>(node?.data?.actionType || BrowserActionType.NAVIGATE);
  
  useEffect(() => {
    if (node) {
      form.setFieldsValue({
        label: node.data.label,
        type: node.data.type,
        ...node.data,
      });
      setNodeType(node.data.type);
      if (node.data.actionType) {
        setBrowserActionType(node.data.actionType);
      }
    }
  }, [node, form]);

  const handleFinish = (values: any) => {
    if (node) {
      onSave(node.id, { ...node.data, ...values });
    }
  };

  // 根据节点类型渲染不同的表单字段
  const renderFormFields = () => {
    switch (nodeType) {
      case NodeType.BROWSER_ACTION:
        return renderBrowserActionFields();

      case NodeType.DELAY:
        return (
          <Form.Item name="milliseconds" label="延迟时间 (毫秒)" rules={[{ required: true }]}>
            <InputNumber min={0} step={1000} defaultValue={1000} />
          </Form.Item>
        );

      case NodeType.API_CALL:
        return (
          <>
            <Form.Item name="url" label="API URL" rules={[{ required: true, type: 'url' }]}>
              <Input placeholder="https://api.example.com/resource" />
            </Form.Item>
            <Form.Item name="method" label="HTTP方法" rules={[{ required: true }]}>
              <Select defaultValue="GET">
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="DELETE">DELETE</Option>
                <Option value="PATCH">PATCH</Option>
              </Select>
            </Form.Item>
            <Form.Item name="headers" label="请求头">
              <TextArea placeholder="JSON格式的请求头" rows={4} />
            </Form.Item>
            <Form.Item name="body" label="请求体">
              <TextArea placeholder="JSON格式的请求体" rows={4} />
            </Form.Item>
          </>
        );

      case NodeType.SCRIPT:
        return (
          <Form.Item name="code" label="JavaScript代码" rules={[{ required: true }]}>
            <TextArea placeholder="在此编写JavaScript代码" rows={10} />
          </Form.Item>
        );

      case NodeType.DECISION:
        return (
          <Form.Item name="condition" label="条件表达式" rules={[{ required: true }]}>
            <TextArea
              placeholder="JavaScript条件表达式，例如: result.status === 'success'"
              rows={4}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  if (!node) {
    return <div>请选择一个节点进行编辑</div>;
  }

  // 添加浏览器动作表单的渲染逻辑
  const renderBrowserActionFields = () => {
    return (
      <>
        <Form.Item 
          name="actionType" 
          label={
            <span>
              浏览器动作类型 
              <Tooltip title="选择您想要执行的浏览器操作类型">
                <InfoCircleOutlined style={{ marginLeft: 5 }} />
              </Tooltip>
            </span>
          } 
          rules={[{ required: true, message: '请选择动作类型' }]}
        >
          <Select onChange={(value) => setBrowserActionType(value as BrowserActionType)}>
            <Option value={BrowserActionType.NAVIGATE}>导航（打开网页）</Option>
            <Option value={BrowserActionType.CLICK}>点击元素</Option>
            <Option value={BrowserActionType.TYPE}>输入文本</Option>
            <Option value={BrowserActionType.SELECT}>选择下拉选项</Option>
            <Option value={BrowserActionType.WAIT_FOR_SELECTOR}>等待元素出现</Option>
            <Option value={BrowserActionType.WAIT_FOR_NAVIGATION}>等待页面加载</Option>
            <Option value={BrowserActionType.SCREENSHOT}>截图</Option>
            <Option value={BrowserActionType.EXTRACT_DATA}>提取数据</Option>
          </Select>
        </Form.Item>
        
        <Divider orientation="left">动作配置</Divider>
        
        {/* 根据不同的浏览器动作类型显示不同的表单项 */}
        {browserActionType === BrowserActionType.NAVIGATE && (
          <>
            <Form.Item 
              name="url" 
              label="网址 URL" 
              rules={[{ required: true, type: 'url', message: '请输入有效的URL' }]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>
            <Form.Item name="waitForPageLoad" label="等待页面完全加载" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
          </>
        )}
        
        {(browserActionType === BrowserActionType.CLICK ||
          browserActionType === BrowserActionType.TYPE ||
          browserActionType === BrowserActionType.SELECT ||
          browserActionType === BrowserActionType.WAIT_FOR_SELECTOR ||
          browserActionType === BrowserActionType.EXTRACT_DATA) && (
          <Form.Item 
            name="selector" 
            label={
              <span>
                元素选择器 
                <Tooltip title="CSS选择器，用于定位页面元素，例如：#login-button, .menu-item, input[name='username']">
                  <InfoCircleOutlined style={{ marginLeft: 5 }} />
                </Tooltip>
              </span>
            } 
            rules={[{ required: true, message: '请输入元素选择器' }]}
          >
            <Input placeholder="CSS选择器，例如: #submit-button, .input-field" />
          </Form.Item>
        )}
        
        {browserActionType === BrowserActionType.TYPE && (
          <Form.Item 
            name="text" 
            label="输入文本" 
            rules={[{ required: true, message: '请输入要填写的文本' }]}
          >
            <Input placeholder="要在输入框中填写的文本" />
          </Form.Item>
        )}
        
        {browserActionType === BrowserActionType.SELECT && (
          <Form.Item 
            name="text" 
            label="选项值" 
            rules={[{ required: true, message: '请输入要选择的选项值' }]}
          >
            <Input placeholder="下拉选择框的选项值，可以是文本或值属性" />
          </Form.Item>
        )}
        
        {browserActionType === BrowserActionType.WAIT_FOR_NAVIGATION && (
          <Form.Item 
            name="url" 
            label="等待导航至(可选)" 
            rules={[{ type: 'url', message: '请输入有效的URL' }]}
          >
            <Input placeholder="https://example.com/target-page" />
          </Form.Item>
        )}
        
        {browserActionType === BrowserActionType.SCREENSHOT && (
          <Form.Item 
            name="screenshotPath" 
            label="截图保存路径" 
            rules={[{ required: true, message: '请输入截图保存路径' }]}
          >
            <Input placeholder="/path/to/screenshots/screenshot.png" />
          </Form.Item>
        )}
        
        {browserActionType === BrowserActionType.EXTRACT_DATA && (
          <Form.Item 
            name="dataKey" 
            label="数据存储键名" 
            rules={[{ required: true, message: '请输入数据存储的键名' }]}
          >
            <Input placeholder="提取数据将使用此键名存储，如：productPrice" />
          </Form.Item>
        )}
        
        <Divider orientation="left">高级选项</Divider>
        
        <Form.Item 
          name="timeout" 
          label={
            <span>
              超时时间 (毫秒) 
              <Tooltip title="操作等待超时时间，如果超过此时间未完成则报错">
                <InfoCircleOutlined style={{ marginLeft: 5 }} />
              </Tooltip>
            </span>
          }
        >
          <InputNumber min={0} step={1000} defaultValue={30000} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item 
          name="description" 
          label="操作备注"
        >
          <TextArea 
            placeholder="记录此步骤的目的或预期结果，便于后续理解和维护" 
            rows={2} 
          />
        </Form.Item>
      </>
    );
  };

  return (
    <Card title="节点属性" bordered={false}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="label" label="节点名称" rules={[{ required: true }]}>
          <Input placeholder="为此节点命名，例如：登录页面-输入用户名" />
        </Form.Item>

        {renderFormFields()}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button htmlType="reset">重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NodePropertiesForm;
