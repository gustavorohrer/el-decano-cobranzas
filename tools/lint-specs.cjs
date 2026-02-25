const fs = require('fs');
const path = require('path');

const specsDir = path.join(__dirname, '../openspec/specs');
const errors = [];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.md')) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let currentRequirementLine = -1;
  let hasScenario = false;
  let hasNormative = false;

  lines.forEach((line, i) => {
    if (line.trim().startsWith('### Requirement:')) {
      // Check previous requirement
      if (currentRequirementLine !== -1) {
        if (!hasScenario) errors.push(`${filePath}:${currentRequirementLine + 1} - Requirement missing #### Scenario: header`);
        if (!hasNormative) errors.push(`${filePath}:${currentRequirementLine + 1} - Requirement missing normative language (SHALL/MUST) in body`);
      }
      
      currentRequirementLine = i;
      hasScenario = false;
      hasNormative = false;
    }
    
    // Check for normative language in the body of the requirement
    if (currentRequirementLine !== -1 && line.match(/\b(SHALL|MUST)\b/i)) {
      hasNormative = true;
    }
    
    if (line.trim().startsWith('#### Scenario:')) {
      hasScenario = true;
    }
  });

  // Check last requirement
  if (currentRequirementLine !== -1) {
    if (!hasScenario) errors.push(`${filePath}:${currentRequirementLine + 1} - Requirement missing #### Scenario: header`);
    if (!hasNormative) errors.push(`${filePath}:${currentRequirementLine + 1} - Requirement missing normative language (SHALL/MUST) in body`);
  }
}

try {
  if (fs.existsSync(specsDir)) {
    walk(specsDir);
  } else {
    console.error(`Directory not found: ${specsDir}`);
    process.exit(1);
  }

  if (errors.length > 0) {
    console.error('OpenSpec Syntax Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log('All specs are valid! ✅');
  }
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}
