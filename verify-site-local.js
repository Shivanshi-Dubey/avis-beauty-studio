const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, 'avi-beauty-studio');
const SKIP_PREFIXES = ['http://', 'https://', 'tel:', 'mailto:', 'javascript:', 'data:'];

function shouldSkipHref(href) {
  if (!href || href.trim() === '') return true;
  const h = href.trim();
  if (h === '#' || h.startsWith('#')) return true;
  if (h.includes('${')) return true;
  for (const p of SKIP_PREFIXES) if (h.toLowerCase().startsWith(p)) return true;
  return false;
}

function resolveHref(fromFile, href) {
  const h = href.split('#')[0].split('?')[0].trim();
  if (!h) return null;
  if (h.startsWith('/')) return path.join(SITE_DIR, h.replace(/^\/+/, ''));
  return path.normalize(path.join(path.dirname(fromFile), h));
}

function extractHrefs(html) {
  const hrefs = [];
  const re = /href\s*=\s*(["'])(.*?)\1/gi;
  let m;
  while ((m = re.exec(html))) hrefs.push(m[2]);
  return hrefs;
}

const results = { passed: [], failed: [] };

const htmlFiles = fs.readdirSync(SITE_DIR).filter(f => f.endsWith('.html'));
results.passed.push({ check: 'html_file_list', detail: htmlFiles });

const brokenLinks = [];
const badServicesRefs = [];

for (const file of htmlFiles) {
  const full = path.join(SITE_DIR, file);
  const content = fs.readFileSync(full, 'utf8');
  for (const href of extractHrefs(content)) {
    if (href.includes('services.html') && file !== 'services.html') {
      badServicesRefs.push({ file, href });
    }
    if (shouldSkipHref(href)) continue;
    const resolved = resolveHref(full, href);
    if (!resolved) continue;
    if (!fs.existsSync(resolved)) brokenLinks.push({ file, href, resolved });
  }
}

if (badServicesRefs.length === 0) {
  results.passed.push({ check: 'no_broken_services_html_links', detail: 'ok' });
} else {
  results.failed.push({ check: 'no_broken_services_html_links', detail: badServicesRefs });
}

if (brokenLinks.length === 0) {
  results.passed.push({ check: 'internal_href_targets_exist', detail: 'ok' });
} else {
  results.failed.push({ check: 'internal_href_targets_exist', detail: brokenLinks });
}

const serviceContent = fs.readFileSync(path.join(SITE_DIR, 'service.html'), 'utf8');
for (const token of ['page-hero', 'gender-filter', 'toggleCategory', 'applyGenderFilter', 'openModal']) {
  if (serviceContent.includes(token)) {
    results.passed.push({ check: 'service_html_' + token, detail: 'present' });
  } else {
    results.failed.push({ check: 'service_html_' + token, detail: 'missing' });
  }
}

const out = { ok: results.failed.length === 0, htmlFiles, results };
console.log(JSON.stringify(out, null, 2));
process.exit(results.failed.length ? 1 : 0);


