#!/usr/bin/env python3
"""Test image file accessibility"""

import os
import json
from pathlib import Path

# List all webp files in the project folder
project_dir = Path('client/public/images/Project')
all_files = sorted(project_dir.glob('*.webp'))

# Projects with issues
problem_projects = ['00A-0130', '00A-0134', '00A-0140', '00A-0152', '00A-0157']

print("=" * 80)
print("IMAGE FILE ACCESSIBILITY TEST")
print("=" * 80)

for proj_id in problem_projects:
    files = [f.name for f in all_files if f.name.startswith(proj_id)]
    print(f"\n{proj_id}:")
    print(f"  Found {len(files)} files:")
    for f in files:
        size_kb = (project_dir / f).stat().st_size / 1024
        print(f"    ✓ {f} ({size_kb:.1f} KB)")

# Check for files with spaces (special handling needed)
print("\n" + "=" * 80)
print("FILES WITH SPACES (may need special handling):")
print("=" * 80)

for proj_id in problem_projects:
    files = [f.name for f in all_files if f.name.startswith(proj_id) and ' ' in f.name]
    if files:
        print(f"\n{proj_id}:")
        for f in files:
            print(f"  ⚠️  {f}")
    
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total .webp files: {len(all_files)}")
print(f"Files with spaces: {sum(1 for f in all_files if ' ' in f.name)}")
print(f"Projects analyzed: {len(problem_projects)}")
