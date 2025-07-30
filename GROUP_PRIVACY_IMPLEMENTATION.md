# Group Privacy Implementation

## Overview

This document outlines the implementation of Public vs Private Group functionality for the Coffee Chat app. The system now supports two types of groups:

- **Public Groups**: Anyone can join instantly
- **Private Groups**: Users must request to join, and organizers can approve or decline requests

## Backend Implementation

### 1. Database Schema Updates

#### Group Model (`backend/models/Group.js`)
- Added `pendingRequests` array to store join requests
- Each request contains `userId` and `requestedAt` timestamp
- Privacy field already existed with 'public' and 'private' options

```javascript
pendingRequests: [{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedAt: { type: Date, default: Date.now }
}]
```

### 2. API Endpoints

#### Group Creation (`POST /api/groups`)
- Accepts `privacy` field in request body
- Defaults to 'public' if not specified
- Supports additional fields: `enableChat`, `enableEvents`, `rules`, `tags`

#### Join Group (`POST /api/groups/:id/join`)
- **Public Groups**: Adds user directly to members
- **Private Groups**: Adds user to pendingRequests
- Prevents duplicate requests
- Returns appropriate success messages

#### Get Pending Requests (`GET /api/groups/:id/pending-requests`)
- Only accessible by group organizer
- Returns list of pending requests with user details
- Populated with user information (name, email, profileImage)

#### Approve Request (`POST /api/groups/:id/approve/:userId`)
- Only accessible by group organizer
- Moves user from pendingRequests to members
- Removes request from pendingRequests

#### Reject Request (`POST /api/groups/:id/reject/:userId`)
- Only accessible by group organizer
- Removes request from pendingRequests
- User can request again later

### 3. Controller Functions

#### `joinGroup()`
- Checks if user is already a member
- Checks if user already has a pending request
- Handles different logic for public vs private groups
- Returns appropriate success messages

#### `approveRequest()`
- Validates organizer permissions
- Moves user to members array
- Removes from pending requests
- Returns success message

#### `rejectRequest()`
- Validates organizer permissions
- Removes request from pending requests
- Returns success message

#### `getPendingRequests()`
- Validates organizer permissions
- Returns populated pending requests
- Includes user details for display

## Frontend Implementation

### 1. Group Creation (`frontend/src/pages/CreateGroup/CreateGroup.jsx`)
- Privacy toggle already implemented
- Sends privacy setting to backend
- Supports public/private selection

### 2. Group Details (`frontend/src/pages/GroupDetails/GroupDetails.jsx`)
- Updated join button logic
- Shows different text based on privacy setting
- Displays "Request Pending" for users with pending requests
- Added "Manage Requests" button for organizers

#### Join Button States:
- **Public Group**: "Join Group"
- **Private Group**: "Request to Join"
- **Pending Request**: "Request Pending" (disabled)

### 3. Manage Requests Page (`frontend/src/pages/GroupDetails/ManageRequests.jsx`)
- New page for organizers to manage join requests
- Route: `/groups/:id/manage-requests`
- Shows list of pending requests with user details
- Approve/Reject buttons for each request
- Real-time updates after actions

#### Features:
- User avatars and information
- Request timestamps
- Approve/Reject actions
- Empty state when no requests
- Responsive design
- Premium warm theme styling

### 4. Routing (`frontend/src/AppRoutes.jsx`)
- Added route for ManageRequests component
- Protected route requiring authentication
- Redirects to login if not authenticated

## User Experience Flow

### Public Groups
1. User clicks "Join Group"
2. User is immediately added to group
3. Success message: "Successfully joined the group!"

### Private Groups
1. User clicks "Request to Join"
2. Request is sent to organizer
3. Button changes to "Request Pending" (disabled)
4. Success message: "Request sent — waiting for organizer approval"

### Organizer Management
1. Organizer sees "Manage Requests" button on group page
2. Clicks to navigate to `/groups/:id/manage-requests`
3. Views list of pending requests
4. Can approve or reject each request
5. Real-time updates after actions

## Security Features

### Authorization
- Only group organizers can view pending requests
- Only group organizers can approve/reject requests
- JWT token validation for all protected routes

### Validation
- Prevents duplicate join requests
- Prevents joining if already a member
- Validates group existence
- Validates user permissions

## Error Handling

### Backend Errors
- 404: Group not found
- 403: Unauthorized (not organizer)
- 400: Already a member or duplicate request
- 500: Server errors

### Frontend Error Handling
- Toast notifications for all actions
- Loading states during API calls
- Graceful error recovery
- User-friendly error messages

## Styling & Theme

### Design System
- Uses existing Coffee Chat theme
- Accent color: #FFAB36 (orange)
- Consistent with app's premium warm aesthetic
- Responsive design for all screen sizes

### Components
- Rounded cards with soft shadows
- Smooth hover animations
- Clear visual feedback for actions
- Consistent typography and spacing

## Testing

### Test Script (`test-group-privacy.js`)
- Comprehensive test suite for all endpoints
- Tests public and private group creation
- Tests join request functionality
- Tests approval/rejection flow

### Manual Testing Checklist
- [ ] Create public group
- [ ] Create private group
- [ ] Join public group (direct)
- [ ] Request to join private group
- [ ] View pending requests as organizer
- [ ] Approve join request
- [ ] Reject join request
- [ ] Verify proper error handling

## Future Enhancements

### Optional Features
1. **Notifications**: Email/push notifications for request status
2. **Invite Links**: Unique invite links for private groups
3. **Bulk Actions**: Approve/reject multiple requests at once
4. **Request History**: Track approved/rejected requests
5. **Auto-approval Rules**: Set criteria for automatic approval

### Performance Optimizations
1. **Pagination**: For groups with many pending requests
2. **Real-time Updates**: WebSocket integration for live updates
3. **Caching**: Cache group data to reduce API calls

## Deployment Notes

### Database Migration
- No migration required (new fields are optional)
- Existing groups default to 'public' privacy
- Backward compatible with existing data

### Environment Variables
- No new environment variables required
- Uses existing JWT configuration

### API Versioning
- All new endpoints are backward compatible
- Existing endpoints unchanged
- No breaking changes to current functionality

## Support

For questions or issues with the group privacy implementation:
1. Check the test script for API validation
2. Review error logs in backend console
3. Verify JWT token validity
4. Ensure proper user permissions

---

**Implementation Status**: ✅ Complete
**Last Updated**: [Current Date]
**Version**: 1.0.0 