import os

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if '\ufffd' in content:
                        print(f'Corrupted (FFFD): {filepath}')
            except Exception as e:
                pass
