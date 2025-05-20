import { BrowserActionType } from '@temporal-rpa-engine/shared';
import { chromium, Browser, Page, BrowserContext } from 'playwright';

// 存储浏览器实例
let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

// 浏览器状态标志
let browserInitialized = false;
let browserClosed = false;

/**
 * 初始化浏览器
 */
export async function initBrowser() {
  try {
    // 如果浏览器已关闭或未初始化，则创建新实例
    if (browserClosed || !browser || !page || !context) {
      // 安全起见，先尝试关闭现有实例
      await safeCloseBrowser();
      
      console.log('正在初始化新的浏览器实例...');
      
      const browserType = chromium;
      const browserArgs = [
        '--start-maximized',
      ];
      
      // 启动新的浏览器实例
      browser = await browserType.launch({
        headless: false,
        devtools: true,
        args: browserArgs,
      });
      
      // 创建新的浏览器上下文和页面
      context = await browser.newContext();
      page = await context.newPage();
      
      // 设置事件监听，处理意外关闭情况
      browser.on('disconnected', () => {
        console.log('浏览器已断开连接');
        browserClosed = true;
        browser = null;
        context = null;
        page = null;
      });
      
      browserInitialized = true;
      browserClosed = false;
    }
    
    return { browser, context, page };
  } catch (error) {
    console.error('初始化浏览器失败:', error);
    // 确保重置状态
    browserClosed = true;
    browser = null;
    context = null;
    page = null;
    throw error;
  }
}

/**
 * 安全关闭浏览器
 * 无论当前状态如何，尝试彻底清理浏览器实例
 */
async function safeCloseBrowser() {
  try {
    if (page) {
      await page.close().catch(e => console.log('关闭页面出错:', e));
    }
    if (context) {
      await context.close().catch(e => console.log('关闭上下文出错:', e));
    }
    if (browser) {
      await browser.close().catch(e => console.log('关闭浏览器出错:', e));
    }
  } catch (error) {
    console.error('关闭浏览器时发生错误:', error);
  } finally {
    // 无论如何都重置状态
    browser = null;
    context = null;
    page = null;
    browserClosed = true;
    browserInitialized = false;
  }
}

/**
 * 关闭浏览器
 */
export async function closeBrowser() {
  await safeCloseBrowser();
  console.log('浏览器已成功关闭');
}

/**
 * 执行浏览器动作
 */
export async function executeBrowserAction(params: {
  actionType: string;
  url?: string;
  selector?: string;
  text?: string;
  timeout?: number;
  options?: Record<string, any>;
}): Promise<any> {
  const { actionType, url, selector, text, timeout = 30000, options = {} } = params;
  
  try {
    // 确保浏览器已初始化
    const { page } = await initBrowser();
    
    if (!page) {
      throw new Error('浏览器页面未初始化');
    }
    
    // 检查页面是否已关闭
    if (page.isClosed()) {
      console.log('页面已关闭，重新初始化...');
      browserClosed = true;
      // 重新初始化
      const { page: newPage } = await initBrowser();
      if (!newPage) {
        throw new Error('无法重新初始化浏览器页面');
      }
    }
    
    // 根据动作类型执行相应操作
    switch (actionType) {
      case BrowserActionType.NAVIGATE:
        if (!url) throw new Error('导航操作需要提供URL');
        await page.goto(url, { timeout, waitUntil: 'domcontentloaded', ...options });
        return { success: true, title: await page.title() };
        
      case BrowserActionType.CLICK:
        if (!selector) throw new Error('点击操作需要提供选择器');
        await page.waitForSelector(selector, { timeout });
        await page.click(selector, options);
        return { success: true };
        
      case BrowserActionType.TYPE:
        if (!selector) throw new Error('输入操作需要提供选择器');
        if (text === undefined) throw new Error('输入操作需要提供文本');
        await page.waitForSelector(selector, { timeout });
        await page.fill(selector, text, options);
        return { success: true };
        
      case BrowserActionType.SELECT:
        if (!selector) throw new Error('选择操作需要提供选择器');
        if (!text) throw new Error('选择操作需要提供选项值');
        await page.waitForSelector(selector, { timeout });
        await page.selectOption(selector, text, options);
        return { success: true };
        
      case BrowserActionType.WAIT_FOR_SELECTOR:
        if (!selector) throw new Error('等待操作需要提供选择器');
        await page.waitForSelector(selector, { timeout, ...options });
        return { success: true };
        
      case BrowserActionType.WAIT_FOR_NAVIGATION:
        await page.waitForNavigation({ timeout, ...options });
        return { success: true, url: page.url() };
        
      case BrowserActionType.SCREENSHOT:
        const screenshotBuffer = await page.screenshot(options);
        return { 
          success: true, 
          screenshot: screenshotBuffer.toString('base64')
        };
        
      case BrowserActionType.EXTRACT_DATA:
        if (!selector) throw new Error('数据提取操作需要提供选择器');
        await page.waitForSelector(selector, { timeout });
        const data = await page.$$eval(selector, (elements, opts) => {
          return elements.map(el => {
            if (opts.textOnly) {
              return el.textContent?.trim();
            }
            // 返回元素的文本内容和其他属性
            const attributes: Record<string, string> = {};
            Array.from(el.attributes).forEach(attr => {
              attributes[attr.name] = attr.value;
            });
            return {
              text: el.textContent?.trim(),
              attributes
            };
          });
        }, { textOnly: options.textOnly });
        return { success: true, data };
        
      default:
        throw new Error(`不支持的浏览器动作类型: ${actionType}`);
    }
  } catch (error: any) {
    console.error(`执行浏览器动作失败: ${error}`);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
