/**
 * Real-World Implementation of the Strategy Pattern
 *
 * This file demonstrates a practical implementation of the Strategy pattern
 * for data export functionality in an analytics dashboard.
 *
 * Use case: An enterprise analytics dashboard that needs to export data
 * in different formats (CSV, JSON, Excel, PDF) for various business needs.
 */

// Base strategy interface
class DataExportStrategy {
  export(data, options = {}) {
    throw new Error('export() method must be implemented by concrete strategies');
  }
}

// CSV Export Strategy
class CSVExportStrategy extends DataExportStrategy {
  export(data, options = {}) {
    const { delimiter = ',', includeHeaders = true } = options;

    if (!Array.isArray(data) || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    let csv = '';

    // Add headers
    if (includeHeaders) csv += headers.join(delimiter) + '\n';

    // Add rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];

        // Handle values with delimiters, quotes, or newlines
        if (value === null || value === undefined) {
          return '';
        } else if (
          typeof value === 'string' &&
          (value.includes(delimiter) || value.includes('"') || value.includes('\n'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return String(value);
        }
      });

      csv += values.join(delimiter) + '\n';
    });

    return csv;
  }
}

// JSON Export Strategy
class JSONExportStrategy extends DataExportStrategy {
  export(data, options = {}) {
    const { pretty = false, replacer = null } = options;

    if (pretty) return JSON.stringify(data, replacer, 2);
    else return JSON.stringify(data, replacer);
  }
}

// XML Export Strategy
class XMLExportStrategy extends DataExportStrategy {
  export(data, options = {}) {
    const { rootElement = 'data', itemElement = 'item' } = options;

    if (!Array.isArray(data) || data.length === 0) {
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}></${rootElement}>`;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;

    // Convert each item to XML
    data.forEach((item) => {
      xml += `  <${itemElement}>\n`;

      Object.entries(item).forEach(([key, value]) => {
        const safeValue = this._escapeXml(String(value ?? ''));
        xml += `    <${key}>${safeValue}</${key}>\n`;
      });

      xml += `  </${itemElement}>\n`;
    });

    xml += `</${rootElement}>`;

    return xml;
  }

  _escapeXml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// SQL Export Strategy (generates SQL INSERT statements)
class SQLExportStrategy extends DataExportStrategy {
  export(data, options = {}) {
    const { tableName = 'data', dropTable = false, createTable = true } = options;

    if (!Array.isArray(data) || data.length === 0) return '';

    const columns = Object.keys(data[0]);
    let sql = '';

    // Add DROP TABLE statement if requested
    if (dropTable) sql += `DROP TABLE IF EXISTS ${tableName};\n\n`;

    // Add CREATE TABLE statement if requested
    if (createTable) {
      sql += `CREATE TABLE ${tableName} (\n`;

      // Infer column types from first row
      const columnDefinitions = columns.map((column) => {
        const sampleValue = data[0][column];
        let type = 'VARCHAR(255)';

        if (typeof sampleValue === 'number') {
          if (Number.isInteger(sampleValue)) {
            type = 'INTEGER';
          } else {
            type = 'FLOAT';
          }
        } else if (typeof sampleValue === 'boolean') {
          type = 'BOOLEAN';
        } else if (sampleValue instanceof Date) {
          type = 'DATETIME';
        }

        return `  ${column} ${type}`;
      });

      sql += columnDefinitions.join(',\n');
      sql += '\n);\n\n';
    }

    // Add INSERT statements
    data.forEach((row) => {
      const values = columns.map((column) => {
        const value = row[column];

        if (value === null || value === undefined) {
          return 'NULL';
        } else if (typeof value === 'string') {
          return `'${value.replace(/'/g, "''")}'`;
        } else if (value instanceof Date) {
          return `'${value.toISOString()}'`;
        } else {
          return String(value);
        }
      });

      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
    });

    return sql;
  }
}

// Context class for data export
class DataExporter {
  constructor(strategy) {
    this.strategy = strategy;
    this.data = [];
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  setData(data) {
    this.data = data;
  }

  export(options = {}) {
    if (!this.strategy) throw new Error('Export strategy not set');
    if (!this.data || this.data.length === 0) return '';

    return this.strategy.export(this.data, options);
  }
}

// Factory to create export strategies
class ExportStrategyFactory {
  static createStrategy(format, options = {}) {
    switch (format.toLowerCase()) {
      case 'csv':
        return new CSVExportStrategy();
      case 'json':
        return new JSONExportStrategy();
      case 'xml':
        return new XMLExportStrategy();
      case 'sql':
        return new SQLExportStrategy();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}

export {
  DataExportStrategy,
  CSVExportStrategy,
  JSONExportStrategy,
  XMLExportStrategy,
  SQLExportStrategy,
  DataExporter,
  ExportStrategyFactory,
};
