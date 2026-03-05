interface RuleSection {
  id: string;
  title: string;
  content: string;
}

// Cache for parsed rules to avoid re-parsing
let rulesCache: RuleSection[] | null = null;

function parseRules(content: string): RuleSection[] {
  const lines = content.split('\n');
  const rules: RuleSection[] = [];
  let currentRule: RuleSection | null = null;
  let currentContent: string[] = [];

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

function searchRules(rules: RuleSection[], query: string): { results: RuleSection[], suggestion?: string } {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return { results: [] };
  
  const results: Array<RuleSection & { relevance: number }> = [];
  
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
  
  // Sort by relevance and get top results
  const sortedResults = results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
    .map((result) => ({
      id: result.id,
      title: result.title,
      content: result.content
    }));
  
  // If no results found, try to suggest a similar term
  let suggestion: string | undefined;
  if (sortedResults.length === 0) {
    suggestion = findSuggestion(rules, searchTerm);
  }
  
  return { results: sortedResults, suggestion };
}

// Simple Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function findSuggestion(rules: RuleSection[], searchTerm: string): string | undefined {
  const commonTerms = [
    'trample', 'flying', 'commander', 'hexproof', 'deathtouch', 'vigilance', 
    'lifelink', 'haste', 'first strike', 'double strike', 'reach', 'flash',
    'defender', 'indestructible', 'shroud', 'protection', 'regenerate',
    'counter', 'mana', 'spell', 'permanent', 'creature', 'artifact',
    'enchantment', 'planeswalker', 'instant', 'sorcery', 'land', 'library',
    'graveyard', 'hand', 'battlefield', 'exile', 'stack', 'combat',
    'attack', 'block', 'damage', 'destroy', 'sacrifice', 'discard'
  ];
  
  let bestMatch = '';
  let bestDistance = Infinity;
  
  for (const term of commonTerms) {
    const distance = levenshteinDistance(searchTerm.toLowerCase(), term.toLowerCase());
    // Only suggest if the distance is reasonable (not more than 2 for short words, 3 for longer)
    const maxDistance = term.length <= 5 ? 2 : 3;
    
    if (distance < bestDistance && distance <= maxDistance && distance > 0) {
      bestDistance = distance;
      bestMatch = term;
    }
  }
  
  return bestMatch || undefined;
}

// Load rules from public folder
async function loadRules(): Promise<RuleSection[]> {
  if (rulesCache) {
    return rulesCache;
  }
  
  try {
    const response = await fetch('/rules.txt');
    if (!response.ok) {
      throw new Error('Failed to load rules');
    }
    const content = await response.text();
    rulesCache = parseRules(content);
    return rulesCache;
  } catch (error) {
    console.error('Failed to load rules:', error);
    return [];
  }
}

// Main search function for client-side use
export async function clientSearch(query: string): Promise<{ results: RuleSection[], suggestion?: string }> {
  const rules = await loadRules();
  return searchRules(rules, query);
}

export type { RuleSection };
