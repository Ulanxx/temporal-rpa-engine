import { RPAActivities } from '@temporal-rpa-engine/shared';
import { executeBrowserAction, closeBrowser } from './browser-activities';
import { 
  executeScript, 
  executeApiCall, 
  delay, 
  logWorkflowStatus 
} from './utility-activities';

// 导出活动
export const activities: RPAActivities = {
  executeBrowserAction,
  executeScript,
  executeApiCall,
  delay,
  logWorkflowStatus
};

// 导出活动清理函数
export const cleanup = async () => {
  await closeBrowser();
};
