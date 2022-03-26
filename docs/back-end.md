# REST API

Listed by which hook in `src/Data.js` that will probably call them.

`useAppData` - session info, group membership data
    - POST /login
    - POST /logout
    - POST /register
    - POST /user/groups

`useUserEvents` - events from user's groups
    - GET /user/events

`useGroupData` - group info
    - GET /group/:id
    - POST /group/new
    - DELETE /group/:id
    - GET /group/:id/events

    - POST /group/:id/event/new
    - PUT /group/:id/event/:id
    - DELETE /group/:id/event/:id
    (should we have a single useEventData hook as well?)

`useGroupMemberData` - group membership information
    - GET /group/:id/members
    - PUT /group/:id/members
    - DELETE /group/:id/members

Misc
    - GET /images/:id
    - POST /images/:id
