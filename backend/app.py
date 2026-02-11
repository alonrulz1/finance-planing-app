import webview
import os
from finance_manager import FinanceManager
from api import Api

finance_manager = FinanceManager()
api = Api(finance_manager)

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

js_file = os.path.join(frontend_dir, 'main.js')
with open(js_file, 'r', encoding='utf-8') as f:
    js_content_main = f.read()

js_file = os.path.join(frontend_dir, 'apiUtil.js')
with open(js_file, 'r', encoding='utf-8') as f:
    js_content_api = f.read()

css_file = os.path.join(frontend_dir, 'style.css')
with open(css_file, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Inject JS at the end of <body>
html_content = html_content.replace("</body>", f"<script>{js_content_main} {js_content_api}</script></body>")

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
