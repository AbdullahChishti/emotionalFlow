#!/usr/bin/env python3
"""
Replace hardcoded blue colors with CSS variables in all TSX files.
"""

import os
import re
from pathlib import Path

# Color mappings
REPLACEMENTS = [
    # Tailwind classes
    (r'text-\[#0071E3\]', 'text-[var(--color-primary)]'),
    (r'bg-\[#0071E3\]', 'bg-[var(--color-primary)]'),
    (r'border-\[#0071E3\]', 'border-[var(--color-primary)]'),
    (r'ring-\[#0071E3\]', 'ring-[var(--color-primary)]'),
    (r'hover:bg-\[#0077ED\]', 'hover:bg-[var(--color-primary-light)]'),
    (r'hover:text-\[#0077ED\]', 'hover:text-[var(--color-primary-light)]'),
    
    # Inline styles and JS
    (r"'#0071E3'", "'var(--color-primary)'"),
    (r'"#0071E3"', '"var(--color-primary)"'),
    (r"'#005BB5'", "'var(--color-primary-dark)'"),
    (r'"#005BB5"', '"var(--color-primary-dark)"'),
    (r"'#0066CC'", "'var(--color-primary-gradient-mid)'"),
    (r'"#0066CC"', '"var(--color-primary-gradient-mid)"'),
    (r"'#0077ED'", "'var(--color-primary-light)'"),
    (r'"#0077ED"', '"var(--color-primary-light)"'),
    
    # Gradients in linear-gradient
    (r'linear-gradient\(135deg, #0071E3 0%, #0066CC 50%, #005BB5 100%\)',
     'var(--gradient-primary)'),
]

def replace_colors_in_file(filepath):
    """Replace colors in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for pattern, replacement in REPLACEMENTS:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function to process all TSX files."""
    src_dir = Path('src/components')
    modified_files = []
    
    for tsx_file in src_dir.rglob('*.tsx'):
        if replace_colors_in_file(tsx_file):
            modified_files.append(str(tsx_file))
            print(f"✓ Modified: {tsx_file}")
    
    print(f"\n✅ Modified {len(modified_files)} files")
    
    if modified_files:
        print("\nModified files:")
        for f in modified_files:
            print(f"  - {f}")

if __name__ == '__main__':
    main()
