// utils.js

/**
 * 专业CSV解析器
 * @param {string} str CSV字符串
 * @returns {Array<Array<string>>} 解析后的二维数组
 */
function parseCSV(str) {
  const result = [];
  let currentRow = [];
  let currentField = '';
  let inQuotedField = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];
    if (inQuotedField) {
      if (char === '"') {
        if (nextChar === '"') { // 处理转义引号 ""
          currentField += '"';
          i++; // 跳过下一个引号
        } else {
          inQuotedField = false; // 引号字段结束
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotedField = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField);
        result.push(currentRow);
        currentRow = [];
        currentField = '';
        // 处理 Windows 的 \r\n
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        currentField += char;
      }
    }
  }
  // 添加最后一行
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    result.push(currentRow);
  }
  // 清理可能因文件末尾换行符产生的空行
  if (result.length > 0 && result[result.length - 1].every(field => field === '')) {
    result.pop();
  }
  return result;
}


/**
 * 从单个提示词中提取角色名称
 * @param {string} prompt 提示词
 * @returns {Array<string>} 角色名称数组
 */
function extractCharactersFromPrompt(prompt) {
  if (!prompt) return [];

  const characterNames = new Set();
  
  // 1. Pattern: Name(Description) or 角色：Name(Description)
  const regexWithParen = /(?:角色：)?([\u4e00-\u9fa5a-zA-Z0-9]+?)[(（](.*?)[)）]/g;
  let match;
  while ((match = regexWithParen.exec(prompt)) !== null) {
    let name = match[1].trim();
    name = name.replace(/和|\*/g, '');
    if (name) {
      characterNames.add(name);
    }
  }

  // 2. Pattern: 角色：Name (without parentheses, followed by newline, space, or end of string)
  // specific handle for "[主体]角色：Lucas" format
  const regexRoleColon = /(?:角色|Role)[:：]\s*([\u4e00-\u9fa5a-zA-Z0-9]+)(?:\s|$|\n|\r)/g;
  while ((match = regexRoleColon.exec(prompt)) !== null) {
      let name = match[1].trim();
      name = name.replace(/和|\*/g, '');
      // Avoid adding if it looks like a common noun or too short if unsure, but for now trust the pattern
      if (name && !characterNames.has(name)) {
          characterNames.add(name);
      }
  }

  return Array.from(characterNames);
}

/**
 * 从所有分镜中更新角色列表
 * @param {Array<object>} storyboards 分镜列表
 * @param {Array<object>} existingCharacters 已有的角色列表
 * @param {Array<string>} additionalNames 额外的角色名称列表（如导入的角色）
 * @returns {Array<object>} 更新后的角色列表
 */
function updateCharacters(storyboards, existingCharacters, additionalNames = []) {
  const allPrompts = storyboards.map(s => s.prompt);
  const characterNames = new Set(additionalNames); // Start with additional names

  // Get all characters from the global database for checking
  let dbCharacters = [];
  if (window.characterDatabase) {
    for (const category in window.characterDatabase) {
      dbCharacters = dbCharacters.concat(window.characterDatabase[category]);
    }
  }

  allPrompts.forEach(prompt => {
    // 1. Extract using regex patterns
    const extracted = extractCharactersFromPrompt(prompt);
    extracted.forEach(name => characterNames.add(name));

    // 2. Scan for known characters from database in the prompt
    if (prompt) {
        const lowerPrompt = prompt.toLowerCase();
        dbCharacters.forEach(char => {
            // Use word boundaries for English names, simple inclusion for potentially Chinese or mixed
            // Simplified check: if prompt includes the name (case-insensitive)
            if (lowerPrompt.includes(char.name.toLowerCase())) {
                characterNames.add(char.name);
            }
        });
    }
  });

  // 更新 this.characters 数组，保留已有图片
  const newCharacters = [];
  characterNames.forEach(name => {
    const existing = existingCharacters.find(c => c.name === name);
    if (existing) {
      newCharacters.push(existing);
    } else {
      newCharacters.push({ name, image: null });
    }
  });
  
  return newCharacters;
}

/**
 * 导出提示词为CSV格式字符串
 * @param {Array<object>} storyboards 分镜列表
 * @param {Array<object>} videos 视频列表
 * @returns {string} CSV格式字符串
 */
function exportPromptsToCSV(storyboards, videos) {
  const escapeCSV = (field) => {
    if (field === null || field === undefined) {
      return '';
    }
    const str = String(field);
    // 如果字段包含逗号、引号或换行符，则用双引号括起来
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      // 将字段内的双引号替换为两个双引号
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = ['分镜数', '分镜提示词', '动作提示词'];
  const rows = [header];
  
  const maxLen = Math.max(storyboards.length, videos.length);

  for (let i = 0; i < maxLen; i++) {
    const storyboardPrompt = storyboards[i] ? storyboards[i].prompt : '';
    const videoPrompt = videos[i] ? videos[i].prompt : '';
    
    rows.push([
      `分镜${i + 1}`,
      escapeCSV(storyboardPrompt),
      escapeCSV(videoPrompt)
    ]);
  }

  return rows.map(row => row.join(',')).join('\n');
}
