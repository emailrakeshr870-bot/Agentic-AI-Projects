"""Build the self-contained dashboard page: dashboard/src/template.html + data/dashboard_data.json
-> dashboard/index.html (open it directly in a browser; no server needed).

Usage: python3 pipeline/build_dashboard.py
"""
from common import DATA, DASHBOARD

template = (DASHBOARD / "src" / "template.html").read_text()
data = (DATA / "dashboard_data.json").read_text().replace("</", "<\\/")
page = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n" \
       + template.replace("__DATA__", data, 1).replace("<style>", "<style>\n:root{color-scheme:light}\nbody{margin:0}\n[hidden]{display:none!important}", 1) \
       + "\n</html>\n"
# close <head> before the first visible element
page = page.replace("</style>\n\n<div class=\"wrap\">", "</style>\n</head>\n<body>\n<div class=\"wrap\">", 1)
page = page.replace("</script>\n\n</html>", "</script>\n</body>\n</html>")
(DASHBOARD / "index.html").write_text(page)
print(f"wrote dashboard/index.html ({len(page) // 1024} KB)")
