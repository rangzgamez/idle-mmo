const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create directories if they don't exist
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Character classes
const characterClasses = [
  { name: 'fighter', color: '#d44', textColor: '#fff' },
  { name: 'priest', color: '#aad', textColor: '#fff' },
  { name: 'rogue', color: '#447', textColor: '#fff' },
  { name: 'archer', color: '#494', textColor: '#fff' },
  { name: 'wizard', color: '#44a', textColor: '#fff' }
];

// Enemies
const enemies = [
  { name: 'enemy1', color: '#a43', textColor: '#fff' },
  { name: 'enemy2', color: '#666', textColor: '#fff' },
  { name: 'enemy3', color: '#838', textColor: '#fff' }
];

// UI elements
const uiElements = [
  { name: 'button', width: 100, height: 40, color: '#48c', textColor: '#fff' },
  { name: 'panel', width: 200, height: 150, color: '#555', textColor: '#ddd' }
];

// Tiles
const tiles = [
  { name: 'grass', color: '#4a4', textColor: '#dfd' },
  { name: 'water', color: '#38c', textColor: '#cef' },
  { name: 'forest', color: '#363', textColor: '#dfd' }
];

// Items
const items = [
  { name: 'sword', color: '#aaa', textColor: '#fff' },
  { name: 'staff', color: '#963', textColor: '#fff' },
  { name: 'bow', color: '#a96', textColor: '#fff' }
];

// Function to create character sprites
const createCharacterSprites = () => {
  const size = 64;
  const dir = path.join(__dirname, 'images', 'characters');
  createDirectoryIfNotExists(dir);

  characterClasses.forEach(({ name, color, textColor }) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(8, 8, size - 16, size - 16, 4);
    ctx.fill();
    
    // Face circle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(size / 2, 24, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Text
    ctx.font = '14px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(name, size / 2, 38);
    
    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(dir, `${name}.png`), buffer);
    console.log(`Created ${name}.png`);
  });
};

// Function to create enemy sprites
const createEnemySprites = () => {
  const size = 64;
  const dir = path.join(__dirname, 'images', 'enemies');
  createDirectoryIfNotExists(dir);

  enemies.forEach(({ name, color, textColor }) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Diamond shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(size / 2, 8);
    ctx.lineTo(size - 8, size / 2);
    ctx.lineTo(size / 2, size - 8);
    ctx.lineTo(8, size / 2);
    ctx.closePath();
    ctx.fill();
    
    // Eye circle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(size / 2, 24, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Text
    ctx.font = '14px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(name, size / 2, 38);
    
    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(dir, `${name}.png`), buffer);
    console.log(`Created ${name}.png`);
  });
};

// Function to create UI element sprites
const createUISprites = () => {
  const dir = path.join(__dirname, 'images', 'ui');
  createDirectoryIfNotExists(dir);

  uiElements.forEach(({ name, width, height, color, textColor }) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 5);
    ctx.fill();
    
    // Inner panel for panel sprite
    if (name === 'panel') {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.roundRect(5, 5, width - 10, height - 10, 3);
      ctx.fill();
      ctx.strokeStyle = '#777';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Text
    ctx.font = name === 'panel' ? '16px Arial' : '14px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, width / 2, height / 2);
    
    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(dir, `${name}.png`), buffer);
    console.log(`Created ${name}.png`);
  });
};

// Function to create tile sprites
const createTileSprites = () => {
  const size = 64;
  const dir = path.join(__dirname, 'images', 'tiles');
  createDirectoryIfNotExists(dir);

  tiles.forEach(({ name, color, textColor }) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    
    // Special details for each tile type
    if (name === 'grass') {
      // Small circles for grass details
      ctx.fillStyle = '#6c6';
      ctx.beginPath();
      ctx.arc(16, 16, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(32, 48, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(48, 24, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (name === 'water') {
      // Wave patterns for water
      ctx.fillStyle = '#49d';
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.quadraticCurveTo(16, 8, 32, 16);
      ctx.quadraticCurveTo(48, 24, 64, 16);
      ctx.lineTo(64, 24);
      ctx.quadraticCurveTo(48, 32, 32, 24);
      ctx.quadraticCurveTo(16, 16, 0, 24);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.quadraticCurveTo(16, 32, 32, 40);
      ctx.quadraticCurveTo(48, 48, 64, 40);
      ctx.lineTo(64, 48);
      ctx.quadraticCurveTo(48, 56, 32, 48);
      ctx.quadraticCurveTo(16, 40, 0, 48);
      ctx.closePath();
      ctx.fill();
    } else if (name === 'forest') {
      // Tree patterns for forest
      ctx.fillStyle = '#696';
      ctx.beginPath();
      ctx.moveTo(32, 8);
      ctx.lineTo(40, 24);
      ctx.lineTo(24, 24);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(20, 16);
      ctx.lineTo(28, 32);
      ctx.lineTo(12, 32);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(44, 16);
      ctx.lineTo(52, 32);
      ctx.lineTo(36, 32);
      ctx.closePath();
      ctx.fill();
      
      // Tree trunks
      ctx.fillStyle = '#963';
      ctx.fillRect(30, 24, 4, 10);
      ctx.fillRect(18, 32, 4, 10);
      ctx.fillRect(42, 32, 4, 10);
    }
    
    // Text
    ctx.font = '10px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(name, size / 2, 35);
    
    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(dir, `${name}.png`), buffer);
    console.log(`Created ${name}.png`);
  });
};

// Function to create item sprites
const createItemSprites = () => {
  const size = 32;
  const dir = path.join(__dirname, 'images', 'items');
  createDirectoryIfNotExists(dir);

  items.forEach(({ name, color, textColor }) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    if (name === 'sword') {
      // Sword blade
      ctx.fillStyle = color;
      ctx.fillRect(14, 6, 4, 20);
      
      // Sword handle
      ctx.fillStyle = '#888';
      ctx.fillRect(8, 4, 16, 4);
      
      // Sword handle end
      ctx.fillStyle = '#964';
      ctx.fillRect(14, 26, 4, 2);
    } else if (name === 'staff') {
      // Staff handle
      ctx.fillStyle = color;
      ctx.fillRect(14, 6, 4, 22);
      
      // Staff orb
      ctx.fillStyle = '#48f';
      ctx.beginPath();
      ctx.arc(16, 6, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (name === 'bow') {
      // Bow curve
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 6);
      ctx.quadraticCurveTo(22, 16, 10, 26);
      ctx.stroke();
      
      // Bow string
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 16);
      ctx.lineTo(22, 16);
      ctx.stroke();
    }
    
    // Text
    ctx.font = '5px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(name, size / 2, 18);
    
    // Save
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(dir, `${name}.png`), buffer);
    console.log(`Created ${name}.png`);
  });
};

// Generate all sprites
const generateAllSprites = () => {
  createCharacterSprites();
  createEnemySprites();
  createUISprites();
  createTileSprites();
  createItemSprites();
  console.log('All sprites generated successfully!');
};

generateAllSprites(); 