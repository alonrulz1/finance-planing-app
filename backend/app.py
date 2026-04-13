import webview
import os
from finance_manager import FinanceManager
from api import Api

finance_manager = FinanceManager()
api = Api(finance_manager)

# Debug: Print available methods on API instance
print("API methods available:")
for attr in dir(api):
    if not attr.startswith('_'):
        print(f"  - {attr}")

# Function to handle file serving for libs directory
def serve_file(filename):
    """Serve files from the libs directory"""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    frontend_dir = os.path.join(base_dir, 'frontend')
    filepath = os.path.join(frontend_dir, 'libs', filename)
    
    # Security check - ensure the file is within the libs directory
    if os.path.abspath(filepath).startswith(os.path.abspath(os.path.join(frontend_dir, 'libs'))):
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
    return None

# Get the parent directory (project root)
base_dir = os.path.dirname(os.path.dirname(__file__))
frontend_dir = os.path.join(base_dir, 'frontend')

html_file = os.path.join(frontend_dir, 'index.html')
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Load all JS files in dependency order
js_files = [
    'dateUtil.js',
    'apiUtil.js',
    'uiManager.js',
    'main.js'
]

js_contents = {}
for js_file_name in js_files:
    js_file = os.path.join(frontend_dir, js_file_name)
    with open(js_file, 'r', encoding='utf-8') as f:
        js_contents[js_file_name] = f.read()

css_file = os.path.join(frontend_dir, 'style.css')
with open(css_file, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Remove all script tags from index.html to avoid conflicts
html_content = html_content.replace('<script src="libs/xlsx.full.min.js" defer></script>', '')
html_content = html_content.replace('<script src="dateUtil.js" defer></script>', '')
html_content = html_content.replace('<script src="apiUtil.js" defer></script>', '')
html_content = html_content.replace('<script src="uiManager.js" defer></script>', '')
html_content = html_content.replace('<script src="main.js" defer></script>', '')

# Inject all JS files at the end of <body> in correct dependency order
js_injection = '<script>'
for js_file_name in js_files:
    js_injection += js_contents[js_file_name] + '\n'
js_injection += '</script>'

html_content = html_content.replace("</body>", js_injection + "</body>")

html_content = html_content.replace("</head>", f"<style>{css_content}</style></head>")

webview.create_window(
    "Cash Flow Manager",
    html=html_content,
    js_api=api,
    width=800,   # starting width
    height=600,  # starting height
    resizable=True,
    min_size=(500, 500)
)
webview.start(debug=True)
