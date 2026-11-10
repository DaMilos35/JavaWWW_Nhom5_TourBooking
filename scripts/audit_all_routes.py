import glob
import re

routes_in_app = set()
with open('src/App.jsx', encoding='utf-8') as f:
    for line in f:
        m = re.search(r'path="([^"]+)"', line)
        if m and m.group(1) != '*':
            routes_in_app.add(m.group(1))

print("=== ROUTES IN APP.JSX ===")
for r in sorted(routes_in_app):
    print("  ", r)

link_targets = set()
for path in glob.glob('src/**/*.jsx', recursive=True):
    with open(path, encoding='utf-8') as f:
        text = f.read()
        for m in re.finditer(r'to=[\'"](/[^\'"]*)[\'"]', text):
            link_targets.add((m.group(1), path))
        for m in re.finditer(r'navigate\([\'"](/[^\'"]*)[\'"]', text):
            link_targets.add((m.group(1), path))

print("\n=== AUDITING ALL LINK & NAVIGATE TARGETS ===")
dead_links = []
for target, file_path in sorted(link_targets):
    base_target = target.split('?')[0]
    matched = False
    for r in routes_in_app:
        pattern = '^' + re.sub(r':[^/]+', '[^/]+', r) + '$'
        if re.match(pattern, base_target):
            matched = True
            break
        # handle admin subroutes
        if not r.startswith('/'):
            admin_pattern = '^/admin/' + re.sub(r':[^/]+', '[^/]+', r) + '$'
            if re.match(admin_pattern, base_target):
                matched = True
                break
    if not matched:
        dead_links.append((target, file_path))
        print(f"  [POTENTIAL DEAD LINK] '{target}' in {file_path}")
    else:
        print(f"  [OK] '{target}'")

print(f"\nTotal potential dead links found: {len(dead_links)}")
