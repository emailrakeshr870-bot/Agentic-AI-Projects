# MCP Tool Descriptions

**Workflow:** 2 · MCP Server (Tool Registry)
**Role:** These are the tool descriptions exposed to the agent over MCP —
the agent selects and calls these based on the description text alone, so
the wording doubles as the tool's "prompt."

**`structure_bill`**
```
Convert raw bill text into a clean structured JSON with category-wise
(food/travel/hotel/others) tax-inclusive totals. Internally runs a
structuring agent, an arithmetic auditor, and a restructuring agent if the
audit fails.

You must use the tool defined such as Sub: Structure Bill
```

**`get_reimbursement_caps`**
```
Return the per-category reimbursement caps (food, travel, hotel) for an
employee based on their company position. Use this to find the maximum
allowable reimbursement amount per category. Input: emp_id (string, e.g.
"E001"). Output: { food: number, travel: number, hotel: number }
representing ceiling amounts.
```

**`get_past_utilization`**
```
Return the sum of an employee's already-claimed reimbursements per category
for the current policy period. Use this to check how much of each category
cap the employee has already consumed before approving a new bill. Input:
emp_id (string, e.g. "E001"). Output: { food: number, travel: number,
hotel: number } representing utilized-to-date amounts in the same currency
as the caps.
```
