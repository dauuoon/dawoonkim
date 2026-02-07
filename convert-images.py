#!/usr/bin/env python3
import json
import os
import sys

os.chdir('/Users/dawoonkim/Desktop/dauuoon.github.io-main')

# 로컬 이미지 폴더에서 파일 읽기
project_images = {}
for proj_num in ['01', '02', '03', '04', '05']:
    proj_path = f'img/projects/{proj_num}'
    if os.path.exists(proj_path):
        files = sorted([f for f in os.listdir(proj_path) 
                       if f.lower().endswith(('.jpg', '.jpeg', '.gif', '.png'))])
        project_images[proj_num] = [f"{proj_path}/{f}" for f in files]
        print(f"Project {proj_num}: {len(files)} images found", file=sys.stderr)

# 기존 JSON 로드
try:
    with open('data/notion-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 각 프로젝트의 이미지 URL 업데이트
    for project in data['projects']:
        proj_num = project.get('number')
        proj_title = project.get('title')
        
        if proj_num in project_images:
            project['images'] = project_images[proj_num]
            print(f"✓ {proj_title}: {len(project['images'])} images updated", file=sys.stderr)
        elif proj_num:
            print(f"⚠ {proj_title}: No local images found for project {proj_num}", file=sys.stderr)
    
    # 변환된 JSON 저장
    with open('data/notion-data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✓ notion-data.json successfully updated", file=sys.stderr)
    
except FileNotFoundError as e:
    print(f"✗ Error: {e}", file=sys.stderr)
    sys.exit(1)
except json.JSONDecodeError as e:
    print(f"✗ JSON Error: {e}", file=sys.stderr)
    sys.exit(1)
