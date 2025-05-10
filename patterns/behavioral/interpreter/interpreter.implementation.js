/**
 * Simple Template Language Interpreter
 * Class-based implementation using the Interpreter Pattern
 */

// Abstract Expression - Base class for all expressions
class Expression {
  interpret(context) {
    throw new Error('Abstract method: Must be implemented by subclasses');
  }
}

// Terminal Expression for Text content
class TextExpression extends Expression {
  constructor(text) {
    super();
    this.text = text;
  }

  interpret(context) {
    return this.text;
  }
}

// Terminal Expression for Variable substitution {{ variable }}
class VariableExpression extends Expression {
  constructor(variableName) {
    super();
    this.variableName = variableName.trim();
  }

  interpret(context) {
    // Handle nested properties (user.name, etc.)
    if (this.variableName.includes('.')) {
      const parts = this.variableName.split('.');
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
    return context[this.variableName] !== undefined ? context[this.variableName] : '';
  }
}

// Non-terminal Expression for Conditional blocks {% if condition %}...{% else %}...{% endif %}
class ConditionalExpression extends Expression {
  constructor(condition, trueExpression, falseExpression = null) {
    super();
    this.condition = condition.trim();
    this.trueExpression = trueExpression;
    this.falseExpression = falseExpression;
  }

  interpret(context) {
    // Simple condition evaluation (truthy/falsy check on variable)
    let conditionResult = false;

    // Handle nested properties (user.isAdmin, etc.)
    if (this.condition.includes('.')) {
      const parts = this.condition.split('.');
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
      conditionResult = !!context[this.condition];
    }

    // Return the appropriate branch based on condition result
    if (conditionResult) {
      return this.trueExpression.interpret(context);
    } else if (this.falseExpression) {
      return this.falseExpression.interpret(context);
    }
    return '';
  }
}

// Non-terminal Expression for Loop blocks {% for item in items %}...{% endfor %}
class LoopExpression extends Expression {
  constructor(itemName, collectionName, loopBody) {
    super();
    this.itemName = itemName.trim();
    this.collectionName = collectionName.trim();
    this.loopBody = loopBody;
  }

  interpret(context) {
    const collection = context[this.collectionName] || [];

    if (!Array.isArray(collection)) {
      return '';
    }

    let result = '';

    // Create a new context for each iteration
    for (const item of collection) {
      const loopContext = { ...context };
      loopContext[this.itemName] = item;

      result += this.loopBody.interpret(loopContext);
    }

    return result;
  }
}

// Non-terminal Expression for Composite expressions (sequence of expressions)
class CompositeExpression extends Expression {
  constructor(expressions = []) {
    super();
    this.expressions = expressions;
  }

  interpret(context) {
    return this.expressions.map((expr) => expr.interpret(context)).join('');
  }

  addExpression(expression) {
    this.expressions.push(expression);
  }
}

// TemplateParser for building the syntax tree from template strings
class TemplateParser {
  parse(template) {
    let pos = 0;
    const result = new CompositeExpression();

    while (pos < template.length) {
      // Find the next expression start
      const variableStart = template.indexOf('{{', pos);
      const blockStart = template.indexOf('{%', pos);

      // No more expressions, add the rest as text
      if (variableStart === -1 && blockStart === -1) {
        if (pos < template.length) {
          result.addExpression(new TextExpression(template.substring(pos)));
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
        result.addExpression(new TextExpression(template.substring(pos, expressionStart)));
      }

      // Handle the expression based on its type
      if (isVariable) {
        // Variable expression {{ variable }}
        const variableEnd = template.indexOf('}}', expressionStart);
        if (variableEnd === -1) {
          result.addExpression(new TextExpression(template.substring(expressionStart)));
          break;
        }

        const variableName = template.substring(expressionStart + 2, variableEnd).trim();
        result.addExpression(new VariableExpression(variableName));

        pos = variableEnd + 2;
      } else {
        // Block expression {% ... %}
        const blockEnd = template.indexOf('%}', expressionStart);
        if (blockEnd === -1) {
          result.addExpression(new TextExpression(template.substring(expressionStart)));
          break;
        }

        const blockContent = template.substring(expressionStart + 2, blockEnd).trim();

        if (blockContent.startsWith('if ')) {
          // Conditional block {% if condition %}
          const condition = blockContent.substring(3);
          const ifBody = this.extractBlock(template, blockEnd + 2, 'if');

          if (!ifBody) {
            // If we can't properly extract the if block, just add the text
            result.addExpression(
              new TextExpression(template.substring(expressionStart, blockEnd + 2))
            );
            pos = blockEnd + 2;
            continue;
          }

          const { content: trueContent, end: ifEnd, elseContent } = ifBody;

          const trueExpr = this.parse(trueContent);
          const falseExpr = elseContent ? this.parse(elseContent) : null;

          result.addExpression(new ConditionalExpression(condition, trueExpr, falseExpr));

          pos = ifEnd;
        } else if (blockContent.startsWith('for ') && blockContent.includes(' in ')) {
          // Loop block {% for item in items %}
          const forParts = blockContent.substring(4).split(' in ');
          if (forParts.length !== 2) {
            // Invalid for loop syntax, treat as text
            result.addExpression(
              new TextExpression(template.substring(expressionStart, blockEnd + 2))
            );
            pos = blockEnd + 2;
            continue;
          }

          const itemName = forParts[0].trim();
          const collectionName = forParts[1].trim();

          const forBody = this.extractBlock(template, blockEnd + 2, 'for');

          if (!forBody) {
            // If we can't properly extract the for block, just add the text
            result.addExpression(
              new TextExpression(template.substring(expressionStart, blockEnd + 2))
            );
            pos = blockEnd + 2;
            continue;
          }

          const { content: loopContent, end: forEnd } = forBody;
          const loopExpr = this.parse(loopContent);

          result.addExpression(new LoopExpression(itemName, collectionName, loopExpr));

          pos = forEnd;
        } else {
          // Unrecognized block, treat as text
          result.addExpression(
            new TextExpression(template.substring(expressionStart, blockEnd + 2))
          );
          pos = blockEnd + 2;
        }
      }
    }

    return result;
  }

  /**
   * Extract a block of content from a template, handling proper nesting
   * @param {string} template - The template string
   * @param {number} startPos - The position to start extracting from
   * @param {string} blockType - The type of block ('if' or 'for')
   * @returns {Object|null} The extracted content and end position, or null if not found
   */
  extractBlock(template, startPos, blockType) {
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
  }
}

// Template Engine - The interpreter client
class TemplateEngine {
  constructor() {
    this.parser = new TemplateParser();
  }

  /**
   * Render a template with the given data
   * @param {string} template - The template string to render
   * @param {Object} data - The data to use for rendering
   * @returns {string} The rendered template
   */
  render(template, data = {}) {
    const expression = this.parser.parse(template);
    return expression.interpret(data);
  }
}

export {
  // Core interpreter classes
  Expression,
  TextExpression,
  VariableExpression,
  ConditionalExpression,
  LoopExpression,
  CompositeExpression,

  // Parser and engine
  TemplateParser,
  TemplateEngine,
};
