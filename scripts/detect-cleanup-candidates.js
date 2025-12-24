#!/usr/bin/env node

/**
 * Cleanup Candidate Detector
 * Scans the project for files that might be obsolete or temporary
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// Files/folders to skip
const IGNORE_PATTERNS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.agent',
    'scripts',
    'public',
];

// Suspicious file patterns
const SUSPICIOUS_PATTERNS = {
    temp: /temp|tmp|test|old|backup|copy|_old|\.old|\.bak/i,
    utility: /\.py$|\.sh$|\.bat$/,
    singleUse: /cleanup|fix|polish|heal|convert|migrate/i,
};

const results = {
    suspicious: [],
    utilities: [],
    large: [],
};

function shouldIgnore(filePath) {
    return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getFileStats(filePath) {
    try {
        return fs.statSync(filePath);
    } catch {
        return null;
    }
}

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(projectRoot, fullPath);

        if (shouldIgnore(relativePath)) continue;

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (entry.isFile()) {
            analyzeFile(fullPath, relativePath);
        }
    }
}

function analyzeFile(fullPath, relativePath) {
    const stats = getFileStats(fullPath);
    if (!stats) return;

    const fileName = path.basename(fullPath);
    const ext = path.extname(fullPath);
    const size = stats.size;
    const lastModified = stats.mtime;
    const daysSinceModified = Math.floor((Date.now() - lastModified) / (1000 * 60 * 60 * 24));

    // Check for temporary/suspicious names
    if (SUSPICIOUS_PATTERNS.temp.test(fileName)) {
        results.suspicious.push({
            path: relativePath,
            reason: 'Suspicious filename (temp/test/old/backup)',
            modified: `${daysSinceModified} days ago`,
        });
    }

    // Check for utility scripts (Python, shell, etc.)
    if (SUSPICIOUS_PATTERNS.utility.test(fileName)) {
        // Check if it looks like a single-use script
        if (SUSPICIOUS_PATTERNS.singleUse.test(fileName)) {
            results.utilities.push({
                path: relativePath,
                reason: 'Utility script with single-use name',
                modified: `${daysSinceModified} days ago`,
            });
        }
    }

    // Check for large files (>1MB) that might be outdated
    if (size > 1024 * 1024 && daysSinceModified > 30) {
        results.large.push({
            path: relativePath,
            size: `${(size / 1024 / 1024).toFixed(2)} MB`,
            modified: `${daysSinceModified} days ago`,
        });
    }
}

function printResults() {
    console.log('\n🔍 CLEANUP CANDIDATE DETECTOR\n');
    console.log('='.repeat(60));

    if (results.suspicious.length > 0) {
        console.log('\n⚠️  SUSPICIOUS FILES (temp/test/backup patterns):\n');
        results.suspicious.forEach(item => {
            console.log(`   📄 ${item.path}`);
            console.log(`      └─ ${item.reason} (${item.modified})\n`);
        });
    }

    if (results.utilities.length > 0) {
        console.log('\n🔧 UTILITY SCRIPTS (might be one-time use):\n');
        results.utilities.forEach(item => {
            console.log(`   📄 ${item.path}`);
            console.log(`      └─ ${item.reason} (${item.modified})\n`);
        });
    }

    if (results.large.length > 0) {
        console.log('\n💾 LARGE FILES (>1MB, not modified in 30+ days):\n');
        results.large.forEach(item => {
            console.log(`   📄 ${item.path}`);
            console.log(`      └─ ${item.size} (${item.modified})\n`);
        });
    }

    const total = results.suspicious.length + results.utilities.length + results.large.length;

    console.log('='.repeat(60));
    console.log(`\n✅ Scan complete! Found ${total} potential cleanup candidates.\n`);

    if (total === 0) {
        console.log('🎉 Your project is clean! No obvious candidates found.\n');
    } else {
        console.log('📋 Next steps:');
        console.log('   1. Review each file above');
        console.log('   2. Check if they\'re still needed');
        console.log('   3. Delete obsolete files');
        console.log('   4. Update .gitignore if needed\n');
    }
}

// Run the scan
try {
    console.log('Scanning project...');
    scanDirectory(projectRoot);
    printResults();
} catch (error) {
    console.error('Error during scan:', error.message);
    process.exit(1);
}
