import json
import sys

def try_recover(filename):
    try:
        with open(filename, "r") as f:
            data = json.load(f)
            if "sources" in data and "sourcesContent" in data:
                for src, content in zip(data["sources"], data["sourcesContent"]):
                    if "page.tsx" in src and "getFeaturedArtistPlaylists" in content:
                        print(f"FOUND IN {filename}!")
                        with open("RECOVERED_PAGE.tsx", "w") as out:
                            out.write(content)
                        return True
    except Exception as e:
        pass
    return False

files = [
    ".next/dev/server/chunks/ssr/[root-of-the-server]__0hrpnn2._.js.map",
    ".next/dev/server/chunks/ssr/[root-of-the-server]__1ot0tiw._.js.map",
    ".next/dev/static/chunks/src_app_1xyc5nz._.js.map"
]

for f in files:
    if try_recover(f):
        sys.exit(0)
print("Not found.")
