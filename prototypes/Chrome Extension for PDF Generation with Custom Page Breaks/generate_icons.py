#!/usr/bin/env python3
"""
Generate Chrome extension icons from SVG
"""

import os
from PIL import Image, ImageDraw
import cairosvg

def create_simple_icon(size, output_path):
    """Create a simple icon using PIL when SVG conversion fails"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw background circle
    margin = size // 8
    circle_size = size - 2 * margin
    draw.ellipse([margin, margin, margin + circle_size, margin + circle_size], 
                fill=(59, 130, 246, 255), outline=(29, 78, 216, 255), width=2)
    
    # Draw document rectangle
    doc_margin = size // 4
    doc_width = size // 2
    doc_height = int(size * 0.6)
    doc_x = (size - doc_width) // 2
    doc_y = doc_margin
    
    draw.rectangle([doc_x, doc_y, doc_x + doc_width, doc_y + doc_height], 
                  fill=(255, 255, 255, 255), outline=(200, 200, 200, 255), width=1)
    
    # Draw folded corner
    corner_size = size // 8
    corner_points = [
        (doc_x + doc_width - corner_size, doc_y),
        (doc_x + doc_width, doc_y + corner_size),
        (doc_x + doc_width, doc_y)
    ]
    draw.polygon(corner_points, fill=(220, 220, 220, 255))
    
    # Draw text lines
    line_height = max(1, size // 32)
    line_spacing = max(2, size // 16)
    start_y = doc_y + size // 8
    
    for i in range(3):
        line_width = doc_width - size // 8
        if i == 1:
            line_width = int(line_width * 0.8)
        elif i == 2:
            line_width = int(line_width * 0.6)
            
        draw.rectangle([doc_x + size // 16, start_y + i * line_spacing, 
                       doc_x + size // 16 + line_width, start_y + i * line_spacing + line_height], 
                      fill=(59, 130, 246, 180))
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created {output_path} ({size}x{size})")

def generate_icons():
    """Generate all required icon sizes"""
    base_dir = "/home/ubuntu/chrome-pdf-extension"
    icons_dir = os.path.join(base_dir, "assets", "icons")
    svg_path = os.path.join(icons_dir, "icon.svg")
    
    # Required sizes for Chrome extension
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        output_path = os.path.join(icons_dir, f"icon{size}.png")
        
        try:
            # Try to convert SVG to PNG using cairosvg
            cairosvg.svg2png(
                url=svg_path,
                write_to=output_path,
                output_width=size,
                output_height=size
            )
            print(f"Converted SVG to {output_path} ({size}x{size})")
        except Exception as e:
            print(f"SVG conversion failed for size {size}: {e}")
            print(f"Creating simple icon instead...")
            # Fallback to simple icon creation
            create_simple_icon(size, output_path)

if __name__ == "__main__":
    generate_icons()

