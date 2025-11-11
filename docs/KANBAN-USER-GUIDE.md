# Kanban Board User Guide

## Quick Start

### Moving Tasks (Drag & Drop)
1. Look for the **grip icon** (⋮⋮) on the left side of each task card
2. **Hover** over the grip icon - your cursor will change to a hand
3. **Click and hold** the grip icon
4. **Drag** the card to a different column (To Do, In Progress, Under Review, Done)
5. **Release** to drop the card in the new column
6. You'll see a success message confirming the move

### Viewing Task Details
1. **Click anywhere** on the task card (except the grip icon)
2. A modal will open showing:
   - Full task description
   - Priority level
   - Current status
   - Assigned team member
   - Due date
   - Created by information

### Editing Tasks
1. **Click on a task card** to open the detail view
2. **Click the "Edit" button** in the top right
3. The edit modal will open with all current information
4. **Make your changes**:
   - Update title
   - Modify description (supports Markdown)
   - Change priority (Low, Medium, High)
   - Update status
   - Reassign to team member
   - Set or change due date
5. **Click "Save"** to save your changes
6. You'll see a success message

### Creating New Tasks
1. **Click the "New Task" button** at the top of the board
2. **Fill in the form**:
   - Title (required)
   - Description (optional, supports Markdown)
   - Priority (Low, Medium, High)
   - Initial status (which column to start in)
   - Assignee (optional)
   - Due date (optional)
3. **Click "Create Task"**
4. The task will appear on the board immediately

### Deleting Tasks
1. **Open the task** by clicking on it
2. **Click "Edit"**
3. **Click the "Delete" button** at the bottom
4. **Confirm** the deletion
5. The task will be removed from the board

## Visual Indicators

### Task Card Elements
```
┌─────────────────────────────────────┐
│ ⋮⋮  Task Title              🚩 High │  ← Grip icon (drag) | Priority flag
│                                      │
│     Task description preview...      │  ← Click to view details
│                                      │
│     👤 John Doe        📅 Dec 15    │  ← Assignee | Due date
│                                      │
│     [Medium Priority]                │  ← Priority badge
└─────────────────────────────────────┘
```

### Cursor Changes
- **Grip icon hover**: 🖐️ Open hand (grab)
- **Grip icon drag**: ✊ Closed hand (grabbing)
- **Card content**: 👆 Pointer (clickable)

### Column Colors

#### Light Mode
- **To Do**: Gray background
- **In Progress**: Blue background
- **Under Review**: Yellow background
- **Done**: Green background

#### Dark Mode
- **To Do**: Dark gray with gray accent
- **In Progress**: Dark blue with blue accent
- **Under Review**: Dark yellow with yellow accent
- **Done**: Dark green with green accent

### Priority Colors
- **High**: 🔴 Red flag
- **Medium**: 🟡 Yellow flag
- **Low**: 🔵 Blue flag

## Keyboard Shortcuts

### Navigation
- **Tab**: Move between cards
- **Enter**: Open selected card
- **Escape**: Close modal

### Board Navigation
- **Cmd/Ctrl + 1**: Switch to Kanban tab
- **Cmd/Ctrl + 2**: Switch to Analytics tab
- **Cmd/Ctrl + 3**: Switch to Canvas tab
- **Cmd/Ctrl + 4**: Switch to Markdown tab
- **Cmd/Ctrl + 5**: Switch to Git tab

## Filters & Sorting

### Filter by Assignee
1. Click the **assignee dropdown** at the top
2. Select a team member to see only their tasks
3. Select "All assignees" to see everything

### Filter by Priority
1. Click the **priority dropdown** at the top
2. Select High, Medium, or Low
3. Select "All priorities" to see everything

### Sort Tasks
1. Click the **sort dropdown** at the top
2. Choose:
   - **Default order**: Manual positioning
   - **Priority**: High → Medium → Low
   - **Due date**: Earliest first

## Real-Time Collaboration

### Live Updates
- See the **Live** badge when connected
- Changes from other users appear automatically
- Your changes are broadcast to all team members
- No need to refresh the page

### Connection Status
- **🟢 Live**: Connected, real-time updates active
- **🔴 Offline**: Disconnected, changes saved but not broadcast

## Tips & Tricks

### Efficient Task Management
1. **Use the grip icon** for quick status changes
2. **Click the card** for detailed information
3. **Use filters** to focus on specific work
4. **Sort by priority** to tackle important tasks first
5. **Sort by due date** to meet deadlines

### Markdown in Descriptions
Task descriptions support Markdown formatting:
- **Bold**: `**text**`
- *Italic*: `*text*`
- Lists: `- item` or `1. item`
- Links: `[text](url)`
- Code: `` `code` ``
- Headings: `# Heading`

### Best Practices
1. **Keep titles concise** - Use description for details
2. **Set realistic due dates** - Help team plan work
3. **Assign tasks clearly** - Everyone knows their responsibilities
4. **Update status regularly** - Keep board accurate
5. **Use priority wisely** - Not everything is high priority

### Mobile Usage
- **Touch and hold** the grip icon to drag
- **Tap** the card to view details
- **Swipe** horizontally to see all columns
- All features work on mobile devices

## Troubleshooting

### Can't Drag Cards
- Make sure you're grabbing the **grip icon** (⋮⋮)
- Don't click the card content, only the grip
- Check your internet connection

### Edit Button Not Working
- Make sure you **clicked the card first** to open details
- Then click the **Edit button** in the modal
- Wait for the edit modal to open

### Changes Not Saving
- Check the **Live/Offline badge** at the top
- Look for error toast notifications
- Refresh the page if needed
- Check your internet connection

### Tasks Not Appearing
- Check your **filters** - you might be filtering them out
- Scroll through all columns
- Try refreshing the page

## Support

If you encounter issues:
1. Check this guide first
2. Look for error messages (red toast notifications)
3. Check your internet connection
4. Try refreshing the page
5. Contact your team administrator

## Accessibility

### Screen Reader Support
- All cards have proper labels
- Modals announce when opened
- Status changes are announced
- Keyboard navigation fully supported

### High Contrast Mode
- Works in both light and dark themes
- Clear visual indicators
- Color-blind friendly priority colors

### Touch Targets
- All interactive elements are at least 44x44px
- Easy to tap on mobile devices
- Sufficient spacing between elements
