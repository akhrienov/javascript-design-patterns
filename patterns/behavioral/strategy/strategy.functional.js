/**
 * Content Formatter Strategy Pattern - Functional Implementation
 *
 * This implementation showcases the Strategy pattern using a functional approach
 * for formatting content in different ways (plain text, HTML, markdown, etc.).
 *
 * Real-world use case: A content management system that needs to publish
 * the same content to different platforms with different formatting requirements.
 */

// Strategy functions
const plainTextFormatter = () => {
  return (content) => {
    // Strip all HTML tags and markdown syntax
    const plainText = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[*_~`#]/g, '') // Remove markdown formatting chars
      .replace(/\n{3,}/g, '\n\n'); // Normalize excessive line breaks

    return plainText;
  };
};

const htmlFormatter = () => {
  return (content) => {
    // Convert markdown-like syntax to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n{2,}/g, '</p><p>') // Paragraphs
      .replace(/^(.+)$/gm, function (match) {
        // Don't wrap existing HTML tags in paragraphs
        return match.startsWith('<') ? match : `<p>${match}</p>`;
      });
  };
};

const markdownFormatter = () => {
  return (content) => {
    // Convert HTML to markdown or enhance existing markdown
    return content
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**') // Bold
      .replace(/<em>(.*?)<\/em>/g, '*$1*') // Italic
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n') // H1
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n') // H2
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n'); // Paragraphs
  };
};

const seoFormatter = (keywords = [], metaDescription = '') => {
  return (content) => {
    // Enhance content with SEO elements
    let seoContent = content;

    // Add meta description
    if (metaDescription) {
      seoContent = `<!-- Meta Description: ${metaDescription} -->\n${seoContent}`;
    }

    // Highlight keywords
    keywords.forEach((keyword) => {
      // Only replace first instance and not within HTML tags
      const regex = new RegExp(`(?<!<[^>]*)\\b(${keyword})\\b(?![^<]*>)`, 'i');
      seoContent = seoContent.replace(regex, '<em>$1</em>');
    });

    // Add semantic structure for heading if not present
    if (!seoContent.includes('<h1>') && !seoContent.includes('# ')) {
      const firstLine = seoContent.split('\n')[0];
      seoContent = seoContent.replace(firstLine, `<h1>${firstLine}</h1>`);
    }

    return seoContent;
  };
};

// Context function
const createContentPublisher = (initialFormatter) => {
  let formatter = initialFormatter;
  let content = '';

  return {
    setContent: (newContent) => {
      content = newContent;
    },

    setFormatter: (newFormatter) => {
      formatter = newFormatter;
    },

    publish: () => {
      if (!formatter) throw new Error('Formatter strategy not set');
      return formatter(content);
    },
  };
};

// Additional advanced strategy with composition
const compositeFormatter = (...formatters) => {
  return (content) => {
    // Apply each formatter in sequence
    return formatters.reduce((formattedContent, formatter) => {
      return formatter(formattedContent);
    }, content);
  };
};

export {
  plainTextFormatter,
  htmlFormatter,
  markdownFormatter,
  seoFormatter,
  compositeFormatter,
  createContentPublisher,
};
