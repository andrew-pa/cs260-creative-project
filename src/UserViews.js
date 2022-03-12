import React from 'react';
import { Link } from 'react-router-dom';
import { useUserEvents } from './Data.js';
import { CalendarView } from './CalendarView.js';
import { Feed } from './FeedView.js';

// Generic user-focused view with the user-oriented sidebar to the left and element component to the right
// the `element` function will be called with the user event data object as a prop
function UserView({user, element}) {
    const data = useUserEvents();

    return (
        <>
        <div className="col col-sm-3 col-md-3 col-xl-2 sidebar no-display-sm">
            <div className="profile-md">
                <img src={user.avatarSrc}/>
                <Link className="text" to="/">{user.name}</Link>
            </div>
            <hr className="main-shade-bordar"/>
            <ul className="group-list">
                {user.groups.map(group => (
                    <li key={group.id}>
                        <img src={group.iconSrc}/>
                        <Link to={"/group/" + group.id}>{group.name}</Link>
                    </li>
                ))}
                <li><Link to="/">Create new group...</Link></li>
            </ul>
        </div>
        <div className="container col row no-gutters">
            {element(data)}
        </div>
        </>
    );
}

export function UserFeedView({user}) {
    return (
        <UserView user={user} element={(data) => <Feed events={data.events}/>}/>
    );
}

export function UserCalendarView({user}) {
    return (<UserView user={user} element={(data) => <CalendarView events={data.events}/>}/>);
}
