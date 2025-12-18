/**
 * AO3 Translation Assistant - Bookmarklet Version
 * 适用于移动端Safari和Chrome的书签脚本版本
 * 
 * 使用方法：
 * 1. 将下面的代码保存为书签
 * 2. 在AO3作品页面点击书签即可使用
 */

(function() {
  'use strict';

  // 检查是否已经加载
  if (window.AO3TranslationAssistantLoaded) {
    console.log('AO3 Translation Assistant: 检测到已加载，重新初始化...');
    // 移除旧的按钮（如果存在）
    const oldButton = document.getElementById('ao3-translation-button');
    if (oldButton) {
      oldButton.remove();
    }
    // 清除旧的标记
    document.querySelectorAll('.ao3-translation-paragraph').forEach(p => {
      p.classList.remove('ao3-translation-paragraph');
      p.removeAttribute('data-ao3-translation-index');
    });
    // 移除旧的译文
    document.querySelectorAll('.ao3-translation-text').forEach(t => t.remove());
    console.log('AO3 Translation Assistant: 已清理旧实例，重新初始化...');
  }
  window.AO3TranslationAssistantLoaded = true;

  // 调试日志系统（页面显示，用于移动端调试）
  const debugLogs = [];
  const DEBUG_MODE = true; // 移动端默认开启调试模式
  
  function addDebugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      time: timestamp,
      message: message,
      type: type // 'info', 'success', 'error', 'warning'
    };
    debugLogs.push(logEntry);
    console.log(`[${timestamp}] ${message}`);
    
    // 更新调试面板
    updateDebugPanel();
    
    // 只保留最近50条日志
    if (debugLogs.length > 50) {
      debugLogs.shift();
    }
  }
  
  function updateDebugPanel() {
    if (!DEBUG_MODE) return;
    
    // 确保body存在
    if (!document.body) {
      setTimeout(updateDebugPanel, 100);
      return;
    }
    
    let panel = document.getElementById('ao3-debug-panel');
    if (!panel) {
      try {
        panel = document.createElement('div');
        panel.id = 'ao3-debug-panel';
        panel.style.cssText = `
          position: fixed;
          bottom: 80px;
          left: 10px;
          right: 10px;
          max-height: 200px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.9);
          color: #fff;
          padding: 10px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          font-size: 11px;
          z-index: 99998;
          display: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          -webkit-overflow-scrolling: touch;
        `;
        document.body.appendChild(panel);
        addDebugLog('调试面板已创建', 'success');
      } catch (error) {
        console.error('创建调试面板失败:', error);
        return;
      }
    }
    
    // 确保切换按钮存在
    let toggleBtn = document.getElementById('ao3-debug-toggle');
    if (!toggleBtn) {
      try {
        toggleBtn = document.createElement('div');
        toggleBtn.id = 'ao3-debug-toggle';
        toggleBtn.textContent = '🐛';
        toggleBtn.style.cssText = `
          position: fixed;
          bottom: 80px;
          left: 10px;
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 99999;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          touch-action: manipulation;
          -webkit-tap-highlight-color: rgba(255,255,255,0.2);
        `;
        
        // 移动端和桌面端都支持的事件
        ['click', 'touchstart'].forEach(eventType => {
          toggleBtn.addEventListener(eventType, (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentDisplay = panel.style.display;
            panel.style.display = currentDisplay === 'none' || currentDisplay === '' ? 'block' : 'none';
            addDebugLog(`调试面板${panel.style.display === 'none' ? '隐藏' : '显示'}`, 'info');
          }, { passive: false });
        });
        
        document.body.appendChild(toggleBtn);
        addDebugLog('调试按钮已创建', 'success');
      } catch (error) {
        console.error('创建调试按钮失败:', error);
      }
    }
    
    // 显示最近20条日志
    const recentLogs = debugLogs.slice(-20);
    panel.innerHTML = recentLogs.map(log => {
      const color = {
        'info': '#4fc3f7',
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800'
      }[log.type] || '#fff';
      
      return `<div style="color: ${color}; margin-bottom: 4px;">
        <span style="opacity: 0.7;">[${log.time}]</span> ${log.message}
      </div>`;
    }).join('');
    
    // 自动滚动到底部
    panel.scrollTop = panel.scrollHeight;
  }

  // 立即显示加载提示（让用户知道代码正在执行）
  try {
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'ao3-translation-loading-msg';
    loadingMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:15px 20px;border-radius:8px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.2);max-width:300px;';
    loadingMsg.innerHTML = '🌐 <strong>AO3翻译助手</strong><br>正在加载...';
    if (document.body) {
      document.body.appendChild(loadingMsg);
      addDebugLog('加载提示已显示', 'info');
    } else {
      // 如果body不存在，等待一下
      setTimeout(() => {
        if (document.body) {
          document.body.appendChild(loadingMsg);
          addDebugLog('加载提示已显示（延迟）', 'info');
        }
      }, 100);
    }
  } catch (e) {
    console.warn('无法显示加载提示', e);
    addDebugLog('无法显示加载提示: ' + e.message, 'error');
  }

  // 阅读模式枚举
  const ReadingMode = {
    ORIGINAL: 'original',
    TRANSLATED: 'translated',
    BILINGUAL: 'bilingual'
  };

  // 当前阅读模式
  let currentMode = ReadingMode.ORIGINAL;

  // 存储段落翻译结果
  const translationCache = new Map();

  // 翻译服务配置（可以在书签中修改）
  const TRANSLATION_CONFIG = {
    provider: 'google-free', // 'google-free' | 'libretranslate'
    apiKey: null, // LibreTranslate API密钥（可选）
    endpoint: null // 自定义端点（可选）
  };

  // 检查是否为AO3作品页面
  function isAO3WorkPage() {
    const url = window.location.href;
    return url.match(/^https:\/\/archiveofourown\.org\/works\/\d+/);
  }

  // 初始化
  function init() {
    console.log('AO3 Translation Assistant: 开始初始化...');
    console.log('AO3 Translation Assistant: 当前URL:', window.location.href);
    
    if (!isAO3WorkPage()) {
      const currentUrl = window.location.href;
      const message = `请在AO3作品页面使用此功能！\n\n当前URL: ${currentUrl}\n\n正确格式应为：\nhttps://archiveofourown.org/works/12345`;
      alert(message);
      addDebugLog('不是AO3作品页面', 'error');
      console.warn('AO3 Translation Assistant: 不是AO3作品页面');
      return;
    }

    addDebugLog('页面验证通过', 'success');
    console.log('AO3 Translation Assistant: 页面验证通过');

    // 注入CSS样式
    try {
      injectStyles();
      addDebugLog('CSS样式已注入', 'success');
      console.log('AO3 Translation Assistant: CSS样式已注入');
    } catch (error) {
      addDebugLog('CSS注入失败: ' + error.message, 'error');
      console.error('AO3 Translation Assistant: CSS注入失败', error);
    }

    // 设置插件
    try {
      setup();
      addDebugLog('插件设置完成', 'success');
      console.log('AO3 Translation Assistant: 插件设置完成');
    } catch (error) {
      addDebugLog('插件设置失败: ' + error.message, 'error');
      console.error('AO3 Translation Assistant: 插件设置失败', error);
      alert('插件设置失败：' + error.message + '\n\n请点击左下角🐛按钮查看调试信息');
    }
  }

  // 注入CSS样式
  function injectStyles() {
    if (document.getElementById('ao3-translation-styles')) {
      return; // 样式已存在
    }

    const style = document.createElement('style');
    style.id = 'ao3-translation-styles';
    style.textContent = `
      /* 悬浮按钮 */
      .ao3-translation-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      .ao3-translation-button-icon {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .ao3-translation-button-icon:active {
        transform: scale(0.95);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      /* 菜单 */
      .ao3-translation-button-menu {
        position: absolute;
        bottom: 70px;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        min-width: 140px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
        overflow: hidden;
      }

      .ao3-translation-button-menu.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .ao3-translation-menu-item {
        display: flex;
        align-items: center;
        padding: 14px 18px;
        cursor: pointer;
        transition: background-color 0.15s ease;
        border-bottom: 1px solid #f0f0f0;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      }

      .ao3-translation-menu-item:last-child {
        border-bottom: none;
      }

      .ao3-translation-menu-item:hover,
      .ao3-translation-menu-item:active {
        background-color: #f8f8f8;
      }

      .ao3-translation-menu-item.active {
        background-color: #f0f4ff;
        color: #667eea;
        font-weight: 500;
      }

      .ao3-translation-menu-item .menu-icon {
        font-size: 20px;
        margin-right: 12px;
        width: 24px;
        text-align: center;
      }

      .ao3-translation-menu-item .menu-text {
        font-size: 15px;
        flex: 1;
      }

      /* 译文样式 */
      .ao3-translation-text {
        color: #666;
        font-style: italic;
        margin-top: 8px;
        padding-left: 12px;
        border-left: 3px solid #667eea;
        line-height: 1.6;
      }

      .ao3-translation-paragraph + .ao3-translation-text {
        margin-top: 12px;
        margin-bottom: 16px;
      }

      .ao3-translation-hidden {
        display: none !important;
      }

      /* 移动端适配 */
      @media (max-width: 768px) {
        .ao3-translation-button {
          bottom: 16px;
          right: 16px;
        }

        .ao3-translation-button-icon {
          width: 52px;
          height: 52px;
          font-size: 26px;
          /* 移动端触摸优化 */
          -webkit-tap-highlight-color: rgba(102, 126, 234, 0.3);
          touch-action: manipulation;
        }

        .ao3-translation-button-menu {
          bottom: 64px;
          min-width: 130px;
          /* 移动端菜单优化 */
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .ao3-translation-menu-item {
          padding: 12px 16px;
          /* 移动端触摸优化 */
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          touch-action: manipulation;
          min-height: 44px; /* iOS推荐的最小触摸目标 */
        }

        .ao3-translation-menu-item .menu-text {
          font-size: 14px;
        }
      }

      /* 移动设备检测 */
      @media (hover: none) and (pointer: coarse) {
        .ao3-translation-button-icon {
          /* 移动设备特定样式 */
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .ao3-translation-menu-item:active {
          background-color: #e8ecff;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 设置插件
  function setup() {
    // 先创建悬浮按钮
    createFloatingButton();

    // 提取正文段落
    const paragraphs = extractParagraphs();
    if (paragraphs.length === 0) {
      console.warn('AO3 Translation Assistant: 未找到正文段落');
      setTimeout(() => {
        const retryParagraphs = extractParagraphs();
        if (retryParagraphs.length > 0) {
          console.log(`AO3 Translation Assistant: 延迟重试成功，找到 ${retryParagraphs.length} 个段落`);
          markParagraphs(retryParagraphs);
        }
      }, 2000);
      return;
    }

    // 标记段落
    markParagraphs(paragraphs);
    console.log(`AO3 Translation Assistant: 已识别 ${paragraphs.length} 个段落`);
  }

  // 提取正文段落（简化版，使用与content.js相同的逻辑）
  function extractParagraphs() {
    console.log('AO3 Translation Assistant: 开始提取段落...');
    
    const selectors = [
      '#chapters .userstuff',
      '#chapters',
      '.userstuff',
      '.chapter .userstuff',
      '.chapter',
      '[role="article"] .userstuff',
      '[role="article"]',
    ];

    let workContent = null;
    let usedSelector = null;

    for (const selector of selectors) {
      workContent = document.querySelector(selector);
      if (workContent) {
        usedSelector = selector;
        console.log(`AO3 Translation Assistant: 使用选择器 "${selector}" 找到内容容器`);
        
        // 检查是否在summary中
        if (selector === '.userstuff' || selector.includes('.userstuff')) {
          const isInSummary = workContent.closest('.summary, .notes, .preface');
          if (isInSummary) {
            console.log('AO3 Translation Assistant: 找到的.userstuff在summary/notes中，继续查找...');
            workContent = null;
            continue;
          }
        }
        
        if (workContent) {
          break;
        }
      }
    }

    if (!workContent) {
      console.warn('AO3 Translation Assistant: 无法找到内容容器');
      return [];
    }

    // 获取所有段落
    let allParagraphs = workContent.querySelectorAll('p');
    
    // 特殊处理#chapters
    if (usedSelector === '#chapters' && allParagraphs.length === 0) {
      const chaptersUserstuff = workContent.querySelector('.userstuff:not(.summary .userstuff):not(.notes .userstuff)');
      if (chaptersUserstuff && !chaptersUserstuff.closest('.summary, .notes, .preface, .afterword')) {
        allParagraphs = chaptersUserstuff.querySelectorAll('p');
      }
    }

    // 过滤段落
    const paragraphs = Array.from(allParagraphs).filter((p) => {
      if (p.classList.contains('ao3-translation-text')) {
        return false;
      }
      
      const text = p.textContent.trim();
      if (text.length < 3) {
        return false;
      }
      
      // 排除summary、notes等区域
      if (p.closest('.summary, .notes, .preface, .afterword')) {
        return false;
      }
      
      return true;
    });

    console.log(`AO3 Translation Assistant: 过滤后剩余 ${paragraphs.length} 个有效段落`);
    return paragraphs;
  }

  // 标记段落
  function markParagraphs(paragraphs) {
    paragraphs.forEach((p, index) => {
      p.setAttribute('data-ao3-translation-index', index);
      p.classList.add('ao3-translation-paragraph');
    });
  }

  // 创建悬浮按钮
  function createFloatingButton() {
    if (document.getElementById('ao3-translation-button')) {
      return;
    }

    if (!document.body) {
      setTimeout(createFloatingButton, 100);
      return;
    }

    const button = document.createElement('div');
    button.id = 'ao3-translation-button';
    button.className = 'ao3-translation-button';
    button.innerHTML = `
      <div class="ao3-translation-button-icon" title="AO3翻译助手">🌐</div>
      <div class="ao3-translation-button-menu" id="ao3-translation-menu">
        <div class="ao3-translation-menu-item active" data-mode="original">
          <span class="menu-icon">📄</span>
          <span class="menu-text">原文</span>
        </div>
        <div class="ao3-translation-menu-item" data-mode="translated">
          <span class="menu-icon">🔤</span>
          <span class="menu-text">译文</span>
        </div>
        <div class="ao3-translation-menu-item" data-mode="bilingual">
          <span class="menu-icon">📖</span>
          <span class="menu-text">双语</span>
        </div>
      </div>
    `;

    document.body.appendChild(button);

    // 绑定事件 - 移动端兼容
    const icon = button.querySelector('.ao3-translation-button-icon');
    
    // 同时支持click和touchstart（移动端）
    ['click', 'touchstart'].forEach(eventType => {
      icon.addEventListener(eventType, (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      }, { passive: false });
    });
    
    const menuItems = button.querySelectorAll('.ao3-translation-menu-item');
    menuItems.forEach(item => {
      // 移动端使用touchstart，桌面端使用click
      ['click', 'touchstart'].forEach(eventType => {
        item.addEventListener(eventType, (e) => {
          e.preventDefault();
          e.stopPropagation();
          const mode = item.getAttribute('data-mode');
          switchMode(mode);
          closeMenu();
        }, { passive: false });
      });
    });

    // 点击外部关闭菜单 - 移动端兼容
    ['click', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        if (!button.contains(e.target)) {
          closeMenu();
        }
      }, true);
    });

    console.log('AO3 Translation Assistant: 悬浮按钮已创建');
  }

  // 切换菜单
  function toggleMenu() {
    const menu = document.getElementById('ao3-translation-menu');
    menu.classList.toggle('active');
  }

  // 关闭菜单
  function closeMenu() {
    const menu = document.getElementById('ao3-translation-menu');
    menu.classList.remove('active');
  }

  // 切换阅读模式
  async function switchMode(mode) {
    if (currentMode === mode) {
      addDebugLog('模式未改变，跳过', 'info');
      return;
    }

    addDebugLog(`切换到${mode}模式`, 'info');
    currentMode = mode;
    updateButtonState(mode);

    const paragraphs = document.querySelectorAll('.ao3-translation-paragraph');
    addDebugLog(`找到 ${paragraphs.length} 个段落`, 'info');
    
    if (paragraphs.length === 0) {
      addDebugLog('警告：未找到段落', 'warning');
      alert('未找到可翻译的段落。请确保在AO3作品阅读页面。');
      return;
    }
    
    try {
      switch (mode) {
        case ReadingMode.ORIGINAL:
          showOriginalMode(paragraphs);
          addDebugLog('原文模式切换完成', 'success');
          break;
        case ReadingMode.TRANSLATED:
          addDebugLog('开始翻译模式...', 'info');
          await showTranslatedMode(paragraphs);
          addDebugLog('翻译模式切换完成', 'success');
          break;
        case ReadingMode.BILINGUAL:
          addDebugLog('开始双语模式...', 'info');
          await showBilingualMode(paragraphs);
          addDebugLog('双语模式切换完成', 'success');
          break;
      }
    } catch (error) {
      addDebugLog('模式切换失败: ' + error.message, 'error');
      console.error('模式切换失败:', error);
      alert('切换模式失败：' + error.message + '\n\n请点击左下角🐛按钮查看调试信息');
    }
  }

  // 更新按钮状态
  function updateButtonState(mode) {
    const menuItems = document.querySelectorAll('.ao3-translation-menu-item');
    menuItems.forEach(item => {
      if (item.getAttribute('data-mode') === mode) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // 原文模式
  function showOriginalMode(paragraphs) {
    paragraphs.forEach(p => {
      const translation = p.nextElementSibling;
      if (translation && translation.classList.contains('ao3-translation-text')) {
        translation.remove();
      }
      p.style.display = '';
      p.classList.remove('ao3-translation-hidden');
    });
  }

  // 仅译文模式
  async function showTranslatedMode(paragraphs) {
    console.log(`AO3 Translation Assistant: 切换到译文模式，段落数: ${paragraphs.length}`);
    
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      
      // 确保段落还在DOM中
      if (!p.parentNode) {
        console.warn(`AO3 Translation Assistant: 段落 ${i} 已不在DOM中，跳过`);
        continue;
      }
      
      try {
        const translation = await getOrCreateTranslation(p);
        
        // 隐藏原文
        p.style.display = 'none';
        p.classList.add('ao3-translation-hidden');
        
        // 显示译文
        if (translation) {
          // 验证译文有内容
          const translationText = translation.textContent.trim();
          if (translationText.length > 0) {
            translation.style.display = '';
            translation.classList.remove('ao3-translation-hidden');
            console.log(`AO3 Translation Assistant: 段落 ${i} 译文显示成功`);
          } else {
            console.warn(`AO3 Translation Assistant: 段落 ${i} 译文为空，保持隐藏`);
            translation.style.display = 'none';
            translation.classList.add('ao3-translation-hidden');
          }
        } else {
          console.warn(`AO3 Translation Assistant: 段落 ${i} 翻译失败，显示原文`);
          // 如果翻译失败，显示原文
          p.style.display = '';
          p.classList.remove('ao3-translation-hidden');
        }
        
        // 移动端：添加小延迟，避免阻塞UI
        if (i % 5 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
      } catch (error) {
        console.error(`AO3 Translation Assistant: 处理段落 ${i} 时出错:`, error);
        // 出错时显示原文
        p.style.display = '';
        p.classList.remove('ao3-translation-hidden');
      }
    }
    
    console.log('AO3 Translation Assistant: 译文模式切换完成');
  }

  // 双语对照模式
  async function showBilingualMode(paragraphs) {
    console.log(`AO3 Translation Assistant: 切换到双语模式，段落数: ${paragraphs.length}`);
    
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      
      // 确保段落还在DOM中
      if (!p.parentNode) {
        console.warn(`AO3 Translation Assistant: 段落 ${i} 已不在DOM中，跳过`);
        continue;
      }
      
      try {
        // 显示原文
        p.style.display = '';
        p.classList.remove('ao3-translation-hidden');
        
        // 获取或创建译文
        const translation = await getOrCreateTranslation(p);
        
        // 显示译文
        if (translation) {
          // 验证译文有内容
          const translationText = translation.textContent.trim();
          if (translationText.length > 0) {
            translation.style.display = '';
            translation.classList.remove('ao3-translation-hidden');
            console.log(`AO3 Translation Assistant: 段落 ${i} 双语显示成功`);
          } else {
            console.warn(`AO3 Translation Assistant: 段落 ${i} 译文为空，隐藏`);
            translation.style.display = 'none';
            translation.classList.add('ao3-translation-hidden');
          }
        } else {
          console.warn(`AO3 Translation Assistant: 段落 ${i} 翻译失败，仅显示原文`);
        }
        
        // 移动端：添加小延迟，避免阻塞UI
        if (i % 5 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
      } catch (error) {
        console.error(`AO3 Translation Assistant: 处理段落 ${i} 时出错:`, error);
        // 出错时至少显示原文
        p.style.display = '';
        p.classList.remove('ao3-translation-hidden');
      }
    }
    
    console.log('AO3 Translation Assistant: 双语模式切换完成');
  }

  // 获取或创建译文
  async function getOrCreateTranslation(paragraph) {
    const index = paragraph.getAttribute('data-ao3-translation-index');
    
    // 检查是否已存在译文元素
    let translationElement = paragraph.nextElementSibling;
    if (translationElement && translationElement.classList.contains('ao3-translation-text')) {
      // 验证现有译文是否有内容
      const existingText = translationElement.textContent.trim();
      if (existingText && existingText.length > 0) {
        return translationElement;
      } else {
        // 如果现有译文为空，移除它并重新创建
        console.warn(`AO3 Translation Assistant: 发现空白译文，索引 ${index}，将重新翻译`);
        translationElement.remove();
      }
    }

    const originalText = paragraph.textContent.trim();
    if (!originalText || originalText.length < 3) {
      console.warn(`AO3 Translation Assistant: 原文为空或太短，索引 ${index}`);
      return null;
    }

    // 检查缓存
    let translatedText = translationCache.get(index);
    
    // 如果缓存存在但为空，清除缓存
    if (translatedText === '' || translatedText === null || translatedText === undefined) {
      console.warn(`AO3 Translation Assistant: 缓存中的译文为空，索引 ${index}，清除缓存`);
      translationCache.delete(index);
      translatedText = null;
    }
    
    if (!translatedText) {
      try {
        addDebugLog(`开始翻译段落 ${index} (长度: ${originalText.length})`, 'info');
        console.log(`AO3 Translation Assistant: 开始翻译段落 ${index}，原文长度: ${originalText.length}`);
        
        // 显示翻译进度
        showTranslationProgress(paragraph, '翻译中...');
        
        translatedText = await requestTranslation(originalText);
        
        // 验证翻译结果
        if (!translatedText || typeof translatedText !== 'string') {
          throw new Error('翻译结果无效：返回值为空或非字符串');
        }
        
        translatedText = translatedText.trim();
        
        if (translatedText.length === 0) {
          throw new Error('翻译结果为空字符串');
        }
        
        if (translatedText.length < originalText.length * 0.1) {
          addDebugLog(`警告：翻译结果异常短 (原文: ${originalText.length}, 译文: ${translatedText.length})`, 'warning');
          console.warn(`AO3 Translation Assistant: 翻译结果异常短，可能有问题。原文: ${originalText.length}，译文: ${translatedText.length}`);
        }
        
        // 只有验证通过才缓存
        translationCache.set(index, translatedText);
        addDebugLog(`翻译成功 段落${index} (${translatedText.length}字)`, 'success');
        console.log(`AO3 Translation Assistant: 翻译成功，索引 ${index}，译文长度: ${translatedText.length}`);
        
        // 移除进度提示
        hideTranslationProgress(paragraph);
        
      } catch (error) {
        addDebugLog(`翻译失败 段落${index}: ${error.message}`, 'error');
        console.error(`AO3 Translation Assistant: 翻译失败，索引 ${index}:`, error);
        console.error('AO3 Translation Assistant: 错误详情:', {
          message: error.message,
          stack: error.stack,
          originalTextLength: originalText.length,
          originalTextPreview: originalText.substring(0, 50)
        });
        
        // 移除进度提示
        hideTranslationProgress(paragraph);
        
        // 显示错误提示（移动端友好）
        showTranslationError(paragraph, error.message);
        return null;
      }
    } else {
      addDebugLog(`使用缓存 段落${index}`, 'info');
      console.log(`AO3 Translation Assistant: 使用缓存翻译，索引 ${index}`);
    }

    // 确保翻译文本有效
    if (!translatedText || translatedText.trim().length === 0) {
      console.error(`AO3 Translation Assistant: 翻译文本无效，索引 ${index}`);
      return null;
    }

    // 创建译文元素 - 使用更安全的方式
    try {
      // 确保paragraph还在DOM中
      if (!paragraph.parentNode) {
        console.error(`AO3 Translation Assistant: 段落已不在DOM中，索引 ${index}`);
        return null;
      }

      translationElement = document.createElement('p');
      translationElement.className = 'ao3-translation-text';
      translationElement.setAttribute('data-ao3-translation-index', index);
      
      // 使用textContent而不是innerHTML，避免XSS和特殊字符问题
      translationElement.textContent = translatedText;
      
      // 插入到段落后面
      const nextSibling = paragraph.nextSibling;
      if (nextSibling) {
        paragraph.parentNode.insertBefore(translationElement, nextSibling);
      } else {
        paragraph.parentNode.appendChild(translationElement);
      }
      
      // 验证插入是否成功
      if (!translationElement.parentNode) {
        throw new Error('译文元素插入失败');
      }
      
      const insertedText = translationElement.textContent.trim();
      if (insertedText.length === 0) {
        throw new Error('插入的译文为空');
      }
      
      console.log(`AO3 Translation Assistant: 译文元素创建成功，索引 ${index}`);
      return translationElement;
      
    } catch (error) {
      console.error(`AO3 Translation Assistant: 创建译文元素失败，索引 ${index}:`, error);
      // 如果元素已创建但插入失败，移除它
      if (translationElement && translationElement.parentNode) {
        translationElement.remove();
      }
      return null;
    }
  }

  // 显示翻译进度
  function showTranslationProgress(paragraph, message) {
    try {
      const index = paragraph.getAttribute('data-ao3-translation-index');
      const existingProgress = paragraph.parentNode.querySelector(`.ao3-translation-progress[data-index="${index}"]`);
      if (existingProgress) {
        existingProgress.textContent = message;
        return;
      }

      const progressElement = document.createElement('p');
      progressElement.className = 'ao3-translation-progress';
      progressElement.setAttribute('data-index', index);
      progressElement.style.cssText = `
        color: #667eea;
        font-size: 12px;
        font-style: italic;
        margin-top: 4px;
        padding: 8px;
        background: #f0f4ff;
        border-left: 3px solid #667eea;
        border-radius: 4px;
        animation: pulse 1.5s ease-in-out infinite;
      `;
      progressElement.textContent = message;
      
      // 添加动画
      if (!document.getElementById('ao3-progress-animation')) {
        const style = document.createElement('style');
        style.id = 'ao3-progress-animation';
        style.textContent = `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `;
        document.head.appendChild(style);
      }
      
      const nextSibling = paragraph.nextSibling;
      if (nextSibling) {
        paragraph.parentNode.insertBefore(progressElement, nextSibling);
      } else {
        paragraph.parentNode.appendChild(progressElement);
      }
    } catch (error) {
      console.error('显示翻译进度失败:', error);
    }
  }

  // 隐藏翻译进度
  function hideTranslationProgress(paragraph) {
    try {
      const index = paragraph.getAttribute('data-ao3-translation-index');
      const progressElement = paragraph.parentNode.querySelector(`.ao3-translation-progress[data-index="${index}"]`);
      if (progressElement) {
        progressElement.remove();
      }
    } catch (error) {
      console.error('隐藏翻译进度失败:', error);
    }
  }

  // 显示翻译错误提示
  function showTranslationError(paragraph, errorMessage) {
    try {
      // 检查是否已存在错误提示
      const existingError = paragraph.parentNode.querySelector(`.ao3-translation-error[data-index="${paragraph.getAttribute('data-ao3-translation-index')}"]`);
      if (existingError) {
        return;
      }

      const errorElement = document.createElement('p');
      errorElement.className = 'ao3-translation-error';
      errorElement.setAttribute('data-index', paragraph.getAttribute('data-ao3-translation-index'));
      errorElement.style.cssText = `
        color: #d32f2f;
        font-size: 12px;
        font-style: italic;
        margin-top: 4px;
        padding: 8px;
        background: #ffebee;
        border-left: 3px solid #d32f2f;
        border-radius: 4px;
      `;
      errorElement.textContent = `翻译失败: ${errorMessage}`;
      
      // 插入到段落后面
      const nextSibling = paragraph.nextSibling;
      if (nextSibling) {
        paragraph.parentNode.insertBefore(errorElement, nextSibling);
      } else {
        paragraph.parentNode.appendChild(errorElement);
      }
      
      // 5秒后自动移除错误提示
      setTimeout(() => {
        if (errorElement.parentNode) {
          errorElement.remove();
        }
      }, 5000);
    } catch (error) {
      console.error('AO3 Translation Assistant: 显示错误提示失败:', error);
    }
  }

  // 请求翻译
  async function requestTranslation(text) {
    const { provider, apiKey, endpoint } = TRANSLATION_CONFIG;

    switch (provider) {
      case 'google-free':
        return await translateWithGoogleFree(text);
      case 'libretranslate':
        return await translateWithLibreTranslate(text, apiKey, endpoint);
      default:
        throw new Error(`不支持的翻译服务: ${provider}`);
    }
  }

  // Google Translate 免费接口
  async function translateWithGoogleFree(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('翻译文本为空');
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&q=${encodedText}`;
    
    addDebugLog(`请求Google Translate (${text.length}字)`, 'info');
    console.log(`AO3 Translation Assistant: 请求Google Translate，文本长度: ${text.length}`);
    
    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        // 移动端网络可能较慢，增加超时处理
        signal: AbortSignal.timeout(30000) // 30秒超时
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('翻译请求超时（30秒）');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('网络错误：无法连接到翻译服务。请检查网络连接或CORS设置。');
      } else {
        throw new Error(`网络请求失败: ${error.message}`);
      }
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法读取错误信息');
      throw new Error(`Google Translate API错误: ${response.status} ${response.statusText}。响应: ${errorText.substring(0, 100)}`);
    }

    let data;
    try {
      const responseText = await response.text();
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('API返回空响应');
      }
      data = JSON.parse(responseText);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`无法解析API响应（JSON格式错误）: ${error.message}`);
      } else {
        throw error;
      }
    }
    
    if (!data) {
      throw new Error('API返回数据为空');
    }
    
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      let translatedText = '';
      for (const item of data[0]) {
        if (item && Array.isArray(item) && item[0] && typeof item[0] === 'string') {
          translatedText += item[0];
        }
      }
      
      const trimmedText = translatedText.trim();
      if (trimmedText.length === 0) {
        throw new Error('翻译结果为空字符串');
      }
      
      addDebugLog(`Google Translate成功 (${text.length}→${trimmedText.length}字)`, 'success');
      console.log(`AO3 Translation Assistant: Google Translate成功，原文长度: ${text.length}，译文长度: ${trimmedText.length}`);
      return trimmedText;
    }
    
    // 如果响应格式不符合预期，记录详细信息
    console.error('AO3 Translation Assistant: Google Translate响应格式异常:', {
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataPreview: JSON.stringify(data).substring(0, 200)
    });
    
    throw new Error('无法解析Google Translate响应：响应格式不符合预期');
  }

  // LibreTranslate API
  async function translateWithLibreTranslate(text, apiKey, endpoint) {
    if (!text || text.trim().length === 0) {
      throw new Error('翻译文本为空');
    }

    const freeEndpoints = [
      'https://translate.argosopentech.com/translate',
      'https://libretranslate.de/translate',
      'https://libretranslate.com/translate'
    ];
    
    const endpointsToTry = endpoint ? [endpoint] : freeEndpoints;
    
    const errors = [];
    
    for (const apiEndpoint of endpointsToTry) {
      try {
        console.log(`AO3 Translation Assistant: 尝试LibreTranslate端点: ${apiEndpoint}`);
        
        const requestBody = {
          q: text,
          source: 'en',
          target: 'zh',
          format: 'text'
        };

        if (apiKey && apiKey.trim()) {
          requestBody.api_key = apiKey.trim();
        }

        let response;
        try {
          response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody),
            // 移动端网络可能较慢，增加超时处理
            signal: AbortSignal.timeout(30000) // 30秒超时
          });
        } catch (error) {
          if (error.name === 'AbortError') {
            errors.push(`${apiEndpoint}: 请求超时`);
            continue;
          } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errors.push(`${apiEndpoint}: 网络错误 - ${error.message}`);
            continue;
          } else {
            errors.push(`${apiEndpoint}: ${error.message}`);
            continue;
          }
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => '无法读取错误信息');
          errors.push(`${apiEndpoint}: HTTP ${response.status} - ${errorText.substring(0, 100)}`);
          continue;
        }

        let data;
        try {
          const responseText = await response.text();
          if (!responseText || responseText.trim().length === 0) {
            errors.push(`${apiEndpoint}: 返回空响应`);
            continue;
          }
          data = JSON.parse(responseText);
        } catch (error) {
          if (error instanceof SyntaxError) {
            errors.push(`${apiEndpoint}: JSON解析失败 - ${error.message}`);
            continue;
          } else {
            throw error;
          }
        }
        
        if (!data) {
          errors.push(`${apiEndpoint}: 返回数据为空`);
          continue;
        }
        
        if (data.error) {
          if (data.error.includes('API 密钥') || data.error.includes('API key')) {
            errors.push(`${apiEndpoint}: 需要API密钥`);
            continue;
          }
          errors.push(`${apiEndpoint}: ${data.error}`);
          continue;
        }

        if (!data.translatedText) {
          errors.push(`${apiEndpoint}: 响应中没有translatedText字段`);
          continue;
        }

        const translatedText = data.translatedText.trim();
        if (translatedText.length === 0) {
          errors.push(`${apiEndpoint}: 翻译结果为空字符串`);
          continue;
        }

        console.log(`AO3 Translation Assistant: LibreTranslate成功 (${apiEndpoint})，原文长度: ${text.length}，译文长度: ${translatedText.length}`);
        return translatedText;
        
      } catch (error) {
        console.error(`AO3 Translation Assistant: LibreTranslate端点 ${apiEndpoint} 失败:`, error);
        errors.push(`${apiEndpoint}: ${error.message}`);
        continue;
      }
    }
    
    // 所有端点都失败，抛出详细错误
    const errorMessage = `所有LibreTranslate端点都失败:\n${errors.join('\n')}`;
    console.error('AO3 Translation Assistant:', errorMessage);
    throw new Error(errorMessage);
  }

  // 启动
  try {
    console.log('AO3 Translation Assistant: Bookmarklet 开始加载...');
    init();
    console.log('AO3 Translation Assistant: 初始化完成');
    
    // 显示用户提示
    showLoadingMessage();
  } catch (error) {
    console.error('AO3 Translation Assistant: 初始化失败', error);
    alert('AO3翻译助手加载失败：' + error.message + '\n\n请查看控制台获取详细信息（按F12打开）');
  }

  // 显示加载提示
  function showLoadingMessage() {
    // 创建临时提示
    const message = document.createElement('div');
    message.id = 'ao3-translation-loading-message';
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    message.innerHTML = '🌐 AO3翻译助手已加载！<br>正在初始化...';
    document.body.appendChild(message);
    
    // 3秒后自动消失
    setTimeout(() => {
      if (message.parentNode) {
        message.style.opacity = '0';
        message.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          message.remove();
        }, 300);
      }
    }, 3000);
  }

})();

