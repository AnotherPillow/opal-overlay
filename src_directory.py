import os
if not os.path.exists('dist/Opal Overlay-win32-x64/resources/src'):
    os.makedirs('dist/Opal Overlay-win32-x64/resources/src')
import shutil;shutil.copy('src/who.vbs', 'dist/Opal Overlay-win32-x64/resources/src/')