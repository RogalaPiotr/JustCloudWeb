import requests
from bs4 import BeautifulSoup
import re
import os
import sys

# Configuration
URL = "https://sessionize.com/piotr-rogala/"
FILE_PATH = "brand.html"
GITHUB_REPO = os.getenv('GITHUB_REPOSITORY', 'piotr-rogala/justcloudweb')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')

def get_sessionize_data():
    print(f"Fetching profile from {URL}...")
    response = requests.get(URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')

    data = {}

    # Name
    name_tag = soup.select_one('.c-s-speaker-info__name')
    if name_tag:
        data['fullName'] = name_tag.text.strip()
        print(f"Found name: {data['fullName']}")

    # Tagline
    tagline_tag = soup.select_one('.c-s-speaker-info__tagline')
    if tagline_tag:
        data['tagLine'] = tagline_tag.text.strip()

    # Photo
    img_tag = soup.select_one('.c-s-speaker-info__avatar img')
    if img_tag:
        data['profilePicture'] = img_tag.get('src')

    # Location
    loc_tag = soup.select_one('.c-s-speaker-info__location')
    if loc_tag:
        loc_text = loc_tag.get_text(strip=True)
        if ',' in loc_text:
            parts = loc_text.split(',')
            data['city'] = parts[0].strip()
            data['country'] = parts[1].strip()
        else:
            data['city'] = loc_text
            data['country'] = ""

    # Bio (EN)
    bio_en_tag = soup.find('div', {'v-if': "activeLanguage.speaker == 'en'"})
    if bio_en_tag:
        # Replace <br> with newlines
        for br in bio_en_tag.find_all("br"):
            br.replace_with("\n")
        data['bio'] = bio_en_tag.get_text().strip()

    # Bio (PL)
    bio_pl_tag = soup.find('div', {'v-if': "activeLanguage.speaker == 'pl'"})
    bio_pl = ""
    if bio_pl_tag:
        for br in bio_pl_tag.find_all("br"):
            br.replace_with("\n")
        bio_pl = bio_pl_tag.get_text().strip()

    # Links
    links = []
    links_group = soup.find('div', class_='c-s-speaker-info__group--links')
    if links_group:
        for link in links_group.select('.c-s-links__link'):
            url = link.get('href')
            label_tag = link.select_one('.o-label')
            title = label_tag.text.strip() if label_tag else "Link"
            
            # Determine linkType
            link_type = "Other"
            icon_use = link.select_one('use')
            href = icon_use.get('xlink:href', '') if icon_use else ''
            
            if 'twitter' in href: link_type = "Twitter"
            elif 'linkedin' in href: link_type = "LinkedIn"
            elif 'globe' in href or 'link' in href: link_type = "Company Website"
            
            # Fallback by title
            if "Twitter" in title or "@" in title: link_type = "Twitter"
            elif "LinkedIn" in title: link_type = "LinkedIn"
            elif "Blog" in title: link_type = "Blog"
            elif "Company" in title: link_type = "Company Website"
            elif "GitHub" in title: link_type = "GitHub"
            elif "BuyCoffee" in title: link_type = "Other"
            
            links.append({
                "title": title,
                "url": url,
                "linkType": link_type
            })
    data['links'] = links

    # Expertise and Topics
    categories = []
    sessions = []
    
    groups = soup.select('.c-s-speaker-info__group')
    for group in groups:
        title_tag = group.select_one('.c-s-speaker-info__group-title')
        if not title_tag:
            continue
            
        title_text = title_tag.text.strip()
        
        if "Expertise" in title_text:
            items = []
            for li in group.find_all('li'):
                items.append({"name": li.get_text(strip=True)})
            if items:
                categories.append({"categoryItems": items})
                
        elif "Topics" in title_text:
            for li in group.find_all('li'):
                sessions.append({"name": li.get_text(strip=True)})
    
    data['categories'] = categories
    data['sessions'] = sessions
    
    # QuestionAnswers (for Polish Bio)
    data['questionAnswers'] = [
        {
            "question": "Bio (Polski)",
            "answer": bio_pl
        }
    ]

    return data

def get_gh_pages_file():
    """Fetch brand.html from gh-pages branch"""
    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{FILE_PATH}?ref=gh-pages"
    headers = {}
    if GITHUB_TOKEN:
        headers['Authorization'] = f"token {GITHUB_TOKEN}"
    
    response = requests.get(api_url, headers=headers)
    if response.status_code != 200:
        print(f"Error: Could not fetch {FILE_PATH} from gh-pages branch (Status: {response.status_code})")
        sys.exit(1)
    
    import base64
    content = base64.b64decode(response.json()['content']).decode('utf-8')
    return content, response.json()['sha']

def update_file(data):
    # Get file from gh-pages branch
    try:
        content, file_sha = get_gh_pages_file()
    except Exception as e:
        print(f"Error fetching file from gh-pages: {e}")
        # Fallback to local file if it exists
        if os.path.exists(FILE_PATH):
            with open(FILE_PATH, 'r', encoding='utf-8') as f:
                content = f.read()
            file_sha = None
        else:
            print(f"Error: File {FILE_PATH} not found and could not fetch from gh-pages.")
            sys.exit(1)

    # Construct the new JS object string
    new_obj_str = "{\n"
    new_obj_str += f'        fullName: "{data.get("fullName", "")}",\n'
    new_obj_str += f'        tagLine: "{data.get("tagLine", "")}",\n'
    new_obj_str += f'        profilePicture: "{data.get("profilePicture", "")}",\n'
    new_obj_str += f'        city: "{data.get("city", "")}",\n'
    new_obj_str += f'        country: "{data.get("country", "")}",\n'
    
    # Bio with backticks
    bio = data.get("bio", "").replace("`", "\\`")
    new_obj_str += f'        bio: `{bio}`,\n'
    
    # Links
    new_obj_str += '        links: [\n'
    for link in data.get('links', []):
        new_obj_str += f'            {{ title: "{link["title"]}", url: "{link["url"]}", linkType: "{link["linkType"]}" }},\n'
    new_obj_str += '        ],\n'
    
    # Categories
    new_obj_str += '        categories: [\n'
    for cat in data.get('categories', []):
        new_obj_str += '            {\n'
        new_obj_str += '                categoryItems: [\n'
        for item in cat.get('categoryItems', []):
            new_obj_str += f'                    {{ name: "{item["name"]}" }},\n'
        new_obj_str += '                ]\n'
        new_obj_str += '            }\n'
    new_obj_str += '        ],\n'
    
    # Sessions
    new_obj_str += '        sessions: [\n'
    for session in data.get('sessions', []):
        new_obj_str += f'            {{ name: "{session["name"]}" }},\n'
    new_obj_str += '        ],\n'
    
    # QuestionAnswers
    new_obj_str += '        questionAnswers: [\n'
    for qa in data.get('questionAnswers', []):
        answer = qa['answer'].replace("`", "\\`")
        new_obj_str += '            {\n'
        new_obj_str += f'                question: "{qa["question"]}",\n'
        new_obj_str += f'                answer: `{answer}`\n'
        new_obj_str += '            }\n'
    new_obj_str += '        ]\n'
    new_obj_str += '    }'

    # Regex to replace the object
    pattern = r"(const sessionizeData = )\{[\s\S]*?\};"
    
    match = re.search(pattern, content)
    if match:
        new_content = content[:match.start(1)] + "const sessionizeData = " + new_obj_str + ";" + content[match.end():]
        
        # Only write if content changed
        if new_content != content:
            # If we have a file_sha, update via GitHub API (gh-pages branch)
            if file_sha:
                import base64
                encoded_content = base64.b64encode(new_content.encode()).decode()
                api_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{FILE_PATH}"
                headers = {
                    'Authorization': f"token {GITHUB_TOKEN}",
                    'Accept': 'application/vnd.github.v3+json'
                }
                data_payload = {
                    'message': 'chore: update sessionize profile',
                    'content': encoded_content,
                    'sha': file_sha,
                    'branch': 'gh-pages'
                }
                response = requests.put(api_url, json=data_payload, headers=headers)
                if response.status_code in [200, 201]:
                    print("Successfully updated brand.html on gh-pages branch")
                else:
                    print(f"Error updating file via GitHub API (Status: {response.status_code})")
                    sys.exit(1)
            else:
                # Fallback to local file write
                with open(FILE_PATH, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print("Successfully updated brand.html")
        else:
            print("No changes detected.")
    else:
        print("Could not find sessionizeData object in brand.html")
        sys.exit(1)

if __name__ == "__main__":
    try:
        data = get_sessionize_data()
        update_file(data)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)