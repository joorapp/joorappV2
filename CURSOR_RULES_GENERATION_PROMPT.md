# Cursor IDE Rules Generation Prompt

## Copy and paste this prompt into Cursor AI Chat:

---

**I want you to analyze my current project and generate comprehensive Cursor IDE rules (`.cursor/rules/*.mdc` files) similar to the JoorApp V2 project structure. These rules will guide the AI assistant in maintaining code consistency and best practices across the project.**

## Project Analysis Required

Please analyze my project and identify:

1. **Tech Stack & Framework**
   - Frontend framework (React, Vue, Angular, etc.)
   - Backend framework (Node.js, Python, etc.)
   - State management libraries
   - API/HTTP client libraries (axios, fetch, etc.)
   - Testing frameworks
   - Build tools

2. **Architecture Patterns**
   - File/folder structure
   - Component organization patterns
   - API integration patterns
   - Service layer patterns
   - Data fetching patterns

3. **Coding Standards**
   - Naming conventions (components, functions, files, constants)
   - Import organization
   - Code formatting preferences
   - TypeScript/JavaScript usage patterns

4. **Common Patterns**
   - How API calls are structured
   - How state is managed
   - How errors are handled
   - How validation is done
   - How translations/i18n is implemented (if any)
   - Common reusable components

5. **Prohibited Patterns**
   - What patterns should be avoided
   - Anti-patterns in the codebase

## Rules File Structure

Generate rule files following this structure:

### File Format:
Each `.mdc` file should have:

1. **YAML Frontmatter:**
```yaml
---
description: Brief description of what these rules cover
globs: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js"]  # File patterns this applies to
alwaysApply: true  # or false
priority: 1  # 1 is highest priority
---
```

2. **Content Structure:**
   - Clear headings (##, ###)
   - ✅ CORRECT patterns with code examples
   - ❌ WRONG/Prohibited patterns with code examples
   - Checklists where applicable
   - Step-by-step guides for common tasks
   - "Remember" sections for key points

### Required Rule Files:

1. **`_master.mdc`** - Master rules file with critical rules that always apply
   - List of most important rules
   - Quick reference
   - Prohibited patterns list
   - Links to other rule files

2. **`README.mdc`** - Rules index/overview
   - Required reading list
   - Quick reference
   - Links to all other rule files
   - Priority order for reading

3. **`api-architecture.mdc`** - API integration patterns (if applicable)
   - How API calls are structured
   - HTTP client configuration
   - Service layer patterns
   - Error handling in API calls
   - Request/response interceptors (if used)
   - Constants organization for API routes

4. **`component-structure.mdc`** - Component patterns (for frontend)
   - Component organization
   - File naming conventions
   - Component structure pattern
   - Directory structure
   - Hooks usage
   - State management patterns

5. **`coding-standards.mdc`** - General coding standards
   - Naming conventions
   - Code quality guidelines
   - Import rules
   - React/framework best practices
   - Performance guidelines
   - Prohibited patterns

6. **`data-handling.mdc`** - Data handling patterns (if applicable)
   - State initialization patterns
   - Empty state handling
   - Loading states
   - Error states
   - No mock data rules

7. **`validation.mdc`** - Form validation patterns (if applicable)
   - Validation utility location
   - Validation patterns
   - Error display patterns
   - Translation keys for validation

8. **`translation.mdc`** - Internationalization rules (if applicable)
   - Translation file structure
   - How to use translations
   - Translation key naming conventions
   - Adding new translations
   - Common translation categories

9. **`common-components.mdc`** - Reusable components guide (if applicable)
   - Available common components
   - Usage patterns
   - Constants usage
   - When to use vs create new

10. **`todo.mdc`** - Task management guidelines (optional)
    - TODO comment format
    - Code organization
    - Task prioritization

## Generation Instructions

For each rule file, generate:

1. **YAML frontmatter** with appropriate `globs`, `description`, `alwaysApply`, and `priority`

2. **Comprehensive rules** based on actual patterns found in my codebase:
   - Extract patterns from existing code
   - Document preferred approaches
   - Document anti-patterns to avoid

3. **Code examples** from my actual codebase style:
   - ✅ CORRECT examples showing the right way
   - ❌ WRONG examples showing what to avoid
   - Use realistic examples based on my project structure

4. **Clear structure** with:
   - Hierarchical headings
   - Bullet points for rules
   - Code blocks with syntax highlighting
   - Checklists where helpful

5. **"Remember" sections** highlighting critical points

6. **Links between files** where one rule file references another

## Output Format

Generate the files in this order:

1. First, show me a **summary** of what you found and what rules you'll create
2. Then generate each `.mdc` file with complete content
3. Save files to `.cursor/rules/` directory in the appropriate location (frontend/backend root)

## Priority Order

Generate rules in this priority:
1. `_master.mdc` - Most critical rules
2. `README.mdc` - Overview and navigation
3. Framework-specific rules (`api-architecture.mdc`, `component-structure.mdc`)
4. Supporting rules (`coding-standards.mdc`, `validation.mdc`, `data-handling.mdc`)
5. Optional rules (`todo.mdc`, `common-components.mdc`)

## Example Format Reference

Each rule file should follow this structure:

```markdown
---
description: [Brief description]
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: true
priority: 1
---

# Rule Title

## CRITICAL: Important Rule Header

### Absolute Requirements - NO EXCEPTIONS

1. **Rule 1** - Description
2. **Rule 2** - Description

## Pattern Section

### ✅ CORRECT:
```typescript
// Good example
const example = () => {};
```

### ❌ WRONG:
```typescript
// Bad example
const example = () => {};
```

## Checklist

- [ ] Item 1
- [ ] Item 2

## Remember

**Key takeaway points.**
```

---

**Now please analyze my project and generate comprehensive Cursor IDE rules based on the patterns you find in my codebase.**
