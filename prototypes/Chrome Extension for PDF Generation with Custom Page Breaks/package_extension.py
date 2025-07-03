#!/usr/bin/env python3
"""
Package Chrome PDF Extension for distribution
"""

import os
import zipfile
import shutil
from datetime import datetime

def create_package():
    """Create a distributable package of the Chrome extension"""
    
    base_dir = "/home/ubuntu"
    extension_dir = os.path.join(base_dir, "chrome-pdf-extension")
    
    # Create package directory
    package_dir = os.path.join(base_dir, "pdf-generator-pro-package")
    if os.path.exists(package_dir):
        shutil.rmtree(package_dir)
    os.makedirs(package_dir)
    
    # Files and directories to include in the package
    include_patterns = [
        "manifest.json",
        "README.md",
        "src/",
        "assets/",
        "styles/",
        "scripts/"
    ]
    
    # Files to exclude
    exclude_patterns = [
        ".git",
        ".gitignore",
        "__pycache__",
        "*.pyc",
        ".DS_Store",
        "Thumbs.db",
        "*.tmp"
    ]
    
    def should_include(path):
        """Check if a file/directory should be included"""
        for exclude in exclude_patterns:
            if exclude in path:
                return False
        return True
    
    # Copy extension files
    extension_package_dir = os.path.join(package_dir, "chrome-pdf-extension")
    os.makedirs(extension_package_dir)
    
    for item in include_patterns:
        src_path = os.path.join(extension_dir, item)
        dst_path = os.path.join(extension_package_dir, item)
        
        if os.path.isfile(src_path):
            # Copy file
            os.makedirs(os.path.dirname(dst_path), exist_ok=True)
            shutil.copy2(src_path, dst_path)
            print(f"Copied file: {item}")
        elif os.path.isdir(src_path):
            # Copy directory
            for root, dirs, files in os.walk(src_path):
                # Filter out excluded directories
                dirs[:] = [d for d in dirs if should_include(d)]
                
                for file in files:
                    if should_include(file):
                        src_file = os.path.join(root, file)
                        rel_path = os.path.relpath(src_file, extension_dir)
                        dst_file = os.path.join(extension_package_dir, rel_path)
                        
                        os.makedirs(os.path.dirname(dst_file), exist_ok=True)
                        shutil.copy2(src_file, dst_file)
            print(f"Copied directory: {item}")
    
    # Copy test page
    test_page_src = os.path.join(base_dir, "test-page.html")
    test_page_dst = os.path.join(package_dir, "test-page.html")
    if os.path.exists(test_page_src):
        shutil.copy2(test_page_src, test_page_dst)
        print("Copied test page")
    
    # Create installation guide
    install_guide = os.path.join(package_dir, "INSTALLATION.md")
    with open(install_guide, 'w') as f:
        f.write("""# PDF Generator Pro - Installation Guide

## Quick Start

1. **Extract the Package**
   - Extract all files from this package to a folder on your computer
   - Remember the location of the `chrome-pdf-extension` folder

2. **Install in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-pdf-extension` folder
   - The extension should now appear in your extensions list

3. **Test the Extension**
   - Open the included `test-page.html` file in Chrome
   - Click the PDF Generator Pro icon in the toolbar
   - Try generating a PDF to verify everything works

## Detailed Instructions

See the README.md file in the chrome-pdf-extension folder for complete documentation.

## Troubleshooting

- Make sure you select the `chrome-pdf-extension` folder, not the parent folder
- If the extension doesn't load, check the Chrome console for error messages
- Ensure you have Chrome 88+ for full compatibility

## Support

For issues or questions, refer to the troubleshooting section in README.md
""")
    
    # Create version info
    version_info = os.path.join(package_dir, "VERSION.txt")
    with open(version_info, 'w') as f:
        f.write(f"""PDF Generator Pro v1.0.0
Package created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Contents:
- chrome-pdf-extension/     Main extension files
- test-page.html           Test page for verification
- INSTALLATION.md          Installation instructions
- VERSION.txt              This file

Installation:
1. Extract all files
2. Open chrome://extensions/
3. Enable Developer mode
4. Click "Load unpacked"
5. Select the chrome-pdf-extension folder
""")
    
    # Create ZIP file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    zip_filename = f"pdf-generator-pro-v1.0.0_{timestamp}.zip"
    zip_path = os.path.join(base_dir, zip_filename)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_path = os.path.relpath(file_path, package_dir)
                zipf.write(file_path, arc_path)
    
    print(f"\\nPackage created successfully!")
    print(f"ZIP file: {zip_path}")
    print(f"Package directory: {package_dir}")
    
    # Print package contents
    print(f"\\nPackage contents:")
    for root, dirs, files in os.walk(package_dir):
        level = root.replace(package_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 2 * (level + 1)
        for file in files:
            print(f"{subindent}{file}")
    
    return zip_path, package_dir

if __name__ == "__main__":
    zip_path, package_dir = create_package()
    print(f"\\nExtension packaged successfully!")
    print(f"Ready for distribution: {zip_path}")

