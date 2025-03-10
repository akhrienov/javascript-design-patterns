/**
 * Composite Pattern Demo - Main Entry Point
 *
 * This file demonstrates how to use both the class-based and functional
 * implementations of the Composite Pattern.
 */

import { demonstrateCMS, demonstrateUIComponents } from './composite.example.js';

/**
 * Run a complete demonstration of the Composite Pattern
 */
function runDemo() {
  console.log('===============================================');
  console.log('   COMPOSITE PATTERN IMPLEMENTATION EXAMPLES   ');
  console.log('===============================================\n');

  // Demonstrate the class-based CMS example
  const cmsRoot = demonstrateCMS();

  console.log('\n-----------------------------------------------\n');

  // Demonstrate the functional UI component example
  const uiRoot = demonstrateUIComponents();

  console.log('\n===============================================');
  console.log('              DEMO COMPLETED                  ');
  console.log('===============================================\n');

  return { cmsRoot, uiRoot };
}

runDemo();
