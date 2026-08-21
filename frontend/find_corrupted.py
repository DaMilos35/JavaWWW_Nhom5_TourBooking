import os

mojibake_patterns = ['A', 'A?', '', 'ngAy', 'gi? hAng', '?t Ngay', 'Tour Du L<ch']

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    for pattern in mojibake_patterns:
                        if pattern in content:
                            print(f'Corrupted: {filepath}')
                            break
            except Exception as e:
                pass
