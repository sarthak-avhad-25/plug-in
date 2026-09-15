import json

with open(".next/dev/static/chunks/src_app_1xyc5nz._.js.map", "r") as f:
    data = json.load(f)
    print(data.keys())
    if "sections" in data:
        for section in data["sections"]:
            if "map" in section:
                m = section["map"]
                if "sources" in m:
                    for s, c in zip(m.get("sources", []), m.get("sourcesContent", [])):
                        if "page.tsx" in s:
                            print("FOUND PAGE.TSX in section!")
                            with open("RECOVERED_PAGE.tsx", "w") as out:
                                out.write(c)
