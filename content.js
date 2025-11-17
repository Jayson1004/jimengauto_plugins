// 即梦批量上传插件 - 内容脚本
class JimengBatchUploader {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.storyboards = [];
    this.characters = []; // 初始化角色数组
    this.videos = []; // 新增：存储视频提示词
    this.interval = 8000; // 默认8秒间隔
    this.selectedStyle = ''; // 新增：存储选择的风格
    this.activeTab = 'image'; // 'image' or 'video'
    this.floatingWindow = null;
    this.characterToReplace = null; // To store the name of the character being replaced
    this.init();
  }

  init() {
    this.createFloatingWindow();
    this.bindEvents();
    this.makeDraggable();
    this.makeResizable();
    this.renderTabs(); // 初始化时渲染正确的tab
  }

  // 创建悬浮窗
  createFloatingWindow() {
    if (this.floatingWindow) return;

    const floatingDiv = document.createElement('div');
    floatingDiv.id = 'jimeng-batch-uploader';
    floatingDiv.innerHTML = `
      <div class="jbu-floating-ball" style="display: none;">
        <div class="jbu-ball-icon">批</div>
      </div>
      <div class="jbu-header">
        <span class="jbu-title">即梦批量上传</span>
        <button class="jbu-minimize" title="最小化">−</button>
      </div>

      <div class="jbu-tabs">
        <button class="jbu-btn jbu-tab-btn active" data-tab="image">图片生成</button>
        <button class="jbu-btn jbu-tab-btn" data-tab="video">视频生成</button>
      </div>

      <div class="jbu-content">
        
        <!-- 图片生成面板 -->
        <div class="jbu-tab-panel" id="jbu-image-panel">
          <div class="jbu-controls">
            <button class="jbu-btn jbu-add-storyboard">添加分镜</button>
            <button class="jbu-btn jbu-import-prompts">导入提示词</button>
            <button class="jbu-btn jbu-export-prompts">导出CSV提示词</button>
            <input type="file" id="jbu-file-input" multiple accept="image/*" style="display: none;">
            <input type="file" id="jbu-prompt-file-input" accept=".csv" style="display: none;">
          </div>
          
          <div class="jbu-settings">
            <label>提交间隔: 
              <input type="number" class="jbu-interval" value="8" min="4" max="15">秒 
            </label> 
            <label> 图片风格:
              <select class="jbu-style-select">
                <option value="">无</option>
                <option value="电影实拍">电影实拍</option>
                <option value="Roblox像素风格">Roblox像素风格</option>
                <option value="3D卡通">3D卡通</option>
                <option value="Realistic Film">Realistic Film</option>
                <option value="Photograph">Photograph</option>
                <option value="whimsical">奇思妙想的</option>
                <option value="Crayon">蜡笔</option>
                <option value="Toon Shader">卡通着色器</option>
                <option value="Portrait">人像</option>
                <option value="Noir Comic">黑色漫画</option>
                <option value="Ink Watercolor">水彩画</option>
                <option value="Aerial View">空中视角</option>
                <option value="Modern Realism">现代现实主义</option>
                <option value="Futuristic">未来主义</option>
                <option value="Biblical">圣经的</option>
                <option value="Fluffy 3D">毛绒3D</option>
                <option value="Urban Dream">都市梦想</option>
                <option value="Dreamscape">梦幻景观</option>
                <option value="Cute Cartoon">可爱卡通</option>
                <option value="Tiny World">微型世界</option>
                <option value="Claymation">黏土动画</option>
                <option value="90s Pixel">90年代像素风格</option>
                <option value="Low poly">低多边形</option>
                <option value="Cross Stitch">十字绣</option>
                <option value="Epic Fantasy">史诗奇幻</option>
                <option value="Anime">动漫风格</option>
                <option value="Jurassic">侏罗纪</option>
                <option value="Impressionist">印象派</option>
                <option value="US Comic">美国漫画</option>
                <option value="Cyberpunk">赛博朋克</option>
                <option value="Neoclassic">新古典主义</option>
                 <option value="Prehistoric">史前艺术</option>
                <option value="Roman Art">罗马艺术</option>
                <option value="Nature Photo">自然摄影</option>
                <option value="Pop Art">波普艺术</option>
                <option value="B&W Film">黑白胶卷</option>
                 <option value="Gothic">哥特式</option>
                <option value="B&W Graphic">黑白图形</option>
                <option value="Oil painting">油画</option>
                <option value="Fairy Tale">童话故事</option>
                <option value="Retro Anime">复古动漫</option>
                 <option value="Comic">漫画</option>
                <option value="Comic Strip">漫画条</option>
                <option value="Chinese ancient">中国古代</option>
              </select>
            </label>
          </div>

          <div class="jbu-character-section">
            <h3 class="jbu-section-title">角色列表 (自动提取)</h3>
            <div id="jbu-character-list" class="jbu-character-list"></div>
          </div>

          <div class="jbu-storyboard-list" id="jbu-storyboard-list"></div>

          <div class="jbu-progress">
            <div class="jbu-progress-text">准备就绪</div>
            <div class="jbu-progress-bar">
              <div class="jbu-progress-fill"></div>
            </div>
          </div>

          <div class="jbu-actions">
            <button class="jbu-btn jbu-start">开始上传</button>
            <button class="jbu-btn jbu-pause" disabled>暂停</button>
            <button class="jbu-btn jbu-stop" disabled>停止</button>
            <button class="jbu-btn jbu-clear">清空列表</button>
          </div>
        </div>

        <!-- 视频生成面板 -->
        <div class="jbu-tab-panel" id="jbu-video-panel" style="display: none;">
          <div class="jbu-controls">
             <button class="jbu-btn jbu-video-batch-import-images">批量导入参考图</button>
             <input type="file" id="jbu-video-file-input" multiple accept="image/*" style="display: none;">
          </div>
           <div class="jbu-video-list" id="jbu-video-list">
            <!-- 视频列表将在这里渲染 -->
          </div>
           <div class="jbu-progress">
            <div class="jbu-progress-text">准备就绪</div>
            <div class="jbu-progress-bar">
              <div class="jbu-progress-fill"></div>
            </div>
          </div>
           <div class="jbu-actions">
            <button class="jbu-btn jbu-video-start">开始生成视频</button>
            <button class="jbu-btn jbu-video-pause" disabled>暂停</button>
            <button class="jbu-btn jbu-video-stop" disabled>停止</button>
            <button class="jbu-btn jbu-video-clear">清空列表</button>
          </div>
        </div>

        <!-- 角色替换弹窗 -->
        <div id="jbu-character-replace-modal" class="jbu-modal" style="display: none;">
          <div class="jbu-modal-content">
            <div class="jbu-modal-header">
              <h3 class="jbu-modal-title">替换角色</h3>
              <button class="jbu-modal-close">&times;</button>
            </div>
            <div class="jbu-modal-body" id="jbu-replace-char-list">
              <!-- 角色数据库将在这里渲染 -->
            </div>
          </div>
        </div>

        <!-- 角色编辑弹窗 -->
        <div id="jbu-character-edit-modal" class="jbu-modal" style="display: none;">
          <div class="jbu-modal-content">
            <div class="jbu-modal-header">
              <h3 class="jbu-modal-title">编辑角色描述</h3>
              <button class="jbu-modal-close">&times;</button>
            </div>
            <div class="jbu-modal-body">
              <textarea id="jbu-char-edit-textarea" class="jbu-prompt" style="width: 100%; min-height: 100px;"></textarea>
              <button id="jbu-save-char-edit" class="jbu-btn" style="width: 100%; margin-top: 10px;">保存</button>
            </div>
          </div>
        </div>

      </div>
      <div class="jbu-resize-handle jbu-resize-se"></div>
      <div class="jbu-resize-handle jbu-resize-e"></div>
      <div class="jbu-resize-handle jbu-resize-s"></div>
      <div class="jbu-resize-handle jbu-resize-w"></div>
      <div class="jbu-resize-handle jbu-resize-nw"></div>
      <div class="jbu-resize-handle jbu-resize-sw"></div>
    `;

    document.body.appendChild(floatingDiv);
    this.floatingWindow = floatingDiv;

    // 绑定悬浮球点击事件
    const floatingBall = floatingDiv.querySelector('.jbu-floating-ball');
    floatingBall.addEventListener('click', () => {
      this.toggleMinimize();
    });
  }

  renderTabs() {
    const container = this.floatingWindow;
    const imagePanel = container.querySelector('#jbu-image-panel');
    const videoPanel = container.querySelector('#jbu-video-panel');
    const imageTabBtn = container.querySelector('.jbu-tab-btn[data-tab="image"]');
    const videoTabBtn = container.querySelector('.jbu-tab-btn[data-tab="video"]');

    if (this.activeTab === 'image') {
      imagePanel.style.display = 'block';
      videoPanel.style.display = 'none';
      imageTabBtn.classList.add('active');
      videoTabBtn.classList.remove('active');
    } else {
      imagePanel.style.display = 'none';
      videoPanel.style.display = 'block';
      imageTabBtn.classList.remove('active');
      videoTabBtn.classList.add('active');
    }
  }

  // 绑定事件
  bindEvents() {
    const container = this.floatingWindow;

    // Tab切换
    container.querySelectorAll('.jbu-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.target.dataset.tab;
        this.renderTabs();
      });
    });

    // 最小化按钮
    container.querySelector('.jbu-minimize').addEventListener('click', () => {
      this.toggleMinimize();
    });

    // --- 图片生成事件 ---
    container.querySelector('.jbu-add-storyboard').addEventListener('click', () => {
      this.addStoryboard();
    });
    // container.querySelector('.jbu-batch-import').addEventListener('click', () => {
    //   document.getElementById('jbu-file-input').click();
    // });
    container.querySelector('.jbu-import-prompts').addEventListener('click', () => {
      document.getElementById('jbu-prompt-file-input').click();
    });
    container.querySelector('.jbu-export-prompts').addEventListener('click', () => {
      this.handleExportPrompts();
    });
    document.getElementById('jbu-file-input').addEventListener('change', (e) => {
      this.handleBatchImport(e.target.files);
      e.target.value = '';
    });
    document.getElementById('jbu-prompt-file-input').addEventListener('change', (e) => {
      this.handlePromptImport(e.target.files[0]);
      e.target.value = '';
    });
    container.querySelector('.jbu-interval').addEventListener('change', (e) => {
      this.interval = parseInt(e.target.value) * 1000;
    });
    container.querySelector('.jbu-style-select').addEventListener('change', (e) => {
      this.selectedStyle = e.target.value;
    });
    container.querySelector('.jbu-start').addEventListener('click', () => {
      this.startUpload();
    });
    container.querySelector('.jbu-pause').addEventListener('click', () => {
      this.pauseUpload();
    });
    container.querySelector('.jbu-stop').addEventListener('click', () => {
      this.stopUpload();
    });
    container.querySelector('.jbu-clear').addEventListener('click', () => {
      this.clearStoryboards();
    });

    // --- 视频生成事件 ---
    container.querySelector('.jbu-video-batch-import-images').addEventListener('click', () => {
      document.getElementById('jbu-video-file-input').click();
    });
    document.getElementById('jbu-video-file-input').addEventListener('change', (e) => {
      this.handleVideoBatchImport(e.target.files); // 实现
      e.target.value = '';
    });
    container.querySelector('.jbu-video-clear').addEventListener('click', () => {
      this.clearVideos(); // 实现
    });
    container.querySelector('.jbu-video-start').addEventListener('click', () => {
      this.startVideoGeneration();
    });
    container.querySelector('.jbu-video-pause').addEventListener('click', () => {
      this.pauseUpload();
    });
    container.querySelector('.jbu-video-stop').addEventListener('click', () => {
      this.stopUpload();
    });

    // --- Modal Events ---
    const modal = document.getElementById('jbu-character-replace-modal');
    modal.querySelector('.jbu-modal-close').addEventListener('click', () => {
      this.closeCharacterReplaceModal();
    });

    const editModal = document.getElementById('jbu-character-edit-modal');
    editModal.querySelector('.jbu-modal-close').addEventListener('click', () => {
      this.closeCharacterEditModal();
    });
    editModal.querySelector('#jbu-save-char-edit').addEventListener('click', () => {
      this.saveCharacterEdit();
    });
  }

  // ... (existing image generation functions)

  // ---- Video Generation Functions ----

  async startVideoGeneration() {
    const modeElement = document.querySelector('div[class^="dimension-layout-"] div[class^="toolbar-settings-"] .lv-select-view .lv-select-view-value');

    if (!modeElement || !modeElement.textContent.includes('视频生成')) {
      alert('请先在即梦输入框底部工具栏手动选择“视频生成”模式，然后再开始。');
      return;
    }

    if (this.videos.length === 0) {
      alert('请先添加视频任务');
      return;
    }

    console.log('开始批量生成视频，总共', this.videos.length, '个视频');

    this.videos.forEach(video => {
      if (video.status !== 'completed') {
        video.status = 'pending';
      }
    });

    this.isRunning = true;
    this.isPaused = false;
    this.currentIndex = 0;

    // TODO: Update buttons for video tab
    this.updateButtons();
    this.renderVideos();
    await this.processNextVideo();
  }

  async processNextVideo() {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    // 跳过已完成的视频
    while (this.currentIndex < this.videos.length && this.videos[this.currentIndex].status === 'completed') {
      this.currentIndex++;
    }

    if (this.currentIndex >= this.videos.length) {
      this.completeUpload(); // Can reuse completion logic
      return;
    }

    const video = this.videos[this.currentIndex];
    console.log(`开始处理第${this.currentIndex + 1}个视频: ${video.name}`);
    // TODO: Update progress for video tab

    if (this.currentIndex > 0) {
      console.log('清理上一个视频的内容...');
      try {
        await this.clearPreviousContent();
      } catch (error) {
        console.error('清理内容失败:', error);
      }
    }

    try {
      await this.uploadVideo(video);
      video.status = 'completed';
      console.log(`视频 ${video.name} 处理成功`);
    } catch (error) {
      console.error(`视频 ${video.name} 处理失败:`, error);
      video.status = 'failed';
    }

    this.renderVideos();
    this.currentIndex++;

    if (this.isRunning && !this.isPaused) {
      setTimeout(() => {
        if (this.isRunning && !this.isPaused) {
          this.processNextVideo();
        }
      }, this.interval);
    }
  }

  async uploadVideo(video) {
    console.log(`开始上传视频任务: ${video.name}`);
    video.status = 'uploading';
    this.renderVideos();

    try {
      // 1. 上传参考图 (if any)
      console.log('步骤1: 上传参考图...');
      const imagesToUpload = video.image ? [video.image] : [];

      if (imagesToUpload.length > 0) {
        try {
          await this.uploadImages(imagesToUpload);
          console.log('✓ 参考图上传成功');
        } catch (error) {
          console.error('✗ 参考图上传失败:', error.message);
          throw new Error(`参考图上传失败: ${error.message}`);
        }
      } else {
        console.log('无参考图，跳过上传。');
      }

      // 2. 填写提示词
      console.log('步骤2: 填写视频提示词...', video.prompt.substring(0, 50) + '...');
      try {
        await this.fillPrompt(video.prompt);
        console.log('✓ 提示词填写成功');
      } catch (error) {
        console.error('✗ 提示词填写失败:', error.message);
        throw new Error(`提示词填写失败: ${error.message}`);
      }

      // 3. 点击生成按钮
      console.log('步骤3: 点击生成按钮...');
      try {
        await this.clickGenerate();
        console.log('✓ 生成按钮点击成功');
      } catch (error) {
        console.error('✗ 生成按钮点击失败:', error.message);
        throw new Error(`生成按钮点击失败: ${error.message}`);
      }

      console.log(`✓ 视频 ${video.name} 发送完成`);
    } catch (error) {
      console.error(`✗ 视频 ${video.name} 上传失败:`, error.message);
      throw error;
    }
  }

  // ---- END Video Generation Functions ----


  // 添加单个分镜

  addStoryboard(promptText = '') {

    const storyboard = {

      id: Date.now() + this.storyboards.length,

      name: `分镜${this.storyboards.length + 1}`,

      images: [],

      prompt: promptText,

      status: 'pending' // pending, uploading, completed, failed

    };



    this.storyboards.push(storyboard);

    this.renderStoryboards();

    this.updateAndRenderCharacters(); // 更新角色列表

  }


  // 批量导入提示词 (CSV)
  handlePromptImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      const uint8array = new Uint8Array(buffer);
      let content;
      try {
        // 智能解码
        if (uint8array.length >= 3 && uint8array[0] === 0xEF && uint8array[1] === 0xBB && uint8array[2] === 0xBF) {
          content = new TextDecoder('utf-8').decode(uint8array.slice(3));
        } else {
          try {
            content = new TextDecoder('utf-8', { fatal: true }).decode(uint8array);
          } catch (error) {
            content = new TextDecoder('gbk').decode(uint8array);
          }
        }
      } catch (error) {
        alert('文件解码失败，请确保您的CSV文件是 UTF-8 或 GBK 编码。');
        return;
      }

      const data = parseCSV(content);
      if (data.length <= 1) {
        alert('CSV文件为空或格式不正确。');
        
        return;
      }
      const data0_arr = data[0]
      if(data0_arr[0].indexOf('分镜数') < 0) {
        alert('CSV文件第一列应为分镜数。');
        return 
      }
      if(data0_arr[1].indexOf('分镜提示词') < 0) {
        alert('CSV文件第二列应为分镜提示词。');
        return 
      }
      if(data0_arr[2].indexOf('动作提示词') < 0) {
        alert('CSV文件第三列应为动作提示词。');
        return 
      }
      // 清空列表
      this.storyboards = []
      this.videos = []
      // 跳过表头处理数据
      data.slice(1).forEach(row => {
        if (row && row.length > 1) {
          const imagePrompt = row[1] ? row[1].trim() : '';
          const videoPrompt = row[2] ? row[2].trim() : '';
          if (imagePrompt) {
            this.addStoryboard(imagePrompt);
          }
          if (videoPrompt) {
            this.addVideo(videoPrompt);
          }
        }
      });
      this.updateAndRenderCharacters(); // 更新角色列表
      this.renderVideos(); // 渲染视频列表

    };

    reader.readAsArrayBuffer(file);
  }

  handleExportPrompts() {
    const csvContent = exportPromptsToCSV(this.storyboards, this.videos);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'prompts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  // ---- 视频列表功能 ----
  addVideo(promptText = '') {
    const video = {
      id: Date.now() + this.videos.length,
      name: `视频${this.videos.length + 1}`,
      image: null,
      prompt: promptText,
      status: 'pending' // pending, uploading, completed, failed
    };

    this.videos.push(video);
  }

  renderVideos() {
    const listContainer = document.getElementById('jbu-video-list');
    listContainer.innerHTML = '';
    if (this.videos.length === 0) {
      listContainer.innerHTML = '<p class="jbu-no-items">暂无视频任务，请通过"导入提示词"添加。</p>';
      return;
    }

    this.videos.forEach((video, index) => {
      const videoDiv = document.createElement('div');
      videoDiv.className = `jbu-storyboard ${video.status}`; // 使用jbu-storyboard样式
      videoDiv.draggable = true; // 允许拖拽
      videoDiv.dataset.index = index;

      const imagePreview = video.image
        ? `<div class="jbu-image-preview">
                      <img src="${URL.createObjectURL(video.image)}" alt="预览">
                      <button class="jbu-remove-image" data-id="${video.id}">×</button>
                    </div>`
        : `<div class="jbu-image-preview jbu-image-placeholder"></div>`;

      videoDiv.innerHTML = `
                  <div class="jbu-storyboard-header">
                    <span class="jbu-storyboard-name">${video.name}</span>
                    <span class="jbu-storyboard-status">${this.getStatusText(video.status)}</span>
                    <button class="jbu-delete-video" data-id="${video.id}">×</button>
                  </div>
                  <div class="jbu-storyboard-content">
                    <div class="jbu-images">
                      ${imagePreview}
                      ${!video.image ? `<button class="jbu-add-image" data-id="${video.id}">+</button>` : ''}
                    </div>
                    <textarea class="jbu-prompt" placeholder="输入视频提示词..." data-id="${video.id}">${video.prompt}</textarea>
                  </div>
                `;
      listContainer.appendChild(videoDiv);
    });

    this.bindVideoEvents();
    this.setupVideoDragAndDrop(); // 添加视频拖拽
  }

  bindVideoEvents() {
    // 添加图片按钮
    document.querySelectorAll('#jbu-video-list .jbu-add-image').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.addImageToVideo(id);
      });
    });

    // 删除图片按钮
    document.querySelectorAll('#jbu-video-list .jbu-remove-image').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.removeImageFromVideo(id);
      });
    });

    // 更新提示词
    document.querySelectorAll('#jbu-video-list .jbu-prompt').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id);
        const video = this.videos.find(v => v.id === id);
        if (video) {
          video.prompt = e.target.value;
        }
      });
    });

    // 删除视频
    document.querySelectorAll('.jbu-delete-video').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        this.videos = this.videos.filter(v => v.id !== id);
        this.reorderVideos(); // 重新排序视频名称
        this.renderVideos();
      });
    });
  }

  setupVideoDragAndDrop() {
    const listContainer = document.getElementById('jbu-video-list');
    let draggedElement = null;

    listContainer.addEventListener('dragstart', (e) => {
      draggedElement = e.target;
      e.target.style.opacity = '0.5';
    });

    listContainer.addEventListener('dragend', (e) => {
      e.target.style.opacity = '';
      draggedElement = null;
    });

    listContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    listContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedElement && e.target.classList.contains('jbu-storyboard')) {
        const fromIndex = parseInt(draggedElement.dataset.index);
        const toIndex = parseInt(e.target.dataset.index);

        // 重新排序数组
        const item = this.videos.splice(fromIndex, 1)[0];
        this.videos.splice(toIndex, 0, item);

        this.renderVideos();
      }
    });
  }

  reorderVideos() {
    this.videos.forEach((video, index) => {
      video.name = `视频${index + 1}`;
    });
  }

  handleVideoBatchImport(files) {
    Array.from(files).forEach((file, index) => {
      if (index < this.videos.length) {
        this.videos[index].image = file;
      }
    });
    this.renderVideos();
  }

  addImageToVideo(videoId) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const video = this.videos.find(v => v.id === videoId);
      if (video && file) {
        video.image = file;
        this.renderVideos();
      }
      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  }

  removeImageFromVideo(videoId) {
    const video = this.videos.find(v => v.id === videoId);
    if (video) {
      video.image = null;
      this.renderVideos();
    }
  }

  clearVideos() {
    if (confirm('确定要清空所有视频任务吗？')) {
      this.videos = [];
      this.renderVideos();
    }
  }

  // ---- END 视频列表功能 ----



  // 从所有分镜中更新角色列表并渲染
  updateAndRenderCharacters() {
    this.characters = updateCharacters(this.storyboards, this.characters);
    this.renderCharacters();
  }



  // 渲染角色列表UI

  renderCharacters() {

    const listContainer = document.getElementById('jbu-character-list');

    if (!listContainer) return;

    listContainer.innerHTML = '';



    if (this.characters.length === 0) {

      listContainer.innerHTML = '<p class="jbu-no-characters">暂无角色，请在分镜提示词中按 "角色: 名称 (描述)" 格式添加。</p>';

      return;

    }



    this.characters.forEach(char => {

      const charDiv = document.createElement('div');

      charDiv.className = 'jbu-character-item';



      const imagePreview = char.image

        ? `<img src="${URL.createObjectURL(char.image)}" alt="${char.name}预览">`

        : '<div class="jbu-image-placeholder"></div>';



      charDiv.innerHTML = `

          <div class="jbu-character-img-preview">

            ${imagePreview}

            ${char.image ? `<button class="jbu-remove-char-image" data-name="${char.name}">×</button>` : ''}

          </div>

          <div class="jbu-character-info">

            <span class="jbu-character-name">${char.name}</span>

                        <button class="jbu-btn jbu-btn-small jbu-upload-char-image" data-name="${char.name}">上传图片</button>

                        <button class="jbu-btn jbu-btn-small jbu-replace-char" data-name="${char.name}">替换角色</button>

                      </div>

        `;

      listContainer.appendChild(charDiv);

    });



    this._bindCharacterEvents();

  }



  // 绑定角色列表的事件

  _bindCharacterEvents() {

    document.querySelectorAll('.jbu-upload-char-image').forEach(btn => {

      btn.addEventListener('click', (e) => {

        const name = e.target.dataset.name;



        const fileInput = document.createElement('input');

        fileInput.type = 'file';

        fileInput.accept = 'image/*';

        fileInput.style.display = 'none';



        fileInput.addEventListener('change', (event) => {

          this.handleCharacterImageUpload(event, name);

          document.body.removeChild(fileInput);

        });



        document.body.appendChild(fileInput);

        fileInput.click();

      });

    });



        document.querySelectorAll('.jbu-remove-char-image').forEach(btn => {



          btn.addEventListener('click', (e) => {



            const name = e.target.dataset.name;



            this.removeCharacterImage(name);



          });



        });



    



        document.querySelectorAll('.jbu-replace-char').forEach(btn => {



          btn.addEventListener('click', (e) => {



            e.preventDefault();



            const name = e.target.dataset.name;



            this.openCharacterReplaceModal(name);



          });



        });

  }



  // 处理角色图片上传

  handleCharacterImageUpload(e, characterName) {

    const file = e.target.files[0];

    if (!file) return;



    const character = this.characters.find(c => c.name === characterName);

    if (character) {

      character.image = file;

      this.renderCharacters();

    }

  }



  // 删除角色图片

  removeCharacterImage(characterName) {

    const character = this.characters.find(c => c.name === characterName);

    if (character) {

      character.image = null;

      this.renderCharacters();

    }

  }



  // ---- END 角色列表功能 ----


  // ---- 角色替换功能 ----

  openCharacterReplaceModal(characterName) {
    this.characterToReplace = characterName;
    const modal = document.getElementById('jbu-character-replace-modal');
    const listContainer = document.getElementById('jbu-replace-char-list');
    
    listContainer.innerHTML = ''; // Clear previous list

    for (const category in window.characterDatabase) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'jbu-replace-category';
      
      const title = document.createElement('h4');
      title.className = 'jbu-replace-category-title';
      title.textContent = category;
      categoryDiv.appendChild(title);

      window.characterDatabase[category].forEach(char => {
        const item = document.createElement('div');
        item.className = 'jbu-replace-char-item';
        
        // Click listener for the whole item to trigger replacement
        item.addEventListener('click', () => {
            this.handleCharacterReplacement(char.description, char.name);
        });

        const desc = document.createElement('span');
        desc.textContent = char.name + '(' + char.description + ')';

        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'jbu-item-btn-wrapper';

        const generateBtn = document.createElement('button');
        generateBtn.className = 'jbu-btn jbu-btn-small jbu-generate-char-from-db';
        generateBtn.textContent = '生成';
        generateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleGenerateCharacterFromDb(category, char.name, char.description);
        });

        const editBtn = document.createElement('button');
        editBtn.className = 'jbu-btn jbu-btn-small jbu-edit-char-desc';
        editBtn.textContent = '编辑';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openCharacterEditModal(category, char.name);
        });

        btnWrapper.appendChild(generateBtn);
        btnWrapper.appendChild(editBtn);

        item.appendChild(desc);
        item.appendChild(btnWrapper);
        categoryDiv.appendChild(item);
      });

      listContainer.appendChild(categoryDiv);
    }

    modal.style.display = 'flex';
  }

  openCharacterEditModal(category, charName) {
    const modal = document.getElementById('jbu-character-edit-modal');
    const textarea = document.getElementById('jbu-char-edit-textarea');
    const charToEdit = window.characterDatabase[category].find(c => c.name === charName);

    if (charToEdit) {
        modal.dataset.category = category;
        modal.dataset.charName = charName;
        textarea.value = charToEdit.description;
        modal.style.display = 'flex';
    }
  }

  closeCharacterEditModal() {
      const modal = document.getElementById('jbu-character-edit-modal');
      modal.style.display = 'none';
  }

  saveCharacterEdit() {
      const modal = document.getElementById('jbu-character-edit-modal');
      const textarea = document.getElementById('jbu-char-edit-textarea');
      const category = modal.dataset.category;
      const charName = modal.dataset.charName;
      const newDescription = textarea.value.trim();

      const charToUpdate = window.characterDatabase[category].find(c => c.name === charName);
      if (charToUpdate) {
          charToUpdate.description = newDescription;
          console.log(`Updated ${charName} description to: ${newDescription}`);
      }

      this.closeCharacterEditModal();
      // Re-render the replacement modal to show the change
      this.openCharacterReplaceModal(this.characterToReplace);
  }

  async handleGenerateCharacterFromDb(category, name, description) {
    const finalPrompt = `${category}, ${name}, ${description}`;
    console.log('生成角色:', finalPrompt);
    
    try {
      await this.clearPreviousContent();
      await this.fillPrompt(finalPrompt);
      await this.clickGenerate();
      this.closeCharacterReplaceModal();
    } catch (error) {
      console.error('从数据库生成角色失败:', error);
      alert('生成角色失败，请检查控制台日志。');
    }
  }

  handleCharacterReplacement(newCharDescription, newCharName) {
    const oldCharName = this.characterToReplace;
    if (!oldCharName) return;


    const escapedOldCharName = oldCharName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Regex for ANY occurrence of the old name, with or without a description.
    // It now handles both English and Chinese parentheses.
    const descRegexPart = '(?:\\s*[\\(（][^\\)）]*[\\)）])?'; // Optional description part
    const anyOldCharOccurrenceRegex = new RegExp(escapedOldCharName + descRegexPart, 'g');

    // 2. PERFORM REPLACEMENT
    const performReplacement = (prompt) => {
      let isFirstMatch = true;
      
      return prompt.replace(anyOldCharOccurrenceRegex, () => {
        if (isFirstMatch) {
          isFirstMatch = false;
          return newCharName + '(' + newCharDescription + ')'; // First match gets the full new description
        } else {
          return newCharName; // Subsequent matches get just the new name
        }
      });
    };

    this.storyboards.forEach(sb => {
      sb.prompt = performReplacement(sb.prompt);
    });

    this.videos.forEach(video => {
      video.prompt = performReplacement(video.prompt);
    });

    // 3. FINALIZE AND RE-RENDER
    this.closeCharacterReplaceModal();
    this.updateAndRenderCharacters();
    this.renderStoryboards();
    this.renderVideos();
  }

  closeCharacterReplaceModal() {
    const modal = document.getElementById('jbu-character-replace-modal');
    modal.style.display = 'none';
    this.characterToReplace = null;
  }

  // ---- END 角色替换功能 ----




  // 批量导入图片

  handleBatchImport(files) {

    const startIndex = this.storyboards.length; // 记录开始索引

    Array.from(files).forEach((file, index) => {

      const storyboard = {

        id: Date.now() + index,

        name: `分镜${startIndex + index + 1}`, // 修正分镜编号逻辑

        images: [file], // 每个分镜对应一张图片

        prompt: '',

        status: 'pending'

      };

      this.storyboards.push(storyboard);

    });

    this.renderStoryboards();

  }



  // 为分镜添加图片

  addImageToStoryboard(storyboardId) {

    // 创建临时文件输入框

    const fileInput = document.createElement('input');

    fileInput.type = 'file';

    fileInput.accept = 'image/*';

    fileInput.multiple = true;

    fileInput.style.display = 'none';



    fileInput.addEventListener('change', (e) => {

      const files = Array.from(e.target.files);

      const storyboard = this.storyboards.find(s => s.id === storyboardId);



      if (storyboard && files.length > 0) {

        // 限制最多4张图片

        const remainingSlots = 4 - storyboard.images.length;

        const filesToAdd = files.slice(0, remainingSlots);



        storyboard.images.push(...filesToAdd);

        this.renderStoryboards();

      }



      // 清理临时元素

      document.body.removeChild(fileInput);

    });



    document.body.appendChild(fileInput);

    fileInput.click();

  }



  // 从分镜中删除图片

  removeImageFromStoryboard(storyboardId, imageIndex) {

    const storyboard = this.storyboards.find(s => s.id === storyboardId);

    if (storyboard && storyboard.images[imageIndex]) {

      storyboard.images.splice(imageIndex, 1);

      this.renderStoryboards();

    }

  }



  // 渲染分镜列表

  renderStoryboards() {

    const listContainer = document.getElementById('jbu-storyboard-list');

    listContainer.innerHTML = '';



    this.storyboards.forEach((storyboard, index) => {

      const storyboardDiv = document.createElement('div');

      storyboardDiv.className = `jbu-storyboard ${storyboard.status}`;

      storyboardDiv.draggable = true;

      storyboardDiv.dataset.index = index;



      storyboardDiv.innerHTML = `

          <div class="jbu-storyboard-header">

            <span class="jbu-storyboard-name">${storyboard.name}</span>

            <span class="jbu-storyboard-status">${this.getStatusText(storyboard.status)}</span>

            <button class="jbu-delete-storyboard" data-id="${storyboard.id}">×</button>

          </div>

          <div class="jbu-storyboard-content">

            <div class="jbu-images">

              ${storyboard.images.map((img, imgIndex) => `

                <div class="jbu-image-preview">

                  <img src="${URL.createObjectURL(img)}" alt="预览">

                  <button class="jbu-remove-image" data-storyboard-id="${storyboard.id}" data-image-index="${imgIndex}">×</button>

                </div>

              `).join('')}

              ${storyboard.images.length < 4 ? `<button class="jbu-add-image" data-id="${storyboard.id}">+</button>` : ''}

            </div>

            <textarea class="jbu-prompt" placeholder="输入分镜提示词..." data-id="${storyboard.id}">${storyboard.prompt}</textarea>

          </div>

        `;



      listContainer.appendChild(storyboardDiv);

    });



    this.bindStoryboardEvents();

  }



  // 绑定分镜相关事件

  bindStoryboardEvents() {

    // 删除分镜

    document.querySelectorAll('.jbu-delete-storyboard').forEach(btn => {

      btn.addEventListener('click', (e) => {

        const id = parseInt(e.target.dataset.id);

        this.storyboards = this.storyboards.filter(s => s.id !== id);

        this.reorderStoryboards(); // 重新排序分镜名称

        this.renderStoryboards();

        this.updateAndRenderCharacters(); // 更新角色列表

      });

    });



    // 添加图片按钮

    document.querySelectorAll('.jbu-add-image').forEach(btn => {

      btn.addEventListener('click', (e) => {

        const id = parseInt(e.target.dataset.id);

        this.addImageToStoryboard(id);

      });

    });



    // 删除图片按钮

    document.querySelectorAll('.jbu-remove-image').forEach(btn => {

      btn.addEventListener('click', (e) => {

        const storyboardId = parseInt(e.target.dataset.storyboardId);

        const imageIndex = parseInt(e.target.dataset.imageIndex);

        this.removeImageFromStoryboard(storyboardId, imageIndex);

      });

    });



    // 更新提示词

    document.querySelectorAll('.jbu-prompt').forEach(textarea => {

      textarea.addEventListener('input', (e) => {

        const id = parseInt(e.target.dataset.id);

        const storyboard = this.storyboards.find(s => s.id === id);

        if (storyboard) {

          storyboard.prompt = e.target.value;

        }

        this.updateAndRenderCharacters(); // 实时更新角色列表

      });

    });



    // 拖拽排序

    this.setupDragAndDrop();

  }



  // 设置拖拽排序

  setupDragAndDrop() {

    const listContainer = document.getElementById('jbu-storyboard-list');

    let draggedElement = null;



    listContainer.addEventListener('dragstart', (e) => {

      draggedElement = e.target;

      e.target.style.opacity = '0.5';

    });



    listContainer.addEventListener('dragend', (e) => {

      e.target.style.opacity = '';

      draggedElement = null;

      this.updateAndRenderCharacters(); // 拖拽结束后也更新一下

    });



    listContainer.addEventListener('dragover', (e) => {

      e.preventDefault();

    });



    listContainer.addEventListener('drop', (e) => {

      e.preventDefault();

      if (draggedElement && e.target.classList.contains('jbu-storyboard')) {

        const fromIndex = parseInt(draggedElement.dataset.index);

        const toIndex = parseInt(e.target.dataset.index);



        // 重新排序数组

        const item = this.storyboards.splice(fromIndex, 1)[0];

        this.storyboards.splice(toIndex, 0, item);



        this.renderStoryboards();

      }

    });

  }



  // 开始上传

  async startUpload() {

    // 检查是否选择了“图片生成”

    const modeElement = document.querySelector('div[class^="dimension-layout-"] div[class^="toolbar-settings-"] .lv-select-view .lv-select-view-value');
console.log(modeElement)
    if (!modeElement || !modeElement.textContent.includes('图片生成')) {

      alert('请先在即梦输入框底部工具栏手动选择“图片生成”模式，然后再开始上传。');

      return;

    }

    // const aspectElement = document.querySelector('div[class^="dimension-layout-"] div[class^="toolbar-settings-"] button.lv-btn span[class^=.button-text-"]');
    // if (!aspectElement || !aspectElement.textContent.includes('9:16')) {

    //   alert('请先在即梦输入框底部工具栏选择比例，确认是9:16，然后再开始上传。');

    //   return;

    // }
    if (this.storyboards.length === 0) {

      alert('请先添加分镜');

      return;

    }



    console.log('开始批量上传，总共', this.storyboards.length, '个分镜');



    // 重置所有分镜状态

    this.storyboards.forEach(storyboard => {

      if (storyboard.status !== 'completed') {

        storyboard.status = 'pending';

      }

    });



    this.isRunning = true;

    this.isPaused = false;

    this.currentIndex = 0;



    this.updateButtons();

    this.renderStoryboards();

    await this.processNextStoryboard();

  }



  // 处理下一个分镜

    async processNextStoryboard() {

      console.log(`processNextStoryboard: 当前索引=${this.currentIndex}, 总数=${this.storyboards.length}, 运行状态=${this.isRunning}, 暂停状态=${this.isPaused}`);

  

      if (!this.isRunning || this.isPaused) {

        console.log('停止处理：运行状态或暂停状态不允许继续');

        return;

      }

  

      // 跳过已完成的分镜

      while (this.currentIndex < this.storyboards.length && this.storyboards[this.currentIndex].status === 'completed') {

        this.currentIndex++;

      }

  

      if (this.currentIndex >= this.storyboards.length) {

        console.log('所有分镜处理完成，调用completeUpload');

        this.completeUpload();

        return;

      }



    const storyboard = this.storyboards[this.currentIndex];

    console.log(`开始处理第${this.currentIndex + 1}个分镜: ${storyboard.name}`);

    this.updateProgress();



    // 如果不是第一个分镜，先清理之前的内容

    if (this.currentIndex > 0) {

      console.log('清理上一个分镜的内容...');

      try {

        await this.clearPreviousContent();

      } catch (error) {

        console.error('清理内容失败:', error);

      }

    }



    try {

      await this.uploadStoryboard(storyboard);

      storyboard.status = 'completed';

      console.log(`分镜 ${storyboard.name} 处理成功`);

    } catch (error) {

      console.error(`分镜 ${storyboard.name} 处理失败:`, error);

      storyboard.status = 'failed';

    }



    this.renderStoryboards();

    this.currentIndex++;



    console.log(`等待 ${this.interval / 1000} 秒后处理下一个分镜...`);



    // 等待用户设置的间隔时间后继续下一个分镜

    if (this.isRunning && !this.isPaused) {

      setTimeout(() => {

        console.log('间隔时间到，继续处理下一个分镜');

        if (this.isRunning && !this.isPaused) {

          this.processNextStoryboard();

        } else {

          console.log('状态已改变，停止处理');

        }

      }, this.interval);

    } else {

      console.log('状态不允许继续，停止处理');

    }

  }



  // 上传单个分镜

  async uploadStoryboard(storyboard) {

    console.log(`开始上传分镜: ${storyboard.name}`);

    storyboard.status = 'uploading';

    this.renderStoryboards();



    try {

      // 1. 上传图片 (包括角色参考图和分镜自身的图)

      console.log('步骤1: 上传图片...');

      const imagesToUpload = [...storyboard.images];



      // 查找与当前提示词匹配的角色，并添加其参考图

      const mentionedCharacters = extractCharactersFromPrompt(storyboard.prompt);

      mentionedCharacters.forEach(name => {

        const character = this.characters.find(c => c.name === name && c.image);

        if (character) {

          console.log(`为分镜 ${storyboard.name} 添加角色 ${name} 的参考图`);

          imagesToUpload.push(character.image);

        }

      });



      console.log('总共上传', imagesToUpload.length, '张图片 (分镜+角色)');

      try {

        await this.uploadImages(imagesToUpload);

        console.log('✓ 图片上传成功');

      } catch (error) {

        console.error('✗ 图片上传失败:', error.message);

        throw new Error(`图片上传失败: ${error.message}`);

      }



      // 2. 填写提示词



      const finalPrompt = storyboard.prompt + ' 图片风格：' + this.selectedStyle



      console.log('步骤2: 填写提示词...', finalPrompt.substring(0, 50) + '...');



      try {



        await this.fillPrompt(finalPrompt);



        console.log('✓ 提示词填写成功');



      } catch (error) {

        console.error('✗ 提示词填写失败:', error.message);

        throw new Error(`提示词填写失败: ${error.message}`);

      }



      // 3. 点击生成按钮

      console.log('步骤3: 点击生成按钮...');

      try {

        await this.clickGenerate();

        console.log('✓ 生成按钮点击成功');

      } catch (error) {

        console.error('✗ 生成按钮点击失败:', error.message);

        throw new Error(`生成按钮点击失败: ${error.message}`);

      }



      console.log(`✓ 分镜 ${storyboard.name} 发送完成`);

    } catch (error) {

      console.error(`✗ 分镜 ${storyboard.name} 上传失败:`, error.message);

      throw error;

    }

  }



  // 清理之前的内容

  async clearPreviousContent() {

    try {

      console.log('开始清理上一个分镜的内容...');



      // 1. 清理参考图 - 根据用户提供的元素选择器

      console.log('清理参考图...');

      const imageDeleteSelectors = [

        '.remove-button-CGHPzk', // 用户提供的删除按钮类名

        'div[class*="remove-button-CGHPzk"]', // 模糊匹配
        '.remove-button-container-x2kHww .remove-button-CGHPzk', // 完整路径


        'div[class*="remove-button"] svg', // 包含svg的删除按钮

        'button:has(svg) path[d*="19.579"]' // 根据SVG路径特征匹配

      ];



      for (const selector of imageDeleteSelectors) {

        try {

          const deleteButtons = document.querySelectorAll(selector);

          console.log(`找到 ${deleteButtons.length} 个删除按钮 (${selector})`);

          deleteButtons.forEach((btn, index) => {

            if (btn.offsetParent !== null) { // 确保按钮可见

              console.log(`点击第 ${index + 1} 个删除按钮`);

              btn.click();

            }

          });

          if (deleteButtons.length > 0) {

            await this.sleep(300); // 等待删除动画完成

          }

        } catch (e) {

          console.log(`选择器 ${selector} 执行失败:`, e.message);

        }

      }



      // 2. 清理提示词 - 根据用户提供的元素选择器

      console.log('清理提示词...');

      const promptSelectors = [

        'textarea.lv-textarea', // 用户提供的textarea选择器
        'input.lv-input', // 用户提供的input选择器

        'input[placeholder*="请描述你想生成的图片"]',

        'textarea[placeholder*="请描述你想生成的图片"]',

        'input.lv-input[translate="no"]',

        'textarea.lv-textarea[translate="no"]'

      ];



      for (const selector of promptSelectors) {

        try {

          const inputs = document.querySelectorAll(selector);

          console.log(`找到 ${inputs.length} 个提示词输入框 (${selector})`);

          inputs.forEach((input, index) => {

            if (input.offsetParent !== null && (input.value || input.textContent)) {

              console.log(`清理第 ${index + 1} 个输入框，当前内容:`, input.value || input.textContent);

              input.focus();



              // 全选并删除

              if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {

                input.select(); // 全选

                input.value = '';

                // 触发多种事件确保即梦检测到变化

                input.dispatchEvent(new Event('input', { bubbles: true }));

                input.dispatchEvent(new Event('change', { bubbles: true }));

                input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

              } else if (input.contentEditable === 'true') {

                // 对于contenteditable元素

                input.focus();

                document.execCommand('selectAll');

                document.execCommand('delete');

                input.dispatchEvent(new Event('input', { bubbles: true }));

              }

            }

          });

        } catch (e) {

          console.log(`选择器 ${selector} 执行失败:`, e.message);

        }

      }



      console.log('内容清理完成');

    } catch (error) {

      console.error('清理内容失败:', error);

    }



    await this.sleep(800); // 等待清理完成

  }



  // 上传图片到即梦

  async uploadImages(images) {

    console.log('开始上传图片，共', images.length, '张');



    if (images.length === 0) {

      console.log('没有需要上传的图片，跳过此步骤。');

      return;

    }



    // 等待页面稳定，增加等待时间

    await this.sleep(1000);



    // 查找上传区域 - 多次尝试，因为页面可能需要时间加载

    const uploadSelectors = [

      'input[class*="file-input-"]', // 用户提供的上传input类名

      'input[type="file"][accept*="image"]',

      'input[type="file"][multiple]',

      'input[type="file"]'

    ];



    let uploadInput = null;



    // 查找上传input

    for (const selector of uploadSelectors) {

      const inputs = document.querySelectorAll(selector);

      console.log(`查找选择器 ${selector}，找到 ${inputs.length} 个input`);



      if (inputs.length > 0) {

        // 文件input通常是隐藏的，直接使用第一个找到的input

        uploadInput = inputs[0];

        console.log('找到上传input:', selector, uploadInput, 'disabled:', uploadInput.disabled);

        break;

      }

    }



    if (!uploadInput) {

      throw new Error('找不到上传区域');

    }



    // 模拟文件上传

    try {

      console.log('准备上传到input:', uploadInput.className || uploadInput.tagName);



      // 完全重置input状态

      uploadInput.value = '';



      const dataTransfer = new DataTransfer();

      images.forEach(image => {

        dataTransfer.items.add(image);

      });



      uploadInput.files = dataTransfer.files;



      // 触发change事件

      const changeEvent = new Event('change', { bubbles: true });

      uploadInput.dispatchEvent(changeEvent);



      // 也触发input事件

      const inputEvent = new Event('input', { bubbles: true });

      uploadInput.dispatchEvent(inputEvent);



      console.log('图片上传事件已触发');

    } catch (error) {

      console.error('上传图片失败:', error);

      throw error;

    }



    await this.sleep(1000); // 等待上传完成

  }



      // 填写提示词



      async fillPrompt(prompt) {



        console.log('开始填写提示词:', prompt);



    



        const inputSelectors = [



          'textarea.lv-textarea',
          'input.lv-input',






          'input[placeholder*="请描述你想生成的图片"]',



          'textarea[placeholder*="请描述你想生成的图片"]',



          'input.lv-input[translate="no"]',



          'textarea.lv-textarea[translate="no"]',



          'textarea',



          'input[type="text"]',



          '[contenteditable="true"]'



        ];



    



        let promptInput = null;



    



        for (const selector of inputSelectors) {



          try {



            const inputs = document.querySelectorAll(selector);



            console.log(`尝试选择器 ${selector}，找到 ${inputs.length} 个元素`);



    



            for (const input of inputs) {



              if (input.offsetParent !== null && !input.closest('#jimeng-batch-uploader')) {



                promptInput = input;



                console.log('选中输入框:', input);



                break;



              }



            }



            if (promptInput) break;



          } catch (e) {



            console.log(`选择器 ${selector} 执行失败:`, e.message);



          }



        }



    



        if (!promptInput) {



          throw new Error('找不到提示词输入框');



        }



    



        console.log('找到提示词输入框:', promptInput.tagName, promptInput.className);



    



        promptInput.focus();



        await this.sleep(200);



    



        // Differentiated logic for different input types



        if (promptInput.tagName === 'TEXTAREA' || promptInput.tagName === 'INPUT') {



          console.log('使用React兼容方法填写Input/Textarea');



          



          const element = promptInput;



          



          // Set value using prototype setter hack for React compatibility



          const nativeValueSetter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;



          if (nativeValueSetter) {



            nativeValueSetter.call(element, prompt);



          } else {



            // Fallback for unusual cases



            element.value = prompt;



          }



    



          // Trigger events to notify the framework of the change



          element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));



          element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));



    
          console.log('输入框',element)


        } else if (promptInput.isContentEditable) {



          console.log('使用 contentEditable 方法填写');



          promptInput.innerHTML = prompt;



          promptInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));



        } else {



            console.warn('未知的输入框类型，使用 value 属性作为后备方案');



            promptInput.value = prompt;



            promptInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));



        }



    



        console.log('提示词填写完成');



        await this.sleep(500);



      }



  // 点击生成按钮

  async clickGenerate() {

    console.log('开始查找生成按钮...');



    // 根据用户提供的按钮特征查找发送按钮
    // lv-btn lv-btn-secondary lv-btn-size-default lv-btn-shape-square button-wtoV7J lv-popover-open active-NdxDQM
    // lv-btn lv-btn-primary lv-btn-size-default lv-btn-shape-circle lv-btn-icon-only lv-btn-disabled button-wtoV7J submit-button-VW0U_J submit-button-M82Oxj
    const buttonSelectors = [


      'button[class*="submit-button"]', // 包含submit-button的按钮

      // 'button.lv-btn-primary:has(svg)', // 包含SVG的主要按钮

      'button:has(path[d*="M12.002 3c.424 0"])', // 根据SVG路径特征匹配

      // 备用选择器

      'button[type="submit"]',

      'button[class*="send"]',

      'button[class*="submit"]',

      'button[class*="generate"]',

      // 'button:has(svg)',

    ];



    let generateBtn = null;



    // 查找发送按钮

    for (const selector of buttonSelectors) {

      try {

        const buttons = document.querySelectorAll(selector);

        console.log(`尝试选择器 ${selector}，找到 ${buttons.length} 个按钮`);



        for (const btn of buttons) {

          if (btn.offsetParent !== null) { // 确保按钮可见

            const isDisabled = btn.disabled || btn.classList.contains('lv-btn-disabled');

            console.log(`按钮状态: disabled=${isDisabled}, classes=${btn.className}`);



            if (!isDisabled) {

              generateBtn = btn;

              console.log('找到可用的发送按钮:', btn);

              break;

            }

          }

        }

        if (generateBtn) break;

      } catch (e) {

        console.log(`选择器 ${selector} 执行失败:`, e.message);

      }

    }



    // 如果还是找不到，尝试查找最右侧的可用按钮

    if (!generateBtn) {

      console.log('使用备用方案：查找最右侧按钮');

      const allButtons = document.querySelectorAll('button');

      let rightmostBtn = null;

      let maxRight = -1;



      allButtons.forEach(btn => {

        if (btn.offsetParent !== null && !btn.disabled && !btn.classList.contains('lv-btn-disabled')) {

          const rect = btn.getBoundingClientRect();

          if (rect.right > maxRight) {

            maxRight = rect.right;

            rightmostBtn = btn;

          }

        }

      });

      generateBtn = rightmostBtn;

    }



    if (!generateBtn) {

      throw new Error('找不到可用的生成/发送按钮');

    }



    console.log('准备点击发送按钮:', generateBtn.className);



    // 确保按钮处于可点击状态

    generateBtn.focus();

    await this.sleep(200);



    // 点击按钮

    generateBtn.click();

    console.log('发送按钮已点击');



    // 发送完成，等待一小段时间确保请求发出

    await this.sleep(1000);

  }



  // 暂停上传

  pauseUpload() {

    this.isPaused = !this.isPaused;

    this.updateButtons();

  }



  // 停止上传

  stopUpload() {

    this.isRunning = false;

    this.isPaused = false;

    this.currentIndex = 0;

    this.updateButtons();

    this.updateProgress();

  }



  // 完成上传

  completeUpload() {

    this.isRunning = false;

    this.isPaused = false;

    this.updateButtons();

    this.updateProgress();

    alert('所有分镜上传完成！');

  }



  // 重新排序分镜名称

  reorderStoryboards() {

    this.storyboards.forEach((storyboard, index) => {

      storyboard.name = `分镜${index + 1}`;

    });

  }



  // 清空分镜列表

  clearStoryboards() {

    if (confirm('确定要清空所有分镜吗？')) {

      this.storyboards = [];

      this.renderStoryboards();

      this.updateAndRenderCharacters(); // 清空角色列表

    }

  }



    // 更新按钮状态



    updateButtons() {



      if (this.activeTab === 'image') {



        const startBtn = this.floatingWindow.querySelector('.jbu-start');



        const pauseBtn = this.floatingWindow.querySelector('.jbu-pause');



        const stopBtn = this.floatingWindow.querySelector('.jbu-stop');



        if (!startBtn || !pauseBtn || !stopBtn) return;



  



        startBtn.disabled = this.isRunning;



        pauseBtn.disabled = !this.isRunning;



        stopBtn.disabled = !this.isRunning;



        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';



  



      } else if (this.activeTab === 'video') {



        const startBtn = this.floatingWindow.querySelector('.jbu-video-start');



        const pauseBtn = this.floatingWindow.querySelector('.jbu-video-pause');



        const stopBtn = this.floatingWindow.querySelector('.jbu-video-stop');



        if (!startBtn || !pauseBtn || !stopBtn) return;



  



        startBtn.disabled = this.isRunning;



        pauseBtn.disabled = !this.isRunning;



        stopBtn.disabled = !this.isRunning;



        pauseBtn.textContent = this.isPaused ? '继续' : '暂停';



      }



    }



  // 更新进度

  updateProgress() {

    const progressText = this.floatingWindow.querySelector('.jbu-progress-text');

    const progressFill = this.floatingWindow.querySelector('.jbu-progress-fill');



    if (!this.isRunning) {

      progressText.textContent = '准备就绪';

      progressFill.style.width = '0%';

      return;

    }



    const progress = (this.currentIndex / this.storyboards.length) * 100;

    progressText.textContent = `第${this.currentIndex + 1}个分镜，共${this.storyboards.length}个分镜`;

    progressFill.style.width = `${progress}%`;

  }



  // 获取状态文本

  getStatusText(status) {

    const statusMap = {

      pending: '待上传',

      uploading: '上传中',

      completed: '已完成',

      failed: '失败'

    };

    return statusMap[status] || '未知';

  }



  // 最小化/展开

  toggleMinimize() {

    console.log('切换最小化状态');



    try {

      const content = this.floatingWindow.querySelector('.jbu-content');

      const header = this.floatingWindow.querySelector('.jbu-header');

      const floatingBall = this.floatingWindow.querySelector('.jbu-floating-ball');



      if (this.floatingWindow.classList.contains('jbu-minimized')) {

        // 展开

        console.log('展开悬浮窗');

        this.floatingWindow.classList.remove('jbu-minimized');



        // 恢复正常样式

        this.floatingWindow.style.cssText = `

            position: fixed;

            top: 20px;

            right: 20px;

            width: 920px;

            height: auto;

            background: #1a1a1a;

            border: 1px solid #333;

            border-radius: 8px;

            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

            z-index: 10000;

            transform: none;

          `;



        content.style.display = 'block';

        header.style.display = 'flex';

        floatingBall.style.display = 'none';



      } else {

        // 最小化为悬浮球

        console.log('最小化为悬浮球');

        this.floatingWindow.classList.add('jbu-minimized');



        // 设置悬浮球样式 - 确保贴右边

        this.floatingWindow.style.cssText = `

            position: fixed !important;

            right: 0px !important;

            top: 50% !important;

            transform: translateY(-50%) !important;

            width: 60px !important;

            height: 60px !important;

            background: transparent !important;

            border: none !important;

            border-radius: 50% !important;

            box-shadow: none !important;

            z-index: 999999 !important;

            margin: 0 !important;

            padding: 0 !important;

          `;



        content.style.display = 'none';

        header.style.display = 'none';

        floatingBall.style.display = 'flex';

      }

    } catch (error) {

      console.error('切换最小化状态失败:', error);

    }

  }



  // 使悬浮窗可拖拽



  makeDraggable() {



    const element = this.floatingWindow;



    const header = element.querySelector('.jbu-header');



    const DRAG_HANDLE_WIDTH = 10; // 允许从左侧10px范围内拖拽







    let isDragging = false;



    let initialX;



    let initialY;



    let offsetX; // 鼠标点击位置相对于元素左上角的偏移



    let offsetY;







    const startDrag = (e) => {



      // 确保不是在按钮上开始拖拽



      if (e.target.tagName === 'BUTTON' || e.target.classList.contains('jbu-resize-handle')) return;







      const rect = element.getBoundingClientRect();



      const clickX = e.clientX;



      const clickY = e.clientY;







      // 检查是否在头部区域或者左侧拖拽区域



      const isClickOnHeader = header.contains(e.target);



      const isClickOnLeftEdge = (clickX >= rect.left && clickX <= rect.left + DRAG_HANDLE_WIDTH && clickY >= rect.top && clickY <= rect.bottom);







      if (isClickOnHeader || isClickOnLeftEdge) {



        isDragging = true;



        offsetX = clickX - rect.left;



        offsetY = clickY - rect.top;







        // 记录初始位置，用于计算拖拽偏移



        initialX = e.clientX;



        initialY = e.clientY;







        element.style.cursor = 'grabbing';



      }



    };







    const drag = (e) => {



      if (isDragging) {



        e.preventDefault();



        const dx = e.clientX - initialX;



        const dy = e.clientY - initialY;







        element.style.left = (element.offsetLeft + dx) + 'px';



        element.style.top = (element.offsetTop + dy) + 'px';







        initialX = e.clientX;



        initialY = e.clientY;



      }



    };







    const stopDrag = () => {



      isDragging = false;



      element.style.cursor = 'grab';



    };







    element.addEventListener('mousedown', startDrag);



    document.addEventListener('mousemove', drag);



    document.addEventListener('mouseup', stopDrag);



  }







  // 使悬浮窗可缩放



  makeResizable() {



    const element = this.floatingWindow;



    const handles = element.querySelectorAll('.jbu-resize-handle');



    const minWidth = 300;



    const minHeight = 400;



    let originalWidth = 0;



    let originalHeight = 0;



    let originalX = 0;



    let originalY = 0;



    let startX = 0;



    let startY = 0;







    handles.forEach(handle => {



      handle.addEventListener('mousedown', (e) => {



        e.preventDefault();



        originalWidth = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));



        originalHeight = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));



        originalX = element.getBoundingClientRect().left;



        originalY = element.getBoundingClientRect().top;



        startX = e.pageX;



        startY = e.pageY;







        const resize = (e) => {







          if (handle.classList.contains('jbu-resize-se')) {







            const width = originalWidth + (e.pageX - startX);







            const height = originalHeight + (e.pageY - startY);







            if (width > minWidth) {







              element.style.width = width + 'px';







            }







            if (height > minHeight) {







              element.style.height = height + 'px';







            }







          } else if (handle.classList.contains('jbu-resize-e')) {







            const width = originalWidth + (e.pageX - startX);







            if (width > minWidth) {







              element.style.width = width + 'px';







            }







          } else if (handle.classList.contains('jbu-resize-s')) {







            const height = originalHeight + (e.pageY - startY);







            if (height > minHeight) {







              element.style.height = height + 'px';







            }







          } else if (handle.classList.contains('jbu-resize-w')) {







            const width = originalWidth - (e.pageX - startX);







            const left = originalX + (e.pageX - startX);







            if (width > minWidth) {







              element.style.width = width + 'px';







              element.style.left = left + 'px';







            }







          } else if (handle.classList.contains('jbu-resize-nw')) {







            const width = originalWidth - (e.pageX - startX);







            const left = originalX + (e.pageX - startX);







            const height = originalHeight - (e.pageY - startY);







            const top = originalY + (e.pageY - startY);







            if (width > minWidth) {







              element.style.width = width + 'px';







              element.style.left = left + 'px';







            }







            if (height > minHeight) {







              element.style.height = height + 'px';







              element.style.top = top + 'px';







            }







          } else if (handle.classList.contains('jbu-resize-sw')) {







            const width = originalWidth - (e.pageX - startX);







            const left = originalX + (e.pageX - startX);







            const height = originalHeight + (e.pageY - startY);







            if (width > minWidth) {







              element.style.width = width + 'px';







              element.style.left = left + 'px';







            }







            if (height > minHeight) {







              element.style.height = height + 'px';







            }







          }







        };







        const stopResize = () => {



          window.removeEventListener('mousemove', resize);



          window.removeEventListener('mouseup', stopResize);



        };







        window.addEventListener('mousemove', resize);



        window.addEventListener('mouseup', stopResize);



      });



    });



  }







  // 工具函数：延时



  sleep(ms) {



    return new Promise(resolve => setTimeout(resolve, ms));



  }

}



