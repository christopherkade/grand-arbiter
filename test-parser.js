// Test script to validate the rules parsing
const fs = require('fs');
const path = require('path');

// Copy the parsing function from the API route
function parseRules(content) {
  const lines = content.split('\n');
  const rules = [];
  let currentRule = null;
  let currentContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Match rule headers like "702.19. Trample" or "101. The Magic Golden Rules"
    const ruleHeaderMatch = line.match(/^(\d+(?:\.\d+)?)\.\s+(.+)$/);
    
    if (ruleHeaderMatch) {
      // Save previous rule if it exists
      if (currentRule) {
        currentRule.content = currentContent.join('\n').trim();
        if (currentRule.content) {
          rules.push(currentRule);
        }
      }
      
      // Start new rule
      currentRule = {
        id: ruleHeaderMatch[1],
        title: `${ruleHeaderMatch[1]}. ${ruleHeaderMatch[2]}`,
        content: ''
      };
      currentContent = [];
    } else if (currentRule && line) {
      // Add content to current rule
      currentContent.push(line);
      
      // Look ahead to see if we're about to hit another main rule
      const nextLineIndex = i + 1;
      if (nextLineIndex < lines.length) {
        const nextLine = lines[nextLineIndex].trim();
        const isNextRuleHeader = nextLine.match(/^(\d+(?:\.\d+)?)\.\s+(.+)$/);
        
        // If the next line starts a new main rule (3 digits), save current rule
        if (isNextRuleHeader && nextLine.match(/^\d{3}\.\s+/)) {
          currentRule.content = currentContent.join('\n').trim();
          if (currentRule.content) {
            rules.push(currentRule);
          }
          currentRule = null;
          currentContent = [];
        }
      }
    }
  }
  
  // Don't forget the last rule
  if (currentRule) {
    currentRule.content = currentContent.join('\n').trim();
    if (currentRule.content) {
      rules.push(currentRule);
    }
  }
  
  return rules;
}

function searchRules(rules, query) {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return [];
  
  const results = [];
  
  for (const rule of rules) {
    let relevance = 0;
    const titleLower = rule.title.toLowerCase();
    const contentLower = rule.content.toLowerCase();
    
    // High relevance for title matches
    if (titleLower.includes(searchTerm)) {
      relevance += 10;
    }
    
    // Medium relevance for content matches
    if (contentLower.includes(searchTerm)) {
      relevance += 1;
    }
    
    // Extra relevance for exact word matches
    const wordBoundaryRegex = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (wordBoundaryRegex.test(rule.title)) {
      relevance += 20;
    }
    if (wordBoundaryRegex.test(rule.content)) {
      relevance += 5;
    }
    
    if (relevance > 0) {
      results.push({ ...rule, relevance });
    }
  }
  
  // Sort by relevance and return top 5 results
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
    .map((result) => ({
      id: result.id,
      title: result.title,
      content: result.content
    }));
}

// Test the parsing
const rulesPath = path.join(__dirname, 'RULES.txt');
const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
const rules = parseRules(rulesContent);

console.log(`Parsed ${rules.length} rules`);

// Test search for trample
const trampleResults = searchRules(rules, 'trample');
console.log('\nTrample search results:');
trampleResults.forEach((result, index) => {
  console.log(`${index + 1}. ${result.title}`);
  console.log(`Content preview: ${result.content.substring(0, 100)}...`);
  console.log('---');
});

// Test search for flying
const flyingResults = searchRules(rules, 'flying');
console.log('\nFlying search results:');
flyingResults.forEach((result, index) => {
  console.log(`${index + 1}. ${result.title}`);
  console.log(`Content preview: ${result.content.substring(0, 100)}...`);
  console.log('---');
});
