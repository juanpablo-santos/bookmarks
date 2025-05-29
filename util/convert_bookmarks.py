import json
import re
from html import unescape

# Input and output file paths
HTML_FILE = 'bookmarks.html'
JSON_FILE = 'bookmarks_converted.json'

# Regex to match bookmark entries (now also captures ADD_DATE)
BOOKMARK_RE = re.compile(r'<A HREF="([^"]+)"[^>]*ADD_DATE="(\d+)"[^>]*TAGS="([^"]*)"[^>]*>(.*?)</A>', re.IGNORECASE)

def parse_bookmarks(html_path):
    bookmarks = []
    with open(html_path, encoding='utf-8') as f:
        html = f.read()
        for match in BOOKMARK_RE.finditer(html):
            url = unescape(match.group(1))
            add_date = int(match.group(2))
            tags = [t.strip() for t in match.group(3).split(',') if t.strip()]
            title = unescape(match.group(4))
            bookmarks.append({
                'url': url,
                'title': title,
                'tags': tags,
                '_add_date': add_date  # temp field for sorting
            })
    return bookmarks

def main():
    bookmarks = parse_bookmarks(HTML_FILE)
    # Sort by _add_date
    bookmarks.sort(key=lambda b: b['_add_date'])
    # Remove _add_date from output
    for b in bookmarks:
        b.pop('_add_date', None)
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump({'bookmarks': bookmarks}, f, ensure_ascii=False, indent=2)
    print(f"Converted {len(bookmarks)} bookmarks to {JSON_FILE} (sorted by ADD_DATE)")

if __name__ == '__main__':
    main() 