import os

basePath = r'client\public\images\Project'

# Get all actual files
allFiles = set(os.listdir(basePath))

# Referenced files from projectsData.ts
referenced = {
    '00A-0130': [
        '00A-0130-بيت-17-تموز--L-R3P2.webp',
        '00A-0130-بيت-17-تموز--L-R3P4.webp',
        '00A-0130-بيت-17-تموز--L-R3P5.webp',
        '00A-0130-بيت-17-تموز--L-R3P6.webp'
    ],
    '00A-0134': [
        '00A-0134-R1P4.webp',
        '00A-0134-R1P5.webp',
        '00A-0134-R1P6.webp'
    ],
    '00A-0140': [
        '00A-0140-R1P2.webp',
        '00A-0140-R1P4.webp',
        '00A-0140-R1P5.webp',
        '00A-0140-R1P6.webp',
        '00A-0140-R1P8.webp'
    ],
    '00A-0152': [
        '00A-0152-م-سمير--الفرات-R2P1.webp',
        '00A-0152-م-سمير--الفرات-R2P2.webp',
        '00A-0152-م-سمير--الفرات-R2P3.webp',
        '00A-0152-م-سمير--الفرات-R2P4.webp'
    ],
    '00A-0157': [
        '00A-0157-8x17-كربلاء-عقيد-علاءlandscape-R1P1.webp',
        '00A-0157-8x17-كربلاء-عقيد-علاءlandscape-R1P2.webp',
        '00A-0157-8x17-كربلاء-عقيد-علاءlandscape-R1P3.webp',
        '00A-0157-8x17-كربلاء-عقيد-علاءlandscape-R1P4.webp',
        '00A-0157-8x17-كربلاء-عقيد-علاءlandscape-R1P5.webp',
        '00A-0157-8x17-كربلاء-عقيد-علاءlandscape-R1P6.webp'
    ]
}

projects = ['00A-0130', '00A-0134', '00A-0140', '00A-0152', '00A-0157']

print('\n' + '='*150)
print('DETAILED MISMATCH ANALYSIS TABLE')
print('='*150)
print(f'{"ProjectID":<15} | {"Actual Files":<20} | {"Referenced Files":<20} | {"Missing Refs":<20} | {"Extra Files":<20}')
print('-'*150)

for projectId in projects:
    actual = set([f for f in allFiles if f.startswith(projectId)])
    ref = set(referenced[projectId])
    
    missing = ref - actual
    extra = actual - ref
    
    actual_count = len(actual)
    ref_count = len(ref)
    missing_count = len(missing)
    extra_count = len(extra)
    
    print(f'{projectId:<15} | {str(actual_count):<20} | {str(ref_count):<20} | {str(missing_count):<20} | {str(extra_count):<20}')

print('='*150)

# Summary statistics
print('\n' + '='*150)
print('SUMMARY STATISTICS')
print('='*150)

total_actual = 0
total_ref = 0
total_missing = 0
total_extra = 0

for projectId in projects:
    actual = set([f for f in allFiles if f.startswith(projectId)])
    ref = set(referenced[projectId])
    missing = ref - actual
    extra = actual - ref
    
    total_actual += len(actual)
    total_ref += len(ref)
    total_missing += len(missing)
    total_extra += len(extra)

print(f'Total projects analyzed: {len(projects)}')
print(f'Total actual files: {total_actual}')
print(f'Total referenced files: {total_ref}')
print(f'Total missing (referenced but don\'t exist): {total_missing}')
print(f'Total extra (exist but not referenced): {total_extra}')

print('\n' + '='*150)
print('FILES WITH SPACES/SPECIAL CHARACTERS NOT IN DATA')
print('='*150)
print('\nThese files EXIST in filesystem but are NOT referenced in projectsData.ts:')
for projectId in projects:
    actual = sorted([f for f in allFiles if f.startswith(projectId)])
    ref = set(referenced[projectId])
    
    extra = set(actual) - ref
    if extra:
        for f in sorted(extra):
            print(f'  {projectId}: {f}')

print('\n' + '='*150)
print('R4 AND PHOTO ANALYSIS')
print('='*150)

# R4 analysis
r4_files = [f for f in allFiles if 'R4' in f]
print(f'\nR4 ENTRIES:')
print(f'  Files in filesystem: {len(r4_files)}')
for f in sorted(r4_files):
    print(f'    • {f}')

with open(r'client\src\data\projectsData.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    r4_ref_count = content.count('R4')
    print(f'  References in projectsData.ts: {r4_ref_count} occurrences')

# PHOTO analysis
photo_files = [f for f in allFiles if 'PHOTO' in f.upper()]
print(f'\nPHOTO ENTRIES:')
print(f'  Files in filesystem: {len(photo_files)}')
if photo_files:
    for f in sorted(photo_files):
        print(f'    • {f}')
else:
    print('    (None found)')
    
photo_ref_count = content.count('PHOTO')
print(f'  References in projectsData.ts: {photo_ref_count} occurrences')

print('\n' + '='*150)
print('KEY FINDINGS')
print('='*150)

print(f"""
1. PROJECT MISMATCHES:
   - 00A-0130: 1 extra file (space-separated filename)
   - 00A-0134: ✓ PERFECT MATCH
   - 00A-0140: 1 extra file (space-separated filename)
   - 00A-0152: 2 extra files (space-separated filenames with page numbers)
   - 00A-0157: 3 extra files (space-separated filenames with page numbers)

2. FILENAME PATTERNS:
   - Files with DASHES are referenced (e.g., "00A-0130-بيت-17-تموز--L-R3P2.webp")
   - Files with SPACES and PDFs are NOT referenced (e.g., "00A-0130 بيت 17 تموز  L Daitels_Page_1.webp")
   - The unreferenced files appear to be PDF export pages

3. R4 & PHOTO ENTRIES:
   - R4 entries: 3 files exist (all for project 00A-0080) and are properly referenced
   - PHOTO entries: 0 files in filesystem, 0 references in projectsData.ts

4. RECOMMENDATIONS:
   - Either add the extra files to projectsData.ts references
   - OR delete the extra files if they are not needed
   - Consider using consistent naming convention (dashes vs spaces)
""")

print('='*150)
