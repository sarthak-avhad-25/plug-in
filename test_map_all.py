import json
import glob
import os

maps = glob.glob(".next/**/*.js.map", recursive=True)
maps.sort(key=os.path.getmtime, reverse=True)

for m in maps:
    try:
        with open(m, "r") as f:
            data = json.load(f)
            if "sections" in data:
                for section in data["sections"]:
                    if "map" in section:
                        smap = section["map"]
                        if "sources" in smap:
                            for s, c in zip(smap.get("sources", []), smap.get("sourcesContent", [])):
                                if "page.tsx" in s and "Headphones" in c:
                                    print(f"FOUND page.tsx with Headphones in {m}")
                                    with open("RECOVERED_PAGE.tsx", "w") as out:
                                        out.write(c)
                                    sys.exit(0)
    except Exception as e:
        pass
