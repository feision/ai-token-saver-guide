import requests, urllib3, json
urllib3.disable_warnings()

BASE = 'http://localhost:8081/api/v1'
TOKEN = 'memos_pat_A87dHmU6XqCRJYNgRvbMMxLUQ6PzjjvG'
headers = {'Authorization': f'Bearer {TOKEN}'}

# 1. 创建 memo
r = requests.post(f'{BASE}/memos', headers={**headers, 'Content-Type': 'application/json'},
    json={'content': 'Test attachment upload', 'visibility': 'PRIVATE'}, verify=False)
memo = r.json()
memo_name = memo.get('name', '')
# 提取 id: memos/xxx -> xxx
memo_id = memo_name.split('/')[-1] if '/' in memo_name else memo_name
print(f"Created memo: {memo_name}, id={memo_id}")

# 2. 尝试上传 - 方式1: multipart/form-data 带 memoId
with open('C:\\Users\\Administrator\\Documents\\Codex\\9Router\\rtk-build-fix-report.md', 'rb') as f:
    files = {'file': ('test.md', f.read(), 'text/plain')}
    data = {'memoId': memo_id}
    r = requests.post(f'{BASE}/attachments', headers=headers, files=files, data=data, verify=False)
print(f"Upload with memoId: {r.status_code} - {r.text[:200]}")

# 3. 尝试方式2: 直接 file
with open('C:\\Users\\Administrator\\Documents\\Codex\\9Router\\rtk-build-fix-report.md', 'rb') as f:
    files = {'file': ('test.md', f.read(), 'text/plain')}
    r = requests.post(f'{BASE}/attachments', headers=headers, files=files, verify=False)
print(f"Upload direct: {r.status_code} - {r.text[:200]}")

# 4. 检查 GET attachments
r = requests.get(f'{BASE}/attachments', headers=headers, verify=False)
print(f"List attachments: {r.status_code} - {r.text[:200]}")
