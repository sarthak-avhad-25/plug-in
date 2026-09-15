import sys, re

path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

# 1. Remove old expand button (the one after headphones) - use regex
old_button_pattern = r"<button\s+onClick=\{\(\) => setIsLyricsExpanded\(!isLyricsExpanded\)\}\s+className=\"absolute right-0 p-2 text-white/40 hover:text-white transition-colors\"\s+title=\"Toggle Lyrics Width\"\s*>\s*{isLyricsExpanded \? <Minimize2 className=\"w-5 h-5\" \/> : <Maximize2 className=\"w-5 h-5\" \/>}\s*<\/button>"
content = re.sub(old_button_pattern, "", content, flags=re.DOTALL)

# 2. Insert new header before lyrics container
header = '''
                    {/* Lyrics Header */}
                    <div className="flex items-center justify-between px-4 py-2 border-t-2 border-[#333]">
                      <h2 className="text-lg font-bold text-white">Lyrics</h2>
                      <button
                        onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                        className="p-1 text-white hover:text-[#FF3366] transition-colors"
                        title="Toggle Lyrics Height"
                      >
                        {isLyricsExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </button>
                    </div>
'''
# Locate the comment "{/* LYRICS BOX */}" and insert header after it
content = content.replace('/* LYRICS BOX */', '/* LYRICS BOX */' + header)

# 3. Update lyrics container height and transition
content = re.sub(r'''className=\\"mt-4 border-t-2 border\[#333\] pt-4 overflow-y-auto overflow-x-hidden relative bg-transparent scrollbar-hide\\" \n\s*style=\{\{ height: \\"180px\\" \}\}''',
                 "className=\"mt-4 border-t-2 border-[#333] pt-4 overflow-y-auto overflow-x-hidden relative bg-transparent scrollbar-hide transition-all\" style={{ height: isLyricsExpanded ? '70vh' : '180px' }}", content)

# 4. Remove conditional font size in lyric lines
content = re.sub(r"\$\{isLyricsExpanded \? \"text-3xl md:text-5xl mb-6\" : \"text-xl md:text-3xl mb-4\"\}", "text-xl md:text-3xl mb-4", content)

with open(path, "w") as f:
    f.write(content)

print("Done")
