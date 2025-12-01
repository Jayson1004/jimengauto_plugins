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
function updateCharacters(storyboards, existingCharacters, additionalPeopleData = []) {
  const allPrompts = storyboards.map(s => s.prompt);
  // Start with additional data, mapping to a consistent object structure
  const characterMap = new Map(); // name -> { name, image (url or File) }

  additionalPeopleData.forEach(p => {
    if (p.name) {
      // Prioritize URL from additionalPeopleData if available
      const charImage = p.url ? p.url : null;
      characterMap.set(p.name, { name: p.name, image: charImage });
    }
  });

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
    extracted.forEach(name => {
      if (!characterMap.has(name)) {
        characterMap.set(name, { name, image: null });
      }
    });

    // 2. Scan for known characters from database in the prompt
    if (prompt) {
        const lowerPrompt = prompt.toLowerCase();
        dbCharacters.forEach(char => {
            if (lowerPrompt.includes(char.name.toLowerCase())) {
                if (!characterMap.has(char.name)) {
                    // Check if char.url exists in characterDatabase and use it
                    const charImage = char.url ? char.url : null;
                    characterMap.set(char.name, { name: char.name, image: charImage });
                }
            }
        });
    }
  });

  // Convert map values to array and merge with existing characters, preserving images
  const newCharacters = Array.from(characterMap.values());

  // Merge with existing characters, preserving existing images if a character already existed
  newCharacters.forEach(newChar => {
    const existing = existingCharacters.find(c => c.name === newChar.name);
    if (existing) {
      // Prioritize existing image (from user upload or previous state) over imported default
      if (existing.image) {
        newChar.image = existing.image;
      }
    }
  });

  // Also add any existing characters that are not in the new list (e.g., if they were manually added but not mentioned in current prompts)
  existingCharacters.forEach(extChar => {
    if (!newCharacters.some(newChar => newChar.name === extChar.name)) {
        newCharacters.push(extChar);
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
