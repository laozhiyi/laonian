const fs = require('fs');
const path = require('path');

// SVG转PNG转换器（使用sharp库）
// 运行前请先执行: npm install sharp

try {
  const sharp = require('sharp');
  const svgDir = path.join(__dirname, 'src/static');
  const icons = [
    'tab-home', 'tab-home-active',
    'tab-mall', 'tab-mall-active',
    'tab-user', 'tab-user-active'
  ];

  icons.forEach(name => {
    const svgPath = path.join(svgDir, `${name}.svg`);
    const pngPath = path.join(svgDir, `${name}.png`);

    if (fs.existsSync(svgPath)) {
      sharp(svgPath)
        .resize(81, 81) // 微信小程序推荐尺寸 81x81
        .png()
        .toFile(pngPath)
        .then(() => console.log(`✓ 已转换: ${name}.svg -> ${name}.png`))
        .catch(err => console.error(`✗ 转换失败 ${name}:`, err));
    }
  });
} catch (e) {
  console.log('需要安装 sharp 库来转换图片');
  console.log('请运行: npm install sharp');
  console.log('');
  console.log('或者手动将 src/static 目录下的 SVG 图标转换为 PNG 格式（81x81像素）：');
  icons.forEach(name => {
    console.log(`  - ${name}.svg -> ${name}.png`);
  });
}
