This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## How to Drag & Drop (Developer Notes)

This timetable application implements a robust drag and drop system for moving scheduled entries between time slots. Here's what developers need to know:

### Drag & Drop Architecture

- **Implementation**: HTML5 native drag-and-drop API (not dnd-kit)
- **Utilities**: Centralized helpers in `utils/dnd.ts` for consistent ID management
- **Constraints**: Entries can only be moved within the same department row
- **Validation**: Real-time conflict detection for teacher and room scheduling

### ID Schema Convention

The system uses a 3-part ID convention for drag operations:

```
groupKey|departmentId|timeSlotId
```

**Why 3 parts?**
- `groupKey`: Identifies related entries (same subject + teacher) that move together
- `departmentId`: Enforces same-department constraint to prevent cross-department moves
- `timeSlotId`: Tracks current time slot for conflict detection and change validation

**Example**: `math-101-teacher-001|dept-cs|slot-09-00`

### Key Features

1. **Visual Feedback**: Custom drag overlay shows what's being moved
2. **Conflict Prevention**: Real-time validation prevents teacher/room double-booking
3. **Same-Department Constraint**: Entries cannot be moved across department boundaries
4. **Batch Operations**: Multiple day entries for the same subject/teacher move together
5. **Provisional Preview**: Shows destination feedback during drag operations

### Developer Usage

```typescript
import { buildDragId, parseDragId, createGroupKey } from '../utils/dnd';

// Create a consistent drag ID
const dragId = buildDragId(groupKey, departmentId, timeSlotId);

// Parse a drag ID back into components
const parts = parseDragId(dragId);
if (parts) {
  const { groupKey, departmentId, timeSlotId } = parts;
}

// Generate consistent group keys
const groupKey = createGroupKey(subjectId, teacherId);
```

See `utils/dnd.ts` for complete API documentation and defensive programming patterns.