// 初始化插件

console.log('即梦批量上传插件脚本已加载');

console.log('当前页面:', window.location.hostname);



// 防止重复初始化

if (window.jimengBatchUploaderInstance) {

  console.log('插件实例已存在，清理旧实例');

  if (window.jimengBatchUploaderInstance.floatingWindow) {

    window.jimengBatchUploaderInstance.floatingWindow.remove();

  }

  window.jimengBatchUploaderInstance = null;

}



if (window.location.hostname.includes('jimeng.ai') ||

  window.location.hostname.includes('jianyingai.com') ||

  window.location.hostname.includes('jianying.com')) {

  console.log('检测到即梦页面，正在初始化插件...');



  // 清理可能存在的旧插件DOM

  const existingPlugin = document.getElementById('jimeng-batch-uploader');

  if (existingPlugin) {

    console.log('发现旧插件DOM，正在清理...');

    existingPlugin.remove();

  }



  // 等待页面完全加载

  if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', () => {

      console.log('DOM加载完成，创建插件实例');

      window.jimengBatchUploaderInstance = new JimengBatchUploader();

    });

  } else {

    console.log('页面已加载，直接创建插件实例');

    window.jimengBatchUploaderInstance = new JimengBatchUploader();

  }

} else {

  console.log('非即梦页面，插件不会启动');

}

