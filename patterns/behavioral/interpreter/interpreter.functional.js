/**
 * Simple Template Language Interpreter
 * Functional implementation using the Interpreter Pattern
 */

/**
 * Creates a text expression
 * @param {string} text - The literal text content
 * @returns {Object} A text expression object
 */
const createTextExpression = (text) => ({
  type: 'text',
  content: text,
  interpret: (context) => text,
});

/**
 * Creates a variable expression
 * @param {string} variableName - The name of the variable to substitute
 * @returns {Object} A variable expression object
 */
const createVariableExpression = (variableName) => {
  const name = variableName.trim();

  return {
    type: 'variable',
    name,
    interpret: (context) => {
      // Handle nested properties (user.name, etc.)
      if (name.includes('.')) {
        const parts = name.split('.');
        let value = context;

        for (const part of parts) {
          if (value === undefined || value === null) {
            return '';
          }
          value = value[part];
        }

        return value !== undefined ? value : '';
      }

      // Handle simple variables
      return context[name] !== undefined ? context[name] : '';
    },
  };
};

/**
 * Creates a conditional expression
 * @param {string} condition - The condition to evaluate
 * @param {Object} trueExpression - The expression to interpret if condition is true
 * @param {Object} falseExpression - The expression to interpret if condition is false
 * @returns {Object} A conditional expression object
 */
const createConditionalExpression = (condition, trueExpression, falseExpression = null) => {
  const conditionText = condition.trim();

  return {
    type: 'conditional',
    condition: conditionText,
    trueExpression,
    falseExpression,
    interpret: (context) => {
      // Simple condition evaluation (truthy/falsy check on variable)
      let conditionResult = false;

      // Handle nested properties (user.isAdmin, etc.)
      if (conditionText.includes('.')) {
        const parts = conditionText.split('.');
        let value = context;

        for (const part of parts) {
          if (value === undefined || value === null) {
            value = undefined;
            break;
          }
          value = value[part];
        }

        conditionResult = !!value;
      } else {
        // Simple variable check
        conditionResult = !!context[conditionText];
      }

      // Return the appropriate branch based on condition result
      if (conditionResult) {
        return trueExpression.interpret(context);
      } else if (falseExpression) {
        return falseExpression.interpret(context);
      }
      return '';
    },
  };
};

/**
 * Creates a loop expression
 * @param {string} itemName - The name for each item in the loop
 * @param {string} collectionName - The name of the collection to iterate
 * @param {Object} loopBody - The expression to interpret for each item
 * @returns {Object} A loop expression object
 */
const createLoopExpression = (itemName, collectionName, loopBody) => {
  const item = itemName.trim();
  const collection = collectionName.trim();

  return {
    type: 'loop',
    itemName: item,
    collectionName: collection,
    loopBody,
    interpret: (context) => {
      const items = context[collection] || [];

      if (!Array.isArray(items)) {
        return '';
      }

      let result = '';

      // Create a new context for each iteration
      for (const itemValue of items) {
        const loopContext = { ...context };
        loopContext[item] = itemValue;

        result += loopBody.interpret(loopContext);
      }

      return result;
    },
  };
};

/**
 * Creates a composite expression
 * @param {Array} expressions - Array of expressions to compose
 * @returns {Object} A composite expression object
 */
const createCompositeExpression = (expressions = []) => {
  const expressList = [...expressions];

  return {
    type: 'composite',
    expressions: expressList,
    interpret: (context) => expressList.map((expr) => expr.interpret(context)).join(''),
    addExpression: (expression) => expressList.push(expression),
  };
};

/**
 * Creates a template parser that converts template strings to expression trees
 * @returns {Object} A template parser object
 */
