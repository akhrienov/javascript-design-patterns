import { describe, it, expect, beforeEach } from 'vitest';

import {
  plainTextFormatter,
  htmlFormatter,
  markdownFormatter,
  seoFormatter,
  createContentPublisher,
} from './strategy.functional';
import {
  CSVExportStrategy,
  JSONExportStrategy,
  XMLExportStrategy,
  SQLExportStrategy,
  DataExporter,
  ExportStrategyFactory,
} from './strategy.implementation';

// Sample test data
const sampleContent = `
Welcome to our **Strategy Pattern** tutorial.

This is a *design pattern* that allows you to define a family of algorithms,
encapsulate each one, and make them interchangeable at runtime.
`;

const analyticsData = [
  {
    date: '2023-01-01',
    pageViews: 1250,
    uniqueVisitors: 864,
  },
  {
    date: '2023-01-02',
    pageViews: 1315,
    uniqueVisitors: 954,
  },
];

// ====================================
// Tests for Class-based Implementation
// ====================================
describe('Data Export Strategy Implementation', () => {
  let exporter;

  beforeEach(() => {
    exporter = new DataExporter(new CSVExportStrategy());
    exporter.setData(analyticsData);
  });

  it('should export data as CSV', () => {
    const result = exporter.export();

    expect(result).toContain('date,pageViews,uniqueVisitors');
    expect(result).toContain('2023-01-01,1250,864');
    expect(result).toContain('2023-01-02,1315,954');
  });

  it('should export data as JSON', () => {
    exporter.setStrategy(new JSONExportStrategy());
    const result = exporter.export();
    const parsed = JSON.parse(result);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].date).toBe('2023-01-01');
    expect(parsed[0].pageViews).toBe(1250);
  });

  it('should export data as pretty JSON', () => {
    exporter.setStrategy(new JSONExportStrategy());

    const result = exporter.export({ pretty: true });

    expect(result).toContain('{\n');
    expect(result).toContain('  "date": ');
  });

  it('should export data as XML', () => {
    exporter.setStrategy(new XMLExportStrategy());

    const result = exporter.export();

    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<data>');
    expect(result).toContain('<item>');
    expect(result).toContain('<date>2023-01-01</date>');
  });

  it('should export data as custom XML', () => {
    exporter.setStrategy(new XMLExportStrategy());

    const result = exporter.export({
      rootElement: 'analytics',
      itemElement: 'day',
    });

    expect(result).toContain('<analytics>');
    expect(result).toContain('<day>');
  });

  it('should export data as SQL', () => {
    exporter.setStrategy(new SQLExportStrategy());

    const result = exporter.export({ tableName: 'analytics' });

    expect(result).toContain('CREATE TABLE analytics');
    expect(result).toContain('INSERT INTO analytics');
    expect(result).toContain('date VARCHAR(255)');
    expect(result).toContain('pageViews INTEGER');
  });

  it('should export data as SQL with custom options', () => {
    exporter.setStrategy(new SQLExportStrategy());

    const result = exporter.export({
      tableName: 'website_stats',
      dropTable: true,
      createTable: true,
    });

    expect(result).toContain('DROP TABLE IF EXISTS website_stats');
    expect(result).toContain('CREATE TABLE website_stats');
  });

  it('should use the factory to create strategies', () => {
    // Test CSV strategy creation
    const csvStrategy = ExportStrategyFactory.createStrategy('csv');
    expect(csvStrategy).toBeInstanceOf(CSVExportStrategy);

    // Test JSON strategy creation
    const jsonStrategy = ExportStrategyFactory.createStrategy('json');
    expect(jsonStrategy).toBeInstanceOf(JSONExportStrategy);

    // Test XML strategy creation
    const xmlStrategy = ExportStrategyFactory.createStrategy('xml');
    expect(xmlStrategy).toBeInstanceOf(XMLExportStrategy);

    // Test SQL strategy creation
    const sqlStrategy = ExportStrategyFactory.createStrategy('sql');
    expect(sqlStrategy).toBeInstanceOf(SQLExportStrategy);
  });

  it('should throw for unsupported export format', () => {
    expect(() => {
      ExportStrategyFactory.createStrategy('pdf'); // Not implemented
    }).toThrow('Unsupported export format: pdf');
  });
});

// ====================================
// Tests for Functional Implementation
// ====================================
describe('Functional Strategy Pattern', () => {
  let publisher;

  beforeEach(() => {
    publisher = createContentPublisher(plainTextFormatter());
    publisher.setContent(sampleContent);
  });

  it('should format content as plain text', () => {
    const result = publisher.publish();

    expect(result).not.toContain('**');
    expect(result).not.toContain('*');
    expect(result).toContain('Strategy Pattern');
    expect(result).toContain('design pattern');
  });

  it('should format content as HTML', () => {
    publisher.setFormatter(htmlFormatter());
    const result = publisher.publish();

    expect(result).toContain('<strong>Strategy Pattern</strong>');
    expect(result).toContain('<em>design pattern</em>');
    expect(result).toContain('<p>');
  });

  it('should format content as Markdown', () => {
    publisher.setFormatter(markdownFormatter());
    const result = publisher.publish();

    expect(result).toContain('**Strategy Pattern**');
    expect(result).toContain('*design pattern*');
  });

  it('should enhance content with SEO features', () => {
    publisher.setFormatter(seoFormatter(['Strategy Pattern'], 'Learn about strategies'));
    const result = publisher.publish();

    expect(result).toContain('<!-- Meta Description: Learn about strategies -->');
    expect(result).toContain('<em>Strategy Pattern</em>');
    expect(result).toContain('<h1>');
  });

  it('should throw an error when formatter is not set', () => {
    const emptyPublisher = createContentPublisher();
    emptyPublisher.setContent(sampleContent);

    expect(() => emptyPublisher.publish()).toThrow('Formatter strategy not set');
  });
});
