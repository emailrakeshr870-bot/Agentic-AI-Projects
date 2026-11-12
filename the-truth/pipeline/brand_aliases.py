"""Map institution names as written by sources (e.g. "Chase Auto", "SECU NC") to the brand used in the database."""
import re
M={"chase auto":"Chase","chase":"Chase","bank of america":"Bank of America","u.s. bank":"U.S. Bank","pnc auto loans":"PNC","pnc":"PNC","truist auto loans":"Truist","truist":"Truist",
"huntington":"Huntington","huntington bank":"Huntington","frost bank":"Frost","becu":"BECU","schoolsfirst fcu":"SchoolsFirst","secu nc":"SECU","state employees' credit union (secu, nc)":"SECU",
"first tech fcu":"First Tech","first tech federal credit union":"First Tech","golden 1 credit union":"Golden 1","alliant credit union":"Alliant","america first credit union":"America First",
"mountain america credit union":"Mountain America","rbfcu":"RBFCU","suncoast credit union":"Suncoast","redwood credit union":"Redwood CU","penfed credit union":"PenFed",
"navy federal credit union":"Navy Federal","citizens bank":"Citizens","citizens":"Citizens","keybank":"KeyBank","regions":"Regions","m&t bank":"M&T Bank","fifth third":"Fifth Third",
"td bank":"TD Bank","zions bank":"Zions Bank","fremont bank":"Fremont Bank","wells fargo":"Wells Fargo","citi":"Citi","sofi":"SoFi","marcus by goldman sachs":"Marcus by Goldman Sachs",
"capital one":"Capital One","american express":"American Express","discover":"Discover","ally":"Ally","security service fcu":"Security Service","mechanics bank (california)":"Mechanics Bank"}
def brand(s):
    k=s.strip().lower()
    return M.get(k, s.strip())
