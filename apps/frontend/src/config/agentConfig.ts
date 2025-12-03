/**
 * Agent Configuration
 *
 * 配置不同的 Health Companion Agent (Olivia 和 Oliver)
 */

export type AgentType = 'olivia' | 'oliver';

export interface AgentConfig {
  id: AgentType;
  name: string;
  displayName: string;
  image: string;
  description: string;
  gender: 'female' | 'male';
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  olivia: {
    id: 'olivia',
    name: 'Olivia',
    displayName: 'Olivia',
    image: '/images/olivia-nurse.png',
    description: 'Your caring female health companion',
    gender: 'female'
  },
  oliver: {
    id: 'oliver',
    name: 'Oliver',
    displayName: 'Oliver',
    image: '/images/oliver-nurse.png',
    description: 'Your supportive male health companion',
    gender: 'male'
  }
};

/**
 * 根据 agent type 获取配置
 */
export const getAgentConfig = (agentType?: AgentType | null): AgentConfig => {
  if (!agentType || !AGENT_CONFIGS[agentType]) {
    return AGENT_CONFIGS.olivia; // Default to Olivia
  }
  return AGENT_CONFIGS[agentType];
};

/**
 * 获取所有可用的 agent 选项（用于下拉选择器）
 */
export const getAgentOptions = () => {
  return Object.values(AGENT_CONFIGS);
};
