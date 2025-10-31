import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const root = process.cwd();
const appDir = path.join(root, 'app');
const pagesDir = path.join(root, 'pages');

const exts = ['ts', 'tsx', 'js', 'jsx'];

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function findPagesIndexFiles() {
  if (!exists(pagesDir)) return [];
  return exts
    .map(ext => path.join(pagesDir, `index.${ext}`))
    .filter(p => exists(p));
}

// Only root-level App Router pages that resolve to "/"
function findAppRootPages() {
  if (!exists(appDir)) return [];
  const matches = [];

  // app/page.*
  for (const ext of exts) {
    const p = path.join(appDir, `page.${ext}`);
    if (exists(p)) matches.push(p);
  }

  // app/(group)/page.*
  const entries = fs.readdirSync(appDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && /^\(.*\)$/.test(e.name)) {
      for (const ext of exts) {
        const p = path.join(appDir, e.name, `page.${ext}`);
        if (exists(p)) matches.push(p);
      }
    }
  }

  return matches;
}

async function removeAppRouterKeepPages() {
  if (!exists(appDir)) return;
  const disabled = path.join(root, 'app.disabled');
  if (exists(disabled)) {
    console.log('app.disabled already exists, skipping rename.');
    return;
  }
  await fsp.rename(appDir, disabled);
  console.log(`Renamed "app" -> "app.disabled" to keep Pages Router.`);
}

async function removePagesIndexKeepApp() {
  const files = findPagesIndexFiles();
  if (files.length === 0) return;
  for (const f of files) {
    await fsp.rm(f);
    console.log(`Deleted ${path.relative(root, f)}`);
  }
}

function printStatus() {
  const appRootPages = findAppRootPages();
  const pagesIndex = findPagesIndexFiles();
  console.log('App root pages:', appRootPages.map(p => path.relative(root, p)));
  console.log('Pages index files:', pagesIndex.map(p => path.relative(root, p)));
  if (appRootPages.length && pagesIndex.length) {
    console.log('\nConflict: both App Router and Pages Router match "/".');
    process.exitCode = 1;
  } else {
    console.log('\nNo conflict detected.');
  }
}

async function main() {
  const args = new Map(
    process.argv.slice(2).flatMap(a => {
      const [k, v] = a.startsWith('--') ? a.slice(2).split('=') : [a, true];
      return [[k, v ?? true]];
    })
  );

  if (args.has('help') || args.has('h')) {
    console.log(`Usage:
  node scripts/router-clean.mjs --check
  node scripts/router-clean.mjs --fix --keep=pages   # recommended
  node scripts/router-clean.mjs --fix --keep=app`);
    return;
  }

  if (args.has('check')) {
    printStatus();
    return;
  }

  if (args.has('fix')) {
    const keep = (args.get('keep') || 'pages').toString();
    const appRootPages = findAppRootPages();
    const pagesIndex = findPagesIndexFiles();

    if (!(appRootPages.length && pagesIndex.length)) {
      console.log('No conflict to fix.');
      return;
    }

    if (keep === 'pages') {
      await removeAppRouterKeepPages();
    } else if (keep === 'app') {
      await removePagesIndexKeepApp();
    } else {
      console.error('Invalid --keep value. Use "pages" or "app".');
      process.exit(1);
    }

    console.log('Done. Now clear cache: rm -rf .next && npm run dev');
    return;
  }

  // Default: check
  printStatus();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
