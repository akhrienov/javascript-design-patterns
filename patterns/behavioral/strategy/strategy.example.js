import { DataExporter, ExportStrategyFactory } from './strategy.implementation.js';
import {
  createContentPublisher,
  plainTextFormatter,
  htmlFormatter,
  markdownFormatter,
  seoFormatter,
  compositeFormatter,
} from './strategy.functional.js';

function demoDataExportStrategies() {
  // Sample analytics data
  const analyticsData = [
    {
      date: '2023-01-01',
      pageViews: 1250,
      uniqueVisitors: 864,
      bounceRate: 0.42,
      avgSessionDuration: 125.5,
    },
    {
      date: '2023-01-02',
      pageViews: 1315,
      uniqueVisitors: 954,
      bounceRate: 0.39,
      avgSessionDuration: 138.2,
    },
    {
      date: '2023-01-03',
      pageViews: 1428,
      uniqueVisitors: 1024,
      bounceRate: 0.36,
      avgSessionDuration: 145.7,
    },
  ];

  // Create exporter with initial strategy
  const exporter = new DataExporter(ExportStrategyFactory.createStrategy('csv'));

  // Set data
  exporter.setData(analyticsData);

  // Export as CSV
  console.log('CSV EXPORT:');
  console.log(exporter.export({ delimiter: ',' }));
  console.log('-----------------------');

  // Change strategy to JSON and export
  exporter.setStrategy(ExportStrategyFactory.createStrategy('json'));
  console.log('JSON EXPORT:');
  console.log(exporter.export({ pretty: true }));
  console.log('-----------------------');

  // Change to XML strategy and export
  exporter.setStrategy(ExportStrategyFactory.createStrategy('xml'));
  console.log('XML EXPORT:');
  console.log(exporter.export({ rootElement: 'analytics', itemElement: 'day' }));
  console.log('-----------------------');

  // Change to SQL strategy and export
  exporter.setStrategy(ExportStrategyFactory.createStrategy('sql'));
  console.log('SQL EXPORT:');
  console.log(exporter.export({ tableName: 'website_analytics', createTable: true }));
}

function demoFunctionalStrategyPattern() {
  const content = `
Welcome to our **Strategy Pattern** tutorial.

This is a *design pattern* that allows you to define a family of algorithms,
encapsulate each one, and make them interchangeable at runtime.

Key benefits:
- Flexibility
- Maintainability
- Testability
  `;

  // Create the context with an initial strategy
  const publisher = createContentPublisher(plainTextFormatter());
  publisher.setContent(content);

  // Publish with current (plain text) strategy
  console.log('PLAIN TEXT OUTPUT:');
  console.log(publisher.publish());
  console.log('-----------------------');

  // Change strategy to HTML and publish again
  publisher.setFormatter(htmlFormatter());
  console.log('HTML OUTPUT:');
  console.log(publisher.publish());
  console.log('-----------------------');

  // Change strategy to Markdown and publish again
  publisher.setFormatter(markdownFormatter());
  console.log('MARKDOWN OUTPUT:');
  console.log(publisher.publish());
  console.log('-----------------------');

  // Change strategy to SEO-enhanced and publish again
  publisher.setFormatter(
    seoFormatter(
      ['Strategy Pattern', 'design pattern'],
      'Learn about the Strategy Pattern for flexible algorithm selection'
    )
  );
  console.log('SEO-ENHANCED OUTPUT:');
  console.log(publisher.publish());
  console.log('-----------------------');

  // Use composite formatter (combine multiple strategies)
  const enhancedFormatter = compositeFormatter(
    htmlFormatter(),
    seoFormatter(['composite', 'strategy'], 'Enhanced with multiple strategies')
  );

  publisher.setFormatter(enhancedFormatter);
  console.log('COMPOSITE STRATEGY OUTPUT:');
  console.log(publisher.publish());
}

demoDataExportStrategies();
demoFunctionalStrategyPattern();
