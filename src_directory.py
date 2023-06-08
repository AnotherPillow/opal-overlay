import os
if not os.path.exists('dist/Opal Overlay-win32-x64/resources/src'):
    os.makedirs('dist/Opal Overlay-win32-x64/resources/src')
import shutil;
#copy all from src to dist
shutil.copytree('src', 'dist/Opal Overlay-win32-x64/resources/src')