const createTemplateParser = () => {
  /**
   * Extract a block of content from a template, handling proper nesting
   * @param {string} template - The template string
   * @param {number} startPos - The position to start extracting from
   * @param {string} blockType - The type of block ('if' or 'for')
   * @returns {Object|null} The extracted content and end position, or null if not found
   */
  const extractBlock = (template, startPos, blockType) => {
    let pos = startPos;
    let depth = 1; // We're already inside one block
    let elsePos = -1;

    const endTag = `{% end${blockType} %}`;
    const startTag = `{% ${blockType}`;
    const elseTag = '{% else %}';

    while (pos < template.length) {
      const nextStartTag = template.indexOf(startTag, pos);
      const nextEndTag = template.indexOf(endTag, pos);
      const nextElseTag = blockType === 'if' ? template.indexOf(elseTag, pos) : -1;

      // Cannot find matching end tag
      if (nextEndTag === -1) {
        return null;
      }

      // Check if we find an else tag at the current nesting level
      if (
        blockType === 'if' &&
        nextElseTag !== -1 &&
        depth === 1 &&
        (nextStartTag === -1 || nextElseTag < nextStartTag) &&
        (nextEndTag === -1 || nextElseTag < nextEndTag)
      ) {
        elsePos = nextElseTag;
        pos = nextElseTag + 9; // 9 = length of "{% else %}"
        continue;
      }

      // Check if we find another start tag before the end tag
      if (nextStartTag !== -1 && nextStartTag < nextEndTag) {
        depth++;
        pos = nextStartTag + startTag.length;
      } else {
        depth--;
        if (depth === 0) {
          // We've found the matching end tag
          const blockEndPos = nextEndTag + endTag.length;

          if (elsePos !== -1) {
            // If there's an else branch, extract both true and false content
            return {
              content: template.substring(startPos, elsePos),
              elseContent: template.substring(elsePos + 9, nextEndTag),
              end: blockEndPos,
            };
          } else {
            // No else branch, just extract the content
            return {
              content: template.substring(startPos, nextEndTag),
              end: blockEndPos,
            };
          }
        }
        pos = nextEndTag + endTag.length;
      }
    }

    // Could not find matching end tag
    return null;
  };

  // The parser function that converts a template string to an expression tree
  const parse = (template) => {
    let pos = 0;
    const result = createCompositeExpression();

    while (pos < template.length) {
      // Find the next expression start
      const variableStart = template.indexOf('{{', pos);
      const blockStart = template.indexOf('{%', pos);

      // No more expressions, add the rest as text
      if (variableStart === -1 && blockStart === -1) {
        if (pos < template.length) {
          result.addExpression(createTextExpression(template.substring(pos)));
        }
        break;
      }

      // Determine which expression comes first
      let expressionStart;
      let isVariable = false;

      if (variableStart !== -1 && (blockStart === -1 || variableStart < blockStart)) {
        expressionStart = variableStart;
        isVariable = true;
      } else {
        expressionStart = blockStart;
        isVariable = false;
      }

      // Add text before the expression
      if (expressionStart > pos) {
        result.addExpression(createTextExpression(template.substring(pos, expressionStart)));
      }

      // Handle the expression based on its type
      if (isVariable) {
        // Variable expression {{ variable }}
        const variableEnd = template.indexOf('}}', expressionStart);
        if (variableEnd === -1) {
          result.addExpression(createTextExpression(template.substring(expressionStart)));
          break;
        }

        const variableName = template.substring(expressionStart + 2, variableEnd).trim();
        result.addExpression(createVariableExpression(variableName));

        pos = variableEnd + 2;
      } else {
        // Block expression {% ... %}
        const blockEnd = template.indexOf('%}', expressionStart);
        if (blockEnd === -1) {
          result.addExpression(createTextExpression(template.substring(expressionStart)));
          break;
        }

        const blockContent = template.substring(expressionStart + 2, blockEnd).trim();

        if (blockContent.startsWith('if ')) {
          // Conditional block {% if condition %}
          const condition = blockContent.substring(3);
          const ifBody = extractBlock(template, blockEnd + 2, 'if');

          if (!ifBody) {
            // If we can't properly extract the if block, just add the text
            result.addExpression(
              createTextExpression(template.substring(expressionStart, blockEnd + 2))
            );
            pos = blockEnd + 2;
            continue;
          }

          const { content: trueContent, end: ifEnd, elseContent } = ifBody;

          const trueExpr = parse(trueContent);
          const falseExpr = elseContent ? parse(elseContent) : null;

          result.addExpression(createConditionalExpression(condition, trueExpr, falseExpr));

          pos = ifEnd;
        } else if (blockContent.startsWith('for ') && blockContent.includes(' in ')) {
          // Loop block {% for item in items %}
          const forParts = blockContent.substring(4).split(' in ');
          if (forParts.length !== 2) {
            // Invalid for loop syntax, treat as text
            result.addExpression(
              createTextExpression(template.substring(expressionStart, blockEnd + 2))
            );
            pos = blockEnd + 2;
            continue;
          }

          const itemName = forParts[0].trim();
          const collectionName = forParts[1].trim();

          const forBody = extractBlock(template, blockEnd + 2, 'for');

          if (!forBody) {
            // If we can't properly extract the for block, just add the text
            result.addExpression(
              createTextExpression(template.substring(expressionStart, blockEnd + 2))
            );
            pos = blockEnd + 2;
            continue;
          }

          const { content: loopContent, end: forEnd } = forBody;
          const loopExpr = parse(loopContent);

          result.addExpression(createLoopExpression(itemName, collectionName, loopExpr));

          pos = forEnd;
        } else {
          // Unrecognized block, treat as text
          result.addExpression(
            createTextExpression(template.substring(expressionStart, blockEnd + 2))
          );
          pos = blockEnd + 2;
        }
      }
    }

    return result;
  };

  return {
    parse,
  };
};

/**
 * Creates a template engine that interprets templates
 * @returns {Object} A template engine object
 */
const createTemplateEngine = () => {
  const parser = createTemplateParser();

  return {
    /**
     * Render a template with the given data
     * @param {string} template - The template string to render
     * @param {Object} data - The data to use for rendering
     * @returns {string} The rendered template
     */
    render: (template, data = {}) => {
      const expression = parser.parse(template);
      return expression.interpret(data);
    },
  };
};

export {
  // Expression factory functions
  createTextExpression,
  createVariableExpression,
  createConditionalExpression,
  createLoopExpression,
  createCompositeExpression,

  // Parser and engine factory functions
  createTemplateParser,
  createTemplateEngine,
};